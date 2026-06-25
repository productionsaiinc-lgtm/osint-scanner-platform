import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { verifyEmail, searchCredentialLeaks } from "./osint";
import axios from "axios";
import * as dns from "dns/promises";

// Disposable email domain list (common ones)
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "tempmail.com", "guerrillamail.com", "10minutemail.com",
  "throwam.com", "yopmail.com", "trashmail.com", "fakeinbox.com",
  "dispostable.com", "sharklasers.com", "guerrillamailblock.com",
  "grr.la", "guerrillamail.info", "guerrillamail.biz", "guerrillamail.de",
  "guerrillamail.net", "guerrillamail.org", "spam4.me", "getairmail.com",
  "filzmail.com", "discard.email", "cfl.fr", "suremail.info",
]);

const emailLookupProcedure = protectedProcedure
  .input(z.object({ email: z.string().email() }))
  .mutation(async ({ input }) => {
    const { email } = input;
    const domain = email.split("@")[1]?.toLowerCase();

    const results: Record<string, any> = {
      email,
      domain,
      timestamp: new Date().toISOString(),
    };

    // 1. Validate + MX check
    const verification = await verifyEmail(email);
    results.valid = verification.valid ?? false;
    results.mxFound = (verification.mxRecords?.length ?? 0) > 0;
    results.mxRecords = verification.mxRecords ?? [];
    results.smtpValid = false; // intentionally not checked
    results.disposable = DISPOSABLE_DOMAINS.has(domain);

    // 2. WHOIS / domain info via public API
    try {
      const whoisRes = await axios.get(
        `https://api.whois.vu/?q=${encodeURIComponent(domain)}`,
        { timeout: 6000 }
      );
      const w = whoisRes.data;
      results.domainInfo = {
        registrar: w?.registrar ?? null,
        created: w?.created ?? null,
        expires: w?.expires ?? null,
        country: w?.country ?? null,
      };
    } catch {
      results.domainInfo = null;
    }

    // 3. Breach check via Have I Been Pwned (if key configured)
    const breachResult = await searchCredentialLeaks(email);
    if (breachResult.success) {
      results.breachCount = breachResult.breaches?.length ?? 0;
      results.breaches = breachResult.breaches ?? [];
      results.breachRecommendations = breachResult.recommendations ?? [];
    } else {
      results.breachCount = null;
      results.breaches = [];
      results.breachNote = breachResult.error ?? "Breach check unavailable — HIBP_API_KEY not configured";
    }

    // 4. Gravatar check (public — checks if email has a profile pic)
    try {
      const crypto = await import("crypto");
      const hash = crypto.createHash("md5").update(email.trim().toLowerCase()).digest("hex");
      const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=404`;
      const gRes = await axios.head(gravatarUrl, { timeout: 4000, validateStatus: s => s === 200 || s === 404 });
      results.gravatarFound = gRes.status === 200;
      results.gravatarUrl = gRes.status === 200 ? `https://www.gravatar.com/avatar/${hash}` : null;
    } catch {
      results.gravatarFound = false;
      results.gravatarUrl = null;
    }

    return { success: true, ...results };
  });

export const emailLookupRouter = router({
  lookup: emailLookupProcedure,
});
