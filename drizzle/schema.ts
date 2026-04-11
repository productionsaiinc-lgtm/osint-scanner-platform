import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
