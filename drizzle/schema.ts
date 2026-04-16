import { bigint, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Scan records for tracking all OSINT and network scanning activities
 */
export const scans = mysqlTable("scans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  scanType: varchar("scanType", { length: 50 }).notNull(), // 'network', 'domain', 'social'
  target: varchar("target", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "error"]).default("pending").notNull(),
  rawResults: text("rawResults"), // JSON string of raw scan results
  threatAnalysis: text("threatAnalysis"), // LLM-generated threat analysis
  vulnerabilityCount: int("vulnerabilityCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Scan = typeof scans.$inferSelect;
export type InsertScan = typeof scans.$inferInsert;

/**
 * Discovered hosts from network scans
 */
export const discoveredHosts = mysqlTable("discoveredHosts", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scanId").notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }).notNull(),
  hostname: varchar("hostname", { length: 255 }),
  openPorts: text("openPorts"), // JSON array of open ports
  services: text("services"), // JSON array of detected services
  geolocation: text("geolocation"), // JSON with lat, lon, country, city
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DiscoveredHost = typeof discoveredHosts.$inferSelect;
export type InsertDiscoveredHost = typeof discoveredHosts.$inferInsert;

/**
 * Domain information from OSINT scans
 */
export const domainRecords = mysqlTable("domainRecords", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scanId").notNull(),
  domain: varchar("domain", { length: 255 }).notNull(),
  registrar: varchar("registrar", { length: 255 }),
  registrationDate: varchar("registrationDate", { length: 50 }),
  expirationDate: varchar("expirationDate", { length: 50 }),
  nameservers: text("nameservers"), // JSON array
  dnsRecords: text("dnsRecords"), // JSON with A, MX, CNAME, etc.
  sslCertificate: text("sslCertificate"), // JSON with cert info
  subdomains: text("subdomains"), // JSON array of discovered subdomains
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DomainRecord = typeof domainRecords.$inferSelect;
export type InsertDomainRecord = typeof domainRecords.$inferInsert;

/**
 * Social media profiles discovered during OSINT
 */
export const socialMediaProfiles = mysqlTable("socialMediaProfiles", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scanId").notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(), // twitter, github, linkedin, instagram, etc.
  profileUrl: varchar("profileUrl", { length: 500 }),
  displayName: varchar("displayName", { length: 255 }),
  bio: text("bio"),
  followers: int("followers"),
  following: int("following"),
  profileData: text("profileData"), // JSON with additional profile info
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SocialMediaProfile = typeof socialMediaProfiles.$inferSelect;
export type InsertSocialMediaProfile = typeof socialMediaProfiles.$inferInsert;


/**
 * Premium subscription plans
 */
export const subscriptionPlans = mysqlTable("subscriptionPlans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(), // 'free', 'pro', 'enterprise'
  price: int("price").notNull(), // in cents (e.g., 999 = $9.99)
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "yearly"]).notNull(),
  maxScansPerMonth: int("maxScansPerMonth").default(0), // 0 = unlimited
  maxApiCalls: int("maxApiCalls").default(0), // 0 = unlimited
  features: text("features"), // JSON array of feature names
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

/**
 * User subscriptions
 */
export const userSubscriptions = mysqlTable("userSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId").notNull(),
  paypalSubscriptionId: varchar("paypalSubscriptionId", { length: 255 }),
  status: mysqlEnum("status", ["active", "cancelled", "expired", "pending"]).default("pending").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  autoRenew: int("autoRenew").default(1), // boolean as int
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

/**
 * Payment history
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subscriptionId: int("subscriptionId"),
  paypalTransactionId: varchar("paypalTransactionId", { length: 255 }).notNull(),
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: mysqlEnum("status", ["completed", "pending", "failed", "refunded"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).default("paypal").notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Notifications for users
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", [
    "scan_complete",
    "scan_error",
    "payment_success",
    "payment_failed",
    "subscription_update",
    "subscription_expiring",
    "vulnerability_found",
    "payout_received",
    "payout_failed",
    "security_alert",
    "system_update",
    "custom"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  data: text("data"), // JSON with additional context (scanId, paymentId, etc.)
  status: mysqlEnum("status", ["unread", "read", "archived"]).default("unread").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  actionUrl: varchar("actionUrl", { length: 500 }), // Link to related resource
  emailSent: int("emailSent").default(0), // boolean as int
  pushSent: int("pushSent").default(0), // boolean as int
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * User notification preferences
 */
export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  emailNotifications: int("emailNotifications").default(1), // boolean as int
  pushNotifications: int("pushNotifications").default(1), // boolean as int
  inAppNotifications: int("inAppNotifications").default(1), // boolean as int
  scanCompleteNotifications: int("scanCompleteNotifications").default(1),
  paymentNotifications: int("paymentNotifications").default(1),
  subscriptionNotifications: int("subscriptionNotifications").default(1),
  securityAlertNotifications: int("securityAlertNotifications").default(1),
  emailFrequency: mysqlEnum("emailFrequency", ["immediate", "daily", "weekly", "never"]).default("daily").notNull(),
  notificationSound: int("notificationSound").default(1), // boolean as int
  notificationVibration: int("notificationVibration").default(1), // boolean as int
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

/**
 * Push notification subscriptions for browser
 */
export const pushSubscriptions = mysqlTable("pushSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  endpoint: varchar("endpoint", { length: 500 }).notNull(),
  auth: varchar("auth", { length: 255 }).notNull(),
  p256dh: varchar("p256dh", { length: 255 }).notNull(),
  userAgent: varchar("userAgent", { length: 500 }),
  isActive: int("isActive").default(1), // boolean as int
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/**
 * SIM Swap detection history and results
 */
export const simSwapRecords = mysqlTable("simSwapRecords", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  carrier: varchar("carrier", { length: 100 }),
  isSwapped: int("isSwapped").default(0), // boolean as int - actual detection result
  riskScore: int("riskScore").default(0), // 0-100
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  detectionMethod: varchar("detectionMethod", { length: 100 }), // 'breach_db', 'carrier_check', 'pattern_analysis', 'hybrid'
  breachIndicators: text("breachIndicators"), // JSON array of breach database hits
  carrierIndicators: text("carrierIndicators"), // JSON with carrier-specific findings
  patternIndicators: text("patternIndicators"), // JSON with suspicious patterns
  simSwapProtectionEnabled: int("simSwapProtectionEnabled").default(0), // boolean as int
  protectionType: varchar("protectionType", { length: 100 }), // 'pin', 'biometric', 'none'
  lastActivityChange: timestamp("lastActivityChange"), // Last time account activity changed
  suspiciousActivities: text("suspiciousActivities"), // JSON array of suspicious activities
  confidence: int("confidence").default(0), // 0-100 confidence level in detection
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SimSwapRecord = typeof simSwapRecords.$inferSelect;
export type InsertSimSwapRecord = typeof simSwapRecords.$inferInsert;

/**
 * Breach database entries for SIM swap detection
 */
export const breachDatabaseEntries = mysqlTable("breachDatabaseEntries", {
  id: int("id").autoincrement().primaryKey(),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  breachSource: varchar("breachSource", { length: 100 }).notNull(), // 'haveibeenpwned', 'credentialstuffing', 'darkweb', 'leaked_lists'
  breachDate: timestamp("breachDate"),
  breachType: varchar("breachType", { length: 100 }), // 'credentials', 'phone_list', 'carrier_data', 'sim_swap_attempt'
  dataExposed: text("dataExposed"), // JSON with what was exposed
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  verified: int("verified").default(0), // boolean as int
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BreachDatabaseEntry = typeof breachDatabaseEntries.$inferSelect;
export type InsertBreachDatabaseEntry = typeof breachDatabaseEntries.$inferInsert;

/**
 * Carrier SIM swap protection status
 */
export const carrierSimSwapStatus = mysqlTable("carrierSimSwapStatus", {
  id: int("id").autoincrement().primaryKey(),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull().unique(),
  carrier: varchar("carrier", { length: 100 }).notNull(),
  protectionEnabled: int("protectionEnabled").default(0), // boolean as int
  protectionType: varchar("protectionType", { length: 100 }), // 'pin', 'biometric', 'security_questions', 'none'
  lastVerified: timestamp("lastVerified"),
  verificationMethod: varchar("verificationMethod", { length: 100 }), // 'api', 'manual', 'automated'
  accountStatus: mysqlEnum("accountStatus", ["active", "suspended", "flagged", "unknown"]).default("unknown").notNull(),
  suspiciousActivityCount: int("suspiciousActivityCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CarrierSimSwapStatus = typeof carrierSimSwapStatus.$inferSelect;
export type InsertCarrierSimSwapStatus = typeof carrierSimSwapStatus.$inferInsert;

/**
 * SIM swap detection patterns and heuristics
 */
export const simSwapPatterns = mysqlTable("simSwapPatterns", {
  id: int("id").autoincrement().primaryKey(),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  multipleCarrierChanges: int("multipleCarrierChanges").default(0), // boolean - multiple carrier switches in short time
  frequentPorting: int("frequentPorting").default(0), // boolean - frequent number porting
  suspiciousLoginAttempts: int("suspiciousLoginAttempts").default(0), // boolean - unusual login attempts
  accountRecoveryAttempts: int("accountRecoveryAttempts").default(0), // count of recovery attempts
  passwordResetAttempts: int("passwordResetAttempts").default(0), // count of password resets
  smsVerificationFails: int("smsVerificationFails").default(0), // count of failed SMS verifications
  unusualGeoLocation: int("unusualGeoLocation").default(0), // boolean - login from unusual location
  deviceChanges: int("deviceChanges").default(0), // count of device changes
  riskScore: int("riskScore").default(0), // 0-100 based on patterns
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SimSwapPattern = typeof simSwapPatterns.$inferSelect;
export type InsertSimSwapPattern = typeof simSwapPatterns.$inferInsert;


/**
 * Monitored assets for real-time monitoring and alerts
 */
export const monitoredAssets = mysqlTable("monitoredAssets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  assetType: mysqlEnum("assetType", ["domain", "ip", "service", "email"]).notNull(),
  assetValue: varchar("assetValue", { length: 255 }).notNull(),
  description: text("description"),
  scanFrequency: mysqlEnum("scanFrequency", ["daily", "weekly", "monthly"]).default("daily").notNull(),
  isActive: int("isActive").default(1), // boolean as int
  lastScanned: timestamp("lastScanned"),
  nextScan: timestamp("nextScan"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MonitoredAsset = typeof monitoredAssets.$inferSelect;
export type InsertMonitoredAsset = typeof monitoredAssets.$inferInsert;

/**
 * Alert rules for threat detection
 */
export const alertRules = mysqlTable("alertRules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  monitoredAssetId: int("monitoredAssetId").notNull(),
  ruleType: mysqlEnum("ruleType", ["new_port", "ssl_expiry", "dns_change", "subdomain_found", "ip_reputation", "service_version"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  isEnabled: int("isEnabled").default(1), // boolean as int
  notifyEmail: int("notifyEmail").default(1), // boolean as int
  notifyDashboard: int("notifyDashboard").default(1), // boolean as int
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AlertRule = typeof alertRules.$inferSelect;
export type InsertAlertRule = typeof alertRules.$inferInsert;

/**
 * Alerts generated from monitoring
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  monitoredAssetId: int("monitoredAssetId").notNull(),
  alertType: mysqlEnum("alertType", ["new_port", "ssl_expiry", "dns_change", "subdomain_found", "ip_reputation", "service_version"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  details: text("details"), // JSON with detailed information
  isRead: int("isRead").default(0), // boolean as int
  isResolved: int("isResolved").default(0), // boolean as int
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * Scan history for change detection
 */
export const monitoringScanHistory = mysqlTable("monitoringScanHistory", {
  id: int("id").autoincrement().primaryKey(),
  monitoredAssetId: int("monitoredAssetId").notNull(),
  scanType: varchar("scanType", { length: 50 }).notNull(),
  previousResults: text("previousResults"), // JSON of previous scan results
  currentResults: text("currentResults"), // JSON of current scan results
  changeDetected: int("changeDetected").default(0), // boolean as int
  changeDetails: text("changeDetails"), // JSON with what changed
  status: mysqlEnum("status", ["pending", "running", "completed", "error"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MonitoringScanHistory = typeof monitoringScanHistory.$inferSelect;
export type InsertMonitoringScanHistory = typeof monitoringScanHistory.$inferInsert;

/**
 * PayPal payouts tracking for direct payout model
 */
export const payouts = mysqlTable("payouts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  paymentId: int("paymentId").notNull(), // Reference to payment that triggered payout
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  payoutId: varchar("payoutId", { length: 100 }).notNull().unique(), // PayPal payout batch ID
  status: mysqlEnum("status", ["PENDING", "PROCESSING", "SUCCESS", "FAILED", "DENIED", "RETURNED"]).default("PENDING").notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  senderBatchId: varchar("senderBatchId", { length: 100 }),
  transactionId: varchar("transactionId", { length: 100 }), // Individual transaction ID
  transactionStatus: varchar("transactionStatus", { length: 50 }), // Transaction-level status
  failureReason: text("failureReason"), // Reason if payout failed
  retryCount: int("retryCount").default(0),
  lastRetryAt: timestamp("lastRetryAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = typeof payouts.$inferInsert;


/**
 * MDM (Mobile Device Management) - Managed devices
 */
export const mdmDevices = mysqlTable("mdmDevices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  deviceId: varchar("deviceId", { length: 100 }).notNull().unique(), // Unique device identifier
  deviceName: varchar("deviceName", { length: 255 }).notNull(),
  deviceType: mysqlEnum("deviceType", ["android", "ios", "windows", "macos", "linux"]).notNull(),
  osVersion: varchar("osVersion", { length: 50 }),
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  imei: varchar("imei", { length: 20 }),
  serialNumber: varchar("serialNumber", { length: 100 }),
  enrollmentStatus: mysqlEnum("enrollmentStatus", ["pending", "enrolled", "unenrolled", "suspended"]).default("pending").notNull(),
  enrollmentDate: timestamp("enrollmentDate"),
  lastCheckIn: timestamp("lastCheckIn"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  location: text("location"), // JSON with lat, lon, address
  batteryLevel: int("batteryLevel"), // 0-100
  storageUsed: int("storageUsed"), // in MB
  storageTotal: int("storageTotal"), // in MB
  isCompliant: int("isCompliant").default(1), // boolean - compliant with policies
  complianceIssues: text("complianceIssues"), // JSON array of issues
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MdmDevice = typeof mdmDevices.$inferSelect;
export type InsertMdmDevice = typeof mdmDevices.$inferInsert;

/**
 * MDM Device Policies - Security and management policies
 */
export const mdmPolicies = mysqlTable("mdmPolicies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  policyName: varchar("policyName", { length: 255 }).notNull(),
  description: text("description"),
  policyType: mysqlEnum("policyType", ["security", "compliance", "app_management", "network", "device_control"]).notNull(),
  
  // Security policies
  minPasswordLength: int("minPasswordLength").default(6),
  requireNumeric: int("requireNumeric").default(0), // boolean
  requireSpecialChar: int("requireSpecialChar").default(0), // boolean
  maxPasswordAge: int("maxPasswordAge"), // days
  passwordExpirationWarning: int("passwordExpirationWarning"), // days
  
  // Device control policies
  allowUsbDebug: int("allowUsbDebug").default(0), // boolean
  allowUnknownSources: int("allowUnknownSources").default(0), // boolean
  allowDeveloperMode: int("allowDeveloperMode").default(0), // boolean
  enableEncryption: int("enableEncryption").default(1), // boolean
  
  // App management
  allowedApps: text("allowedApps"), // JSON array of allowed app package names
  blockedApps: text("blockedApps"), // JSON array of blocked app package names
  
  // Network policies
  requireVpn: int("requireVpn").default(0), // boolean
  allowedWifi: text("allowedWifi"), // JSON array of allowed WiFi SSIDs
  
  isActive: int("isActive").default(1), // boolean
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MdmPolicy = typeof mdmPolicies.$inferSelect;
export type InsertMdmPolicy = typeof mdmPolicies.$inferInsert;

/**
 * MDM Device Policy Assignment - Link devices to policies
 */
export const mdmDevicePolicyAssignments = mysqlTable("mdmDevicePolicyAssignments", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: int("deviceId").notNull(),
  policyId: int("policyId").notNull(),
  assignmentStatus: mysqlEnum("assignmentStatus", ["pending", "applied", "failed", "revoked"]).default("pending").notNull(),
  appliedAt: timestamp("appliedAt"),
  failureReason: text("failureReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MdmDevicePolicyAssignment = typeof mdmDevicePolicyAssignments.$inferSelect;
export type InsertMdmDevicePolicyAssignment = typeof mdmDevicePolicyAssignments.$inferInsert;

/**
 * MDM Device Commands - Remote commands sent to devices
 */
export const mdmDeviceCommands = mysqlTable("mdmDeviceCommands", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: int("deviceId").notNull(),
  commandType: mysqlEnum("commandType", ["lock", "wipe", "restart", "update_policy", "install_app", "uninstall_app", "take_screenshot", "get_location"]).notNull(),
  commandStatus: mysqlEnum("commandStatus", ["pending", "sent", "executed", "failed"]).default("pending").notNull(),
  commandData: text("commandData"), // JSON with command-specific data
  executedAt: timestamp("executedAt"),
  failureReason: text("failureReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MdmDeviceCommand = typeof mdmDeviceCommands.$inferSelect;
export type InsertMdmDeviceCommand = typeof mdmDeviceCommands.$inferInsert;

/**
 * MDM Device Logs - Activity logs for auditing
 */
export const mdmDeviceLogs = mysqlTable("mdmDeviceLogs", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: int("deviceId").notNull(),
  logType: mysqlEnum("logType", ["enrollment", "policy_applied", "command_executed", "compliance_check", "security_event", "app_installed", "app_uninstalled"]).notNull(),
  logMessage: text("logMessage").notNull(),
  logData: text("logData"), // JSON with additional details
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MdmDeviceLog = typeof mdmDeviceLogs.$inferSelect;
export type InsertMdmDeviceLog = typeof mdmDeviceLogs.$inferInsert;

/**
 * GPS/Location tracking for managed devices
 */
export const mdmDeviceLocations = mysqlTable("mdmDeviceLocations", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: int("deviceId").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  accuracy: int("accuracy"), // in meters
  altitude: decimal("altitude", { precision: 10, scale: 2 }),
  speed: decimal("speed", { precision: 8, scale: 2 }), // in m/s
  heading: decimal("heading", { precision: 6, scale: 2 }), // 0-360 degrees
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MdmDeviceLocation = typeof mdmDeviceLocations.$inferSelect;
export type InsertMdmDeviceLocation = typeof mdmDeviceLocations.$inferInsert;

/**
 * Network monitoring data for managed devices
 */
export const mdmNetworkMonitoring = mysqlTable("mdmNetworkMonitoring", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: int("deviceId").notNull(),
  networkType: varchar("networkType", { length: 50 }).notNull(), // 'wifi', 'cellular', 'bluetooth'
  ssid: varchar("ssid", { length: 255 }), // WiFi SSID
  signalStrength: int("signalStrength"), // -30 to -120 dBm
  bandwidth: varchar("bandwidth", { length: 50 }), // '2.4GHz', '5GHz', '6GHz'
  ipAddress: varchar("ipAddress", { length: 45 }),
  macAddress: varchar("macAddress", { length: 17 }),
  dataUsage: int("dataUsage"), // in bytes
  uploadSpeed: decimal("uploadSpeed", { precision: 10, scale: 2 }), // Mbps
  downloadSpeed: decimal("downloadSpeed", { precision: 10, scale: 2 }), // Mbps
  latency: int("latency"), // in ms
  packetLoss: decimal("packetLoss", { precision: 5, scale: 2 }), // percentage
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MdmNetworkMonitoring = typeof mdmNetworkMonitoring.$inferSelect;
export type InsertMdmNetworkMonitoring = typeof mdmNetworkMonitoring.$inferInsert;

/**
 * App usage analytics for managed devices
 */
export const mdmAppUsageAnalytics = mysqlTable("mdmAppUsageAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: int("deviceId").notNull(),
  appPackageName: varchar("appPackageName", { length: 255 }).notNull(),
  appName: varchar("appName", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }), // 'productivity', 'social', 'gaming', etc.
  usageTime: int("usageTime"), // in seconds
  launchCount: int("launchCount").default(0),
  dataUsed: int("dataUsed"), // in bytes
  batteryDrain: decimal("batteryDrain", { precision: 5, scale: 2 }), // percentage
  lastUsed: timestamp("lastUsed"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MdmAppUsageAnalytics = typeof mdmAppUsageAnalytics.$inferSelect;
export type InsertMdmAppUsageAnalytics = typeof mdmAppUsageAnalytics.$inferInsert;

/**
 * Device performance metrics
 */
export const mdmDevicePerformance = mysqlTable("mdmDevicePerformance", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: int("deviceId").notNull(),
  cpuUsage: decimal("cpuUsage", { precision: 5, scale: 2 }), // percentage
  memoryUsage: decimal("memoryUsage", { precision: 5, scale: 2 }), // percentage
  storageUsage: decimal("storageUsage", { precision: 5, scale: 2 }), // percentage
  batteryLevel: int("batteryLevel"), // 0-100
  batteryHealth: varchar("batteryHealth", { length: 50 }), // 'good', 'fair', 'poor'
  temperature: decimal("temperature", { precision: 5, scale: 2 }), // in Celsius
  uptime: int("uptime"), // in seconds
  restarts: int("restarts").default(0),
  crashes: int("crashes").default(0),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MdmDevicePerformance = typeof mdmDevicePerformance.$inferSelect;
export type InsertMdmDevicePerformance = typeof mdmDevicePerformance.$inferInsert;

/**
 * Security events and threats detected on managed devices
 */
export const mdmSecurityEvents = mysqlTable("mdmSecurityEvents", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: int("deviceId").notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(), // 'malware', 'phishing', 'suspicious_app', 'jailbreak', etc.
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  description: text("description"),
  threatName: varchar("threatName", { length: 255 }),
  source: varchar("source", { length: 255 }), // app, file, network, etc.
  resolved: boolean("resolved").default(false),
  resolutionAction: varchar("resolutionAction", { length: 255 }), // 'quarantined', 'deleted', 'blocked', etc.
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MdmSecurityEvent = typeof mdmSecurityEvents.$inferSelect;
export type InsertMdmSecurityEvent = typeof mdmSecurityEvents.$inferInsert;
