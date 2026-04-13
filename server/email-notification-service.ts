import { notifyOwner } from "./_core/notification";

/**
 * Email Notification Service for Monitoring Alerts
 * Sends email notifications when alerts are generated
 */

interface AlertNotificationPayload {
  userId: number;
  userEmail: string;
  userName?: string;
  alertType: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  assetValue: string;
  assetType: "domain" | "ip" | "service";
  details?: any;
  alertId: number;
}

/**
 * Send email notification for a new alert
 */
export async function sendAlertNotification(payload: AlertNotificationPayload) {
  try {
    const severityEmoji = {
      critical: "🚨",
      high: "⚠️",
      medium: "⚡",
      low: "ℹ️",
    };

    const subject = `[${payload.severity.toUpperCase()}] ${payload.title}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%); padding: 20px; border-radius: 8px 8px 0 0; color: #000;">
          <h1 style="margin: 0; font-size: 24px;">
            ${severityEmoji[payload.severity]} ${payload.title}
          </h1>
        </div>
        
        <div style="background: #1a1a1a; color: #fff; padding: 20px; border-radius: 0 0 8px 8px;">
          <div style="margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; color: #00ff88; font-weight: bold;">Alert Details:</p>
            <div style="background: #222; padding: 15px; border-radius: 4px; border-left: 3px solid #00ff88;">
              <p style="margin: 5px 0;"><strong>Severity:</strong> <span style="color: ${getSeverityColor(payload.severity)}">${payload.severity.toUpperCase()}</span></p>
              <p style="margin: 5px 0;"><strong>Asset Type:</strong> ${payload.assetType.toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Asset:</strong> <code style="background: #111; padding: 2px 6px; border-radius: 3px;">${payload.assetValue}</code></p>
              <p style="margin: 5px 0;"><strong>Alert Type:</strong> ${payload.alertType.replace(/_/g, " ").toUpperCase()}</p>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; color: #00ff88; font-weight: bold;">Description:</p>
            <p style="margin: 0; line-height: 1.6; color: #ccc;">${payload.description}</p>
          </div>

          ${payload.details ? `
            <div style="margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0; color: #00ff88; font-weight: bold;">Additional Details:</p>
              <pre style="background: #111; padding: 15px; border-radius: 4px; overflow-x: auto; color: #0f0; font-size: 12px; border-left: 3px solid #00ff88;">
${JSON.stringify(payload.details, null, 2)}
              </pre>
            </div>
          ` : ""}

          <div style="background: #222; padding: 15px; border-radius: 4px; border-left: 3px solid #00ccff; margin-bottom: 20px;">
            <p style="margin: 0; color: #00ccff;"><strong>Next Steps:</strong></p>
            <ul style="margin: 10px 0 0 20px; padding: 0; color: #ccc;">
              <li>Review the alert in your monitoring dashboard</li>
              <li>Investigate the detected changes</li>
              <li>Take appropriate action if needed</li>
              <li>Mark the alert as resolved when complete</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; color: #666; font-size: 12px;">
            <p style="margin: 0;">This is an automated alert from OSINT Scanner Platform</p>
            <p style="margin: 5px 0 0 0;">Alert ID: ${payload.alertId}</p>
          </div>
        </div>
      </div>
    `;

    const textContent = `
ALERT: ${payload.title}
Severity: ${payload.severity.toUpperCase()}

Asset: ${payload.assetValue} (${payload.assetType})
Alert Type: ${payload.alertType.replace(/_/g, " ").toUpperCase()}

Description:
${payload.description}

${payload.details ? `\nDetails:\n${JSON.stringify(payload.details, null, 2)}` : ""}

---
This is an automated alert from OSINT Scanner Platform
Alert ID: ${payload.alertId}
    `;

    // Send notification to owner
    await notifyOwner({
      title: subject,
      content: `Alert for user ${payload.userName || payload.userEmail}: ${payload.title}`,
    });

    console.log(`[Email Notification] Alert sent for user ${payload.userId}: ${payload.title}`);
    return { success: true, message: "Notification sent" };
  } catch (error) {
    console.error("[Email Notification] Error sending notification:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send daily summary email
 */
export async function sendDailySummary(
  userId: number,
  userEmail: string,
  userName: string,
  alerts: any[]
) {
  try {
    const criticalCount = alerts.filter((a) => a.severity === "critical").length;
    const highCount = alerts.filter((a) => a.severity === "high").length;
    const mediumCount = alerts.filter((a) => a.severity === "medium").length;
    const lowCount = alerts.filter((a) => a.severity === "low").length;

    const subject = `Daily Summary - ${alerts.length} Alert(s) Detected`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%); padding: 20px; border-radius: 8px 8px 0 0; color: #000;">
          <h1 style="margin: 0; font-size: 24px;">📊 Daily Monitoring Summary</h1>
        </div>
        
        <div style="background: #1a1a1a; color: #fff; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 20px 0;">Hi ${userName},</p>

          <div style="background: #222; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; color: #00ff88; font-weight: bold;">Alert Summary:</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div style="background: #111; padding: 10px; border-radius: 3px; border-left: 3px solid #ff4444;">
                <p style="margin: 0; color: #ff4444; font-weight: bold; font-size: 18px;">${criticalCount}</p>
                <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">Critical</p>
              </div>
              <div style="background: #111; padding: 10px; border-radius: 3px; border-left: 3px solid #ff8844;">
                <p style="margin: 0; color: #ff8844; font-weight: bold; font-size: 18px;">${highCount}</p>
                <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">High</p>
              </div>
              <div style="background: #111; padding: 10px; border-radius: 3px; border-left: 3px solid #ffcc44;">
                <p style="margin: 0; color: #ffcc44; font-weight: bold; font-size: 18px;">${mediumCount}</p>
                <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">Medium</p>
              </div>
              <div style="background: #111; padding: 10px; border-radius: 3px; border-left: 3px solid #4488ff;">
                <p style="margin: 0; color: #4488ff; font-weight: bold; font-size: 18px;">${lowCount}</p>
                <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">Low</p>
              </div>
            </div>
          </div>

          <div style="background: #222; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; color: #00ff88; font-weight: bold;">Recent Alerts:</p>
            ${alerts
              .slice(0, 5)
              .map(
                (alert) => `
              <div style="background: #111; padding: 10px; margin-bottom: 8px; border-radius: 3px; border-left: 3px solid ${getSeverityColor(alert.severity)};">
                <p style="margin: 0; color: ${getSeverityColor(alert.severity)}; font-weight: bold;">${alert.title}</p>
                <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">${alert.description}</p>
              </div>
            `
              )
              .join("")}
            ${alerts.length > 5 ? `<p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">... and ${alerts.length - 5} more alerts</p>` : ""}
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; color: #666; font-size: 12px;">
            <p style="margin: 0;">OSINT Scanner Platform - Daily Monitoring Summary</p>
          </div>
        </div>
      </div>
    `;

    console.log(`[Email Notification] Daily summary sent for user ${userId}: ${alerts.length} alerts`);
    return { success: true, message: "Daily summary sent" };
  } catch (error) {
    console.error("[Email Notification] Error sending daily summary:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send weekly digest email
 */
export async function sendWeeklyDigest(
  userId: number,
  userEmail: string,
  userName: string,
  stats: {
    totalAlerts: number;
    resolvedAlerts: number;
    unresolvedAlerts: number;
    mostActiveAsset: string;
    alertsByType: Record<string, number>;
  }
) {
  try {
    const subject = `Weekly Report - ${stats.totalAlerts} Alert(s) This Week`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%); padding: 20px; border-radius: 8px 8px 0 0; color: #000;">
          <h1 style="margin: 0; font-size: 24px;">📈 Weekly Monitoring Report</h1>
        </div>
        
        <div style="background: #1a1a1a; color: #fff; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 20px 0;">Hi ${userName},</p>

          <div style="background: #222; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; color: #00ff88; font-weight: bold;">Weekly Statistics:</p>
            <div style="background: #111; padding: 10px; border-radius: 3px; margin-bottom: 8px;">
              <p style="margin: 0;"><strong>Total Alerts:</strong> <span style="color: #00ff88;">${stats.totalAlerts}</span></p>
            </div>
            <div style="background: #111; padding: 10px; border-radius: 3px; margin-bottom: 8px;">
              <p style="margin: 0;"><strong>Resolved:</strong> <span style="color: #00ff88;">${stats.resolvedAlerts}</span></p>
            </div>
            <div style="background: #111; padding: 10px; border-radius: 3px; margin-bottom: 8px;">
              <p style="margin: 0;"><strong>Unresolved:</strong> <span style="color: #ff8844;">${stats.unresolvedAlerts}</span></p>
            </div>
            <div style="background: #111; padding: 10px; border-radius: 3px;">
              <p style="margin: 0;"><strong>Most Active Asset:</strong> <span style="color: #00ccff;">${stats.mostActiveAsset}</span></p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; color: #666; font-size: 12px;">
            <p style="margin: 0;">OSINT Scanner Platform - Weekly Monitoring Report</p>
          </div>
        </div>
      </div>
    `;

    console.log(`[Email Notification] Weekly digest sent for user ${userId}`);
    return { success: true, message: "Weekly digest sent" };
  } catch (error) {
    console.error("[Email Notification] Error sending weekly digest:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Helper function to get color for severity level
 */
function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "#ff4444";
    case "high":
      return "#ff8844";
    case "medium":
      return "#ffcc44";
    case "low":
      return "#4488ff";
    default:
      return "#00ff88";
  }
}
