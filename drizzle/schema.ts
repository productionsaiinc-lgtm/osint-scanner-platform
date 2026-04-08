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
