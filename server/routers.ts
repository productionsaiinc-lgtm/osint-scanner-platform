import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createScan, getUserScans, updateScan, createDiscoveredHost, getScanHosts, createDomainRecord, getScanDomains, createSocialProfile, getScanProfiles } from "./db";
import { invokeLLM } from "./_core/llm";
import { getIPGeolocation, simulatePortScan, simulatePing, simulateTraceroute, simulateDNSLookup, simulateWHOISLookup, simulateSubdomainEnum, simulateSSLLookup, simulateSocialMediaSearch, advancedPortScan, osFingerprinting, reverseDNSLookup, verifyEmail, asnLookup, searchCVE, detectWebTechnology, analyzeSecurityHeaders, searchGitHubRepos, searchWaybackMachine, searchCredentialLeaks } from "./osint";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Scan operations
  scans: router({
    // Get user's recent scans
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }).optional())
      .query(async ({ ctx, input }) => {
        const scans: any = await getUserScans(ctx.user.id, input?.limit || 50);
        return (scans || []).map((scan: any) => ({
          ...scan,
          rawResults: scan.rawResults ? JSON.parse(scan.rawResults) : null,
          threatAnalysis: scan.threatAnalysis ? JSON.parse(scan.threatAnalysis) : null,
        }));
      }),

    // Create a new scan
    create: protectedProcedure
      .input(z.object({
        scanType: z.enum(["network", "domain", "social"]),
        target: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const scan: any = await createScan({
          userId: ctx.user.id,
          scanType: input.scanType,
          target: input.target,
          status: "pending",
        } as any);
        return scan;
      }),

    // Update scan with results
    updateResults: protectedProcedure
      .input(z.object({
        scanId: z.number(),
        rawResults: z.record(z.string(), z.any()).optional(),
        status: z.enum(["pending", "running", "completed", "error"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateScan(input.scanId, {
          rawResults: JSON.stringify(input.rawResults) as any,
          status: input.status,
        } as any);
        return { success: true };
      }),

    // Generate threat analysis using LLM
    generateThreatAnalysis: protectedProcedure
      .input(z.object({
        scanId: z.number(),
        scanType: z.string(),
        target: z.string(),
        results: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const prompt = `You are a cybersecurity expert. Analyze the following ${input.scanType} scan results for target "${input.target}" and provide:
1. A brief executive summary (2-3 sentences)
2. Key findings and discovered assets
3. Potential vulnerabilities or security concerns
4. Risk level assessment (Low/Medium/High/Critical)
5. Recommended next steps

Scan Results:
${JSON.stringify(input.results, null, 2)}

Provide the analysis in a clear, structured format suitable for security professionals.`;

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are a cybersecurity expert providing threat analysis and reconnaissance reports.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          });

          const analysis = (response.choices[0].message as any).content;
          
          await updateScan(input.scanId, {
            threatAnalysis: JSON.stringify({ analysis }) as any,
          } as any);

          return { analysis };
        } catch (error) {
          console.error("LLM analysis failed:", error);
          return { analysis: "Analysis generation failed. Please try again." };
        }
      }),

    // Add discovered hosts
    addHost: protectedProcedure
      .input(z.object({
        scanId: z.number(),
        ipAddress: z.string(),
        hostname: z.string().optional(),
        openPorts: z.array(z.number()).optional(),
        services: z.array(z.string()).optional(),
        geolocation: z.object({
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          country: z.string().optional(),
          city: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const host: any = await createDiscoveredHost({
          scanId: input.scanId,
          ipAddress: input.ipAddress,
          hostname: input.hostname,
          openPorts: input.openPorts ? JSON.stringify(input.openPorts) : null,
          services: input.services ? JSON.stringify(input.services) : null,
          geolocation: input.geolocation ? JSON.stringify(input.geolocation) : null,
        });
        return host;
      }),

    // Get hosts for a scan
    getHosts: protectedProcedure
      .input(z.object({ scanId: z.number() }))
      .query(async ({ input }) => {
        const hosts: any = await getScanHosts(input.scanId);
        return (hosts || []).map((host: any) => ({
          ...host,
          openPorts: host.openPorts ? JSON.parse(host.openPorts) : [],
          services: host.services ? JSON.parse(host.services) : [],
          geolocation: host.geolocation ? JSON.parse(host.geolocation) : null,
        }));
      }),

    // Add domain record
    addDomain: protectedProcedure
      .input(z.object({
        scanId: z.number(),
        domain: z.string(),
        registrar: z.string().optional(),
        registrationDate: z.string().optional(),
        expirationDate: z.string().optional(),
        nameservers: z.array(z.string()).optional(),
        dnsRecords: z.record(z.string(), z.unknown()).optional(),
        sslCertificate: z.record(z.string(), z.unknown()).optional(),
        subdomains: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const domain: any = await createDomainRecord({
          scanId: input.scanId,
          domain: input.domain,
          registrar: input.registrar,
          registrationDate: input.registrationDate,
          expirationDate: input.expirationDate,
          nameservers: input.nameservers ? JSON.stringify(input.nameservers) : null,
          dnsRecords: input.dnsRecords ? JSON.stringify(input.dnsRecords) : null,
          sslCertificate: input.sslCertificate ? JSON.stringify(input.sslCertificate) : null,
          subdomains: input.subdomains ? JSON.stringify(input.subdomains) : null,
        });
        return domain;
      }),

    // Get domains for a scan
    getDomains: protectedProcedure
      .input(z.object({ scanId: z.number() }))
      .query(async ({ input }) => {
        const domains: any = await getScanDomains(input.scanId);
        return (domains || []).map((domain: any) => ({
          ...domain,
          nameservers: domain.nameservers ? JSON.parse(domain.nameservers) : [],
          dnsRecords: domain.dnsRecords ? JSON.parse(domain.dnsRecords) : {},
          sslCertificate: domain.sslCertificate ? JSON.parse(domain.sslCertificate) : null,
          subdomains: domain.subdomains ? JSON.parse(domain.subdomains) : [],
        }));
      }),

    // Add social media profile
    addProfile: protectedProcedure
      .input(z.object({
        scanId: z.number(),
        username: z.string(),
        platform: z.string(),
        profileUrl: z.string().optional(),
        displayName: z.string().optional(),
        bio: z.string().optional(),
        followers: z.number().optional(),
        following: z.number().optional(),
        profileData: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile: any = await createSocialProfile({
          scanId: input.scanId,
          username: input.username,
          platform: input.platform,
          profileUrl: input.profileUrl,
          displayName: input.displayName,
          bio: input.bio,
          followers: input.followers,
          following: input.following,
          profileData: input.profileData ? JSON.stringify(input.profileData) : null,
        });
        return profile;
      }),

    // Get profiles for a scan
    getProfiles: protectedProcedure
      .input(z.object({ scanId: z.number() }))
      .query(async ({ input }) => {
        const profiles: any = await getScanProfiles(input.scanId);
        return (profiles || []).map((profile: any) => ({
          ...profile,
          profileData: profile.profileData ? JSON.parse(profile.profileData) : {},
        }));
      }),

    // Execute network scan
    executeNetworkScan: protectedProcedure
      .input(z.object({
        target: z.string(),
        scanId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          await updateScan(input.scanId, { status: "running" } as any);

          // Run all network scans in parallel
          const [geoData, portData, pingData, traceData] = await Promise.all([
            getIPGeolocation(input.target),
            simulatePortScan(input.target),
            simulatePing(input.target),
            simulateTraceroute(input.target),
          ]);

          const results = {
            geolocation: geoData,
            ports: portData,
            ping: pingData,
            traceroute: traceData,
          };

          // Store discovered host if geolocation succeeded
          if (geoData.success) {
            await createDiscoveredHost({
              scanId: input.scanId,
              ipAddress: input.target,
              openPorts: portData.success ? JSON.stringify(portData.openPorts) : null,
              services: portData.success && portData.ports ? JSON.stringify(portData.ports.map((p: any) => p.service)) : null,
              geolocation: JSON.stringify({
                latitude: geoData.latitude,
                longitude: geoData.longitude,
                country: geoData.country,
                city: geoData.city,
              }),
            } as any);
          }

          await updateScan(input.scanId, {
            rawResults: JSON.stringify(results) as any,
            status: "completed",
          } as any);

          return { success: true, results };
        } catch (error) {
          console.error("Network scan error:", error);
          await updateScan(input.scanId, { status: "error" } as any);
          return { success: false, error: "Network scan failed" };
        }
      }),

    // Execute domain scan
    executeDomainScan: protectedProcedure
      .input(z.object({
        target: z.string(),
        scanId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          await updateScan(input.scanId, { status: "running" } as any);

          // Run all domain scans in parallel
          const [dnsData, whoisData, subdomainData, sslData] = await Promise.all([
            simulateDNSLookup(input.target),
            simulateWHOISLookup(input.target),
            simulateSubdomainEnum(input.target),
            simulateSSLLookup(input.target),
          ]);

          const results = {
            dns: dnsData,
            whois: whoisData,
            subdomains: subdomainData,
            ssl: sslData,
          };

          // Store domain record
          await createDomainRecord({
            scanId: input.scanId,
            domain: input.target,
            registrar: whoisData.success ? whoisData.registrar : undefined,
            registrationDate: whoisData.success ? whoisData.registrationDate : undefined,
            expirationDate: whoisData.success ? whoisData.expirationDate : undefined,
            nameservers: whoisData.success ? JSON.stringify(whoisData.nameservers) : null,
            dnsRecords: dnsData.success ? JSON.stringify(dnsData.records) : null,
            sslCertificate: sslData.success ? JSON.stringify(sslData.certificate) : null,
            subdomains: subdomainData.success ? JSON.stringify(subdomainData.subdomains) : null,
          } as any);

          await updateScan(input.scanId, {
            rawResults: JSON.stringify(results) as any,
            status: "completed",
          } as any);

          return { success: true, results };
        } catch (error) {
          console.error("Domain scan error:", error);
          await updateScan(input.scanId, { status: "error" } as any);
          return { success: false, error: "Domain scan failed" };
        }
      }),

    // Execute social media scan
    executeSocialScan: protectedProcedure
      .input(z.object({
        target: z.string(),
        scanId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          await updateScan(input.scanId, { status: "running" } as any);

          const results = await simulateSocialMediaSearch(input.target);

          // Store social profiles
          if (results.success && results.results) {
            for (const profile of results.results) {
              await createSocialProfile({
                scanId: input.scanId,
                username: input.target,
                platform: profile.platform,
                profileUrl: profile.profileUrl,
                displayName: profile.displayName,
                bio: profile.bio,
                followers: profile.followers,
                following: profile.following,
                profileData: JSON.stringify(profile),
              } as any);
            }
          }

          await updateScan(input.scanId, {
            rawResults: JSON.stringify(results) as any,
            status: "completed",
          } as any);

          return { success: true, results };
        } catch (error) {
          console.error("Social media scan error:", error);
          await updateScan(input.scanId, { status: "error" } as any);
          return { success: false, error: "Social media scan failed" };
        }
      }),

    // Advanced port scan with service detection
    advancedPortScan: protectedProcedure
      .input(z.object({
        target: z.string(),
        scanId: z.number(),
        aggressive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          await updateScan(input.scanId, { status: "running" } as any);
          const results = await advancedPortScan(input.target, { aggressive: input.aggressive });
          await updateScan(input.scanId, {
            rawResults: JSON.stringify(results) as any,
            status: "completed",
          } as any);
          return { success: true, results };
        } catch (error) {
          console.error("Advanced port scan error:", error);
          await updateScan(input.scanId, { status: "error" } as any);
          return { success: false, error: "Advanced port scan failed" };
        }
      }),

    // OS Fingerprinting
    osFingerprint: protectedProcedure
      .input(z.object({ target: z.string(), scanId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const results = await osFingerprinting(input.target);
          return { success: true, results };
        } catch (error) {
          return { success: false, error: "OS fingerprinting failed" };
        }
      }),

    // Reverse DNS Lookup
    reverseDNS: protectedProcedure
      .input(z.object({ target: z.string() }))
      .query(async ({ input }) => {
        try {
          const results = await reverseDNSLookup(input.target);
          return { success: true, results };
        } catch (error) {
          return { success: false, error: "Reverse DNS lookup failed" };
        }
      }),

    // Email Verification
    verifyEmailAddress: protectedProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        try {
          const results = await verifyEmail(input.email);
          return { success: true, results };
        } catch (error) {
          return { success: false, error: "Email verification failed" };
        }
      }),

    // ASN Lookup
    asnLookupScan: protectedProcedure
      .input(z.object({ target: z.string() }))
      .query(async ({ input }) => {
        try {
          const results = await asnLookup(input.target);
          return { success: true, results };
        } catch (error) {
          return { success: false, error: "ASN lookup failed" };
        }
      }),

    // CVE Search
    searchCVEDatabase: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        try {
          const results = await searchCVE(input.query);
          return { success: true, results };
        } catch (error) {
          return { success: false, error: "CVE search failed" };
        }
      }),

    // Web Technology Detection
    detectTechnology: protectedProcedure
      .input(z.object({ domain: z.string() }))
      .query(async ({ input }) => {
        try {
          const results = await detectWebTechnology(input.domain);
          return { success: true, results };
        } catch (error) {
          return { success: false, error: "Web technology detection failed" };
        }
      }),

    // Security Header Analysis
    analyzeHeaders: protectedProcedure
      .input(z.object({ domain: z.string() }))
      .query(async ({ input }) => {
        try {
          const results = await analyzeSecurityHeaders(input.domain);
          return { success: true, results };
        } catch (error) {
          return { success: false, error: "Security header analysis failed" };
        }
      }),

    // GitHub Repository Search
    searchGitHub: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        try {
          const results = await searchGitHubRepos(input.query);
          return { success: true, results };
        } catch (error) {
          return { success: false, error: "GitHub search failed" };
        }
      }),

    // Wayback Machine Search
    searchWayback: protectedProcedure
      .input(z.object({ domain: z.string() }))
      .query(async ({ input }) => {
        try {
          const results = await searchWaybackMachine(input.domain);
          return { success: true, results };
        } catch (error) {
          return { success: false, error: "Wayback Machine search failed" };
        }
      }),

    // Credential Leak Search
    searchBreaches: protectedProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        try {
          const results = await searchCredentialLeaks(input.email);
          return { success: true, results };
        } catch (error) {
          return { success: false, error: "Credential leak search failed" };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
