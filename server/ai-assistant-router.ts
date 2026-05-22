import { z } from "zod";
import { invokeLLM, type Message } from "./_core/llm";
import { protectedProcedure, router } from "./_core/trpc";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

const SYSTEM_PROMPT = `You are the built-in AI assistant for OSINT Scanner Platform.

Help users understand the platform, choose tools, interpret scan results, plan lawful OSINT workflows, and troubleshoot configuration.

Security rules:
- Assume work must be authorized and defensive.
- Do not provide instructions for credential theft, evasion, persistence, malware, unauthorized exploitation, or bypassing access controls.
- For risky requests, redirect to safe validation, hardening, documentation, and reporting steps.
- Be concise, practical, and specific to OSINT Scanner Platform features when possible.

Platform context:
- Core tools include Network Scanner, Domain OSINT, Shodan, DNS Enumeration, WHOIS, SSL Analyzer, WAF Detection, Subdomain Takeover checks, CVE search, Malware Analyzer, File Analyzer, MDM, Virtual Computers, Virtual Phones, Canary Tokens, Cloud Storage, and monitoring.
- Some tools require provider keys such as SHODAN_API_KEY, SECURITYTRAILS_API_KEY, VIRUSTOTAL_API_KEY, HIBP_API_KEY, HUNTER_API_KEY, IPQUALITYSCORE_API_KEY, AVIATIONSTACK_API_KEY, NUMVERIFY_API_KEY, ABSTRACT_PHONE_API_KEY, and infrastructure keys documented in API_KEYS_REQUIRED.md.`;

export const aiAssistantRouter = router({
  chat: protectedProcedure
    .input(
      z.object({
        messages: z.array(chatMessageSchema).min(1).max(20),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const recentMessages = input.messages.slice(-12);
        const messages: Message[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...recentMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ];

        const result = await invokeLLM({ messages });
        const content = result.choices[0]?.message?.content;
        const reply = Array.isArray(content)
          ? content.map((part) => (part.type === "text" ? part.text : "")).join("\n").trim()
          : String(content || "").trim();

        return {
          success: true,
          reply: reply || "I could not generate a response.",
          model: result.model,
          usage: result.usage,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "AI assistant request failed",
        };
      }
    }),
});
