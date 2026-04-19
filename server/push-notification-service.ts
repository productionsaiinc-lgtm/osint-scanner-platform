/**
 * Push Notification Service
 * Handles sending push notifications to users
 */

interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
  }>;
  data?: Record<string, any>;
}

interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Send push notification to user
 */
export async function sendPushNotification(
  userId: string,
  notification: PushNotification
): Promise<boolean> {
  try {
    // In production, this would use a service like Firebase Cloud Messaging or Web Push
    console.log(`[Push Notification] Sending to user ${userId}:`, notification);

    // Simulated successful send
    return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}

/**
 * Send bulk push notifications
 */
export async function sendBulkPushNotifications(
  userIds: string[],
  notification: PushNotification
): Promise<{
  successful: number;
  failed: number;
  errors: Array<{ userId: string; error: string }>;
}> {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as Array<{ userId: string; error: string }>,
  };

  for (const userId of userIds) {
    try {
      const sent = await sendPushNotification(userId, notification);
      if (sent) {
        results.successful++;
      } else {
        results.failed++;
        results.errors.push({ userId, error: "Failed to send" });
      }
    } catch (error) {
      results.failed++;
      results.errors.push({
        userId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

/**
 * Send notification for scan completion
 */
export async function notifyScanCompletion(
  userId: string,
  scanType: string,
  target: string,
  findings: number
): Promise<boolean> {
  const notification: PushNotification = {
    title: "Scan Completed",
    body: `${scanType} scan of ${target} found ${findings} findings`,
    tag: "scan-completion",
    data: {
      scanType,
      target,
      findings,
      timestamp: new Date().toISOString(),
    },
  };

  return sendPushNotification(userId, notification);
}

/**
 * Send notification for alert triggered
 */
export async function notifyAlertTriggered(
  userId: string,
  assetName: string,
  alertType: string,
  severity: "low" | "medium" | "high" | "critical"
): Promise<boolean> {
  const notification: PushNotification = {
    title: `Alert: ${alertType}`,
    body: `${assetName} triggered a ${severity} alert`,
    tag: "alert-triggered",
    requireInteraction: severity === "critical",
    data: {
      assetName,
      alertType,
      severity,
      timestamp: new Date().toISOString(),
    },
  };

  return sendPushNotification(userId, notification);
}

/**
 * Send notification for vulnerability found
 */
export async function notifyVulnerabilityFound(
  userId: string,
  target: string,
  vulnerability: string,
  severity: string
): Promise<boolean> {
  const notification: PushNotification = {
    title: "Vulnerability Detected",
    body: `${severity.toUpperCase()}: ${vulnerability} found on ${target}`,
    tag: "vulnerability-found",
    data: {
      target,
      vulnerability,
      severity,
      timestamp: new Date().toISOString(),
    },
  };

  return sendPushNotification(userId, notification);
}

/**
 * Send notification for monitoring update
 */
export async function notifyMonitoringUpdate(
  userId: string,
  assetName: string,
  changeType: string,
  details: string
): Promise<boolean> {
  const notification: PushNotification = {
    title: "Monitoring Update",
    body: `${assetName}: ${changeType} - ${details}`,
    tag: "monitoring-update",
    data: {
      assetName,
      changeType,
      details,
      timestamp: new Date().toISOString(),
    },
  };

  return sendPushNotification(userId, notification);
}

/**
 * Send notification for subscription event
 */
export async function notifySubscriptionEvent(
  userId: string,
  eventType: "upgrade" | "downgrade" | "renewal" | "expiration",
  planName: string
): Promise<boolean> {
  const messages = {
    upgrade: `You've upgraded to ${planName}`,
    downgrade: `You've downgraded to ${planName}`,
    renewal: `Your ${planName} subscription has been renewed`,
    expiration: `Your ${planName} subscription is expiring soon`,
  };

  const notification: PushNotification = {
    title: "Subscription Update",
    body: messages[eventType],
    tag: "subscription-event",
    data: {
      eventType,
      planName,
      timestamp: new Date().toISOString(),
    },
  };

  return sendPushNotification(userId, notification);
}

/**
 * Send notification for system maintenance
 */
export async function notifySystemMaintenance(
  userIds: string[],
  maintenanceType: string,
  scheduledTime: Date,
  estimatedDuration: number
): Promise<{
  successful: number;
  failed: number;
}> {
  const notification: PushNotification = {
    title: "System Maintenance",
    body: `${maintenanceType} scheduled for ${scheduledTime.toLocaleString()} (${estimatedDuration} minutes)`,
    tag: "system-maintenance",
    data: {
      maintenanceType,
      scheduledTime: scheduledTime.toISOString(),
      estimatedDuration,
    },
  };

  const results = await sendBulkPushNotifications(userIds, notification);
  return {
    successful: results.successful,
    failed: results.failed,
  };
}

/**
 * Send notification for API usage warning
 */
export async function notifyAPIUsageWarning(
  userId: string,
  usagePercentage: number,
  limit: number
): Promise<boolean> {
  const notification: PushNotification = {
    title: "API Usage Warning",
    body: `You've used ${usagePercentage}% of your ${limit} API requests`,
    tag: "api-usage-warning",
    data: {
      usagePercentage,
      limit,
      timestamp: new Date().toISOString(),
    },
  };

  return sendPushNotification(userId, notification);
}

/**
 * Register push subscription for user
 */
export async function registerPushSubscription(
  userId: string,
  subscription: PushSubscription
): Promise<boolean> {
  try {
    console.log(`[Push] Registered subscription for user ${userId}`);
    // In production, save subscription to database
    return true;
  } catch (error) {
    console.error("Error registering push subscription:", error);
    return false;
  }
}

/**
 * Unregister push subscription for user
 */
export async function unregisterPushSubscription(userId: string): Promise<boolean> {
  try {
    console.log(`[Push] Unregistered subscription for user ${userId}`);
    // In production, remove subscription from database
    return true;
  } catch (error) {
    console.error("Error unregistering push subscription:", error);
    return false;
  }
}
