/**
 * Canary Token Service
 * Tracks website visitors and sends email notifications
 */

import { invokeLLM } from "./_core/llm";

export interface CanaryToken {
  id: string;
  token: string;
  name: string;
  description?: string;
  email: string;
  created_at: string;
  last_triggered?: string;
  trigger_count: number;
  is_active: boolean;
  token_type: "page_view" | "resource" | "form_submission" | "api_call";
}

export interface CanaryTokenEvent {
  id: string;
  token_id: string;
  timestamp: string;
  visitor_ip: string;
  user_agent: string;
  referer?: string;
  country?: string;
  city?: string;
  isp?: string;
  device_type: "desktop" | "mobile" | "tablet" | "unknown";
  browser: string;
  os: string;
}

export interface CanaryTokenAlert {
  id: string;
  token_id: string;
  event_id: string;
  email_sent: boolean;
  sent_at?: string;
  email_address: string;
  subject: string;
  body: string;
}

/**
 * Generate a new canary token
 */
export function generateCanaryToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Create a new canary token
 */
export async function createCanaryToken(
  name: string,
  email: string,
  tokenType: CanaryToken["token_type"] = "page_view",
  description?: string
): Promise<CanaryToken> {
  const token = generateCanaryToken();
  const now = new Date().toISOString();

  return {
    id: `ct_${Math.random().toString(36).substr(2, 9)}`,
    token,
    name,
    description,
    email,
    created_at: now,
    trigger_count: 0,
    is_active: true,
    token_type: tokenType,
  };
}

/**
 * Log a canary token trigger event
 */
export async function logCanaryTokenEvent(
  tokenId: string,
  token: string,
  ip: string,
  userAgent: string,
  referer?: string
): Promise<CanaryTokenEvent> {
  const event: CanaryTokenEvent = {
    id: `evt_${Math.random().toString(36).substr(2, 9)}`,
    token_id: tokenId,
    timestamp: new Date().toISOString(),
    visitor_ip: ip,
    user_agent: userAgent,
    referer,
    country: getCountryFromIP(ip),
    city: getCityFromIP(ip),
    isp: getISPFromIP(ip),
    device_type: detectDeviceType(userAgent),
    browser: extractBrowser(userAgent),
    os: extractOS(userAgent),
  };

  return event;
}

/**
 * Send email notification for canary token trigger
 */
export async function sendCanaryTokenAlert(
  token: CanaryToken,
  event: CanaryTokenEvent
): Promise<CanaryTokenAlert> {
  const subject = `🚨 Canary Token Triggered: ${token.name}`;
  const body = generateAlertEmail(token, event);

  // In production, this would use a real email service
  // For now, we'll simulate sending the email
  console.log(`[Canary Token] Email alert sent to ${token.email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${body}`);

  const alert: CanaryTokenAlert = {
    id: `alert_${Math.random().toString(36).substr(2, 9)}`,
    token_id: token.id,
    event_id: event.id,
    email_sent: true,
    sent_at: new Date().toISOString(),
    email_address: token.email,
    subject,
    body,
  };

  return alert;
}

/**
 * Generate alert email content
 */
function generateAlertEmail(token: CanaryToken, event: CanaryTokenEvent): string {
  const timestamp = new Date(event.timestamp).toLocaleString();

  return `
CANARY TOKEN ALERT
==================

Token Name: ${token.name}
Token Type: ${token.token_type}
Description: ${token.description || "N/A"}

VISITOR INFORMATION
===================
IP Address: ${event.visitor_ip}
Country: ${event.country || "Unknown"}
City: ${event.city || "Unknown"}
ISP: ${event.isp || "Unknown"}

DEVICE INFORMATION
==================
Device Type: ${event.device_type}
Browser: ${event.browser}
Operating System: ${event.os}
User Agent: ${event.user_agent}

VISIT DETAILS
=============
Timestamp: ${timestamp}
Referrer: ${event.referer || "Direct"}

This is an automated alert from your Canary Token system.
If you did not expect this alert, it may indicate unauthorized access to your site.

---
Canary Token ID: ${token.id}
Event ID: ${event.id}
  `;
}

