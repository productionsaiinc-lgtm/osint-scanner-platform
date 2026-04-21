import nodemailer from "nodemailer";
import { getDb } from "./db";
import { canaryTokens, canaryTokenTriggers } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export interface EmailAlertConfig {
  enabled: boolean;
  email: string;
  alertOnTrigger: boolean;
  alertOnScan: boolean;
  dailyDigest: boolean;
}

/**
 * Send email notification when a Canary Token is triggered
 */
export async function sendTokenTriggerAlert(
  tokenId: string,
  triggerData: any
) {
  try {
    const db = await getDb();
    if (!db) return;
    
    const token = await db
      .select()
      .from(canaryTokens)
      .where(eq(canaryTokens.id, tokenId))
      .limit(1);

    if (!token || token.length === 0) return;

    const canaryToken = token[0];
    const userEmail = canaryToken.email;

    const emailContent = `
      <h2>🚨 Canary Token Triggered!</h2>
      <p><strong>Token Name:</strong> ${canaryToken.name}</p>
      <p><strong>Token Type:</strong> ${canaryToken.tokenType}</p>
      <p><strong>Triggered At:</strong> ${new Date().toISOString()}</p>
      <p><strong>Trigger Details:</strong></p>
      <pre>${JSON.stringify(triggerData, null, 2)}</pre>
      <p>
        <a href="https://osintscan-fftqerzj.manus.space/canary-tokens/${tokenId}">
          View Token Details
        </a>
      </p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `🚨 ALERT: Canary Token "${canaryToken.name}" Triggered`,
      html: emailContent,
    });

    console.log(`Email alert sent to ${userEmail} for token ${tokenId}`);
  } catch (error) {
    console.error("Failed to send email alert:", error);
  }
}

/**
 * Send real-time threat alert via email
 */
export async function sendThreatAlert(
  userEmail: string,
  threatLevel: "low" | "medium" | "high" | "critical",
  threatDescription: string,
  affectedAssets: string[]
) {
  try {
    const colorMap = {
      low: "#FFA500",
      medium: "#FF6B6B",
      high: "#FF0000",
      critical: "#8B0000",
    };

    const emailContent = `
      <h2 style="color: ${colorMap[threatLevel]};">⚠️ Threat Alert - ${threatLevel.toUpperCase()}</h2>
      <p><strong>Threat Level:</strong> <span style="color: ${colorMap[threatLevel]}; font-weight: bold;">${threatLevel.toUpperCase()}</span></p>
      <p><strong>Description:</strong> ${threatDescription}</p>
      <p><strong>Affected Assets:</strong></p>
      <ul>
        ${affectedAssets.map((asset) => `<li>${asset}</li>`).join("")}
      </ul>
      <p><strong>Alert Time:</strong> ${new Date().toISOString()}</p>
      <p>
        <a href="https://osintscan-fftqerzj.manus.space/alert-history">
          View All Alerts
        </a>
      </p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `⚠️ THREAT ALERT: ${threatLevel.toUpperCase()} - ${threatDescription.substring(0, 50)}...`,
      html: emailContent,
    });

    console.log(`Threat alert sent to ${userEmail}`);
  } catch (error) {
    console.error("Failed to send threat alert:", error);
  }
}

/**
 * Send daily digest of all alerts and scans
 */
export async function sendDailyDigest(userEmail: string, summary: any) {
  try {
    const emailContent = `
      <h2>📊 Daily Security Digest</h2>
      <p><strong>Date:</strong> ${new Date().toDateString()}</p>
      
      <h3>Summary</h3>
      <ul>
        <li>Total Scans: ${summary.totalScans}</li>
        <li>Threats Detected: ${summary.threatsDetected}</li>
        <li>Canary Tokens Triggered: ${summary.tokensTriggered}</li>
        <li>Critical Alerts: ${summary.criticalAlerts}</li>
      </ul>
      
      <h3>Recent Activity</h3>
      ${summary.recentActivity.map((item: any) => `<p>• ${item}</p>`).join("")}
      
      <p>
        <a href="https://osintscan-fftqerzj.manus.space/dashboard">
          View Full Dashboard
        </a>
      </p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `📊 Daily Security Digest - ${new Date().toDateString()}`,
      html: emailContent,
    });

    console.log(`Daily digest sent to ${userEmail}`);
  } catch (error) {
    console.error("Failed to send daily digest:", error);
  }
}

/**
 * Get user's email alert preferences
 */
export async function getUserEmailPreferences(userId: string): Promise<EmailAlertConfig> {
  // This would be retrieved from database in production
  return {
    enabled: true,
    email: "",
    alertOnTrigger: true,
    alertOnScan: false,
    dailyDigest: true,
  };
}

/**
 * Update user's email alert preferences
 */
export async function updateUserEmailPreferences(
  userId: string,
  preferences: Partial<EmailAlertConfig>
) {
  // This would update the database in production
  console.log(`Updated email preferences for user ${userId}:`, preferences);
}