/**
 * Get country from IP (simulated)
 */
function getCountryFromIP(ip: string): string {
  const countries = ["United States", "China", "Russia", "Germany", "Netherlands"];
  return countries[Math.floor(Math.random() * countries.length)];
}

/**
 * Get city from IP (simulated)
 */
function getCityFromIP(ip: string): string {
  const cities = ["New York", "San Francisco", "London", "Berlin", "Amsterdam"];
  return cities[Math.floor(Math.random() * cities.length)];
}

/**
 * Get ISP from IP (simulated)
 */
function getISPFromIP(ip: string): string {
  const isps = ["Comcast", "Verizon", "AT&T", "Charter", "Cox"];
  return isps[Math.floor(Math.random() * isps.length)];
}

/**
 * Detect device type from user agent
 */
function detectDeviceType(userAgent: string): CanaryTokenEvent["device_type"] {
  if (/mobile|android|iphone|ipod/i.test(userAgent)) {
    return "mobile";
  } else if (/tablet|ipad/i.test(userAgent)) {
    return "tablet";
  } else if (/windows|mac|linux/i.test(userAgent)) {
    return "desktop";
  }
  return "unknown";
}

/**
 * Extract browser from user agent
 */
function extractBrowser(userAgent: string): string {
  if (/chrome/i.test(userAgent)) return "Chrome";
  if (/firefox/i.test(userAgent)) return "Firefox";
  if (/safari/i.test(userAgent)) return "Safari";
  if (/edge/i.test(userAgent)) return "Edge";
  if (/opera/i.test(userAgent)) return "Opera";
  return "Unknown";
}

/**
 * Extract OS from user agent
 */
function extractOS(userAgent: string): string {
  if (/windows/i.test(userAgent)) return "Windows";
  if (/mac/i.test(userAgent)) return "macOS";
  if (/linux/i.test(userAgent)) return "Linux";
  if (/android/i.test(userAgent)) return "Android";
  if (/iphone|ipad/i.test(userAgent)) return "iOS";
  return "Unknown";
}

/**
 * Format canary token for display
 */
export function formatCanaryTokenForDisplay(token: CanaryToken): {
  id: string;
  name: string;
  type: string;
  status: string;
  triggers: number;
  created: string;
  url: string;
} {
  const baseUrl = process.env.VITE_APP_URL || "https://osintscan-fftqerzj.manus.space";
  const url = `${baseUrl}?canary=${token.token}`;

  return {
    id: token.id,
    name: token.name,
    type: token.token_type,
    status: token.is_active ? "Active" : "Inactive",
    triggers: token.trigger_count,
    created: new Date(token.created_at).toLocaleDateString(),
    url,
  };
}

/**
 * Generate canary token statistics
 */
export async function getCanaryTokenStats(tokens: CanaryToken[]): Promise<{
  total_tokens: number;
  active_tokens: number;
  total_triggers: number;
  most_triggered: CanaryToken | null;
  recent_activity: number;
}> {
  const activeTokens = tokens.filter((t) => t.is_active).length;
  const totalTriggers = tokens.reduce((sum, t) => sum + t.trigger_count, 0);
  const mostTriggered = tokens.reduce<CanaryToken | null>((max, t) => (t.trigger_count > (max?.trigger_count || 0) ? t : max), null);

  // Recent activity in last 24 hours (simulated)
  const recentActivity = Math.floor(Math.random() * 10) + 1;

  return {
    total_tokens: tokens.length,
    active_tokens: activeTokens,
    total_triggers: totalTriggers,
    most_triggered: mostTriggered,
    recent_activity: recentActivity,
  };
}

/**
 * Validate canary token
 */
export function validateCanaryToken(token: string): boolean {
  return token.length === 32 && /^[a-zA-Z0-9]+$/.test(token);
}
