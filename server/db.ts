import { eq, and, gte, inArray, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, User, users, scans, discoveredHosts, domainRecords, socialMediaProfiles, Scan, InsertScan, DiscoveredHost, InsertDiscoveredHost, DomainRecord, InsertDomainRecord, SocialMediaProfile, InsertSocialMediaProfile, canaryTokens, canaryTokenTriggers, CanaryToken, InsertCanaryToken, CanaryTokenTrigger, InsertCanaryTokenTrigger, shortenedUrls, ShortenedUrl, InsertShortenedUrl, tempEmailAddresses, TempEmailAddress, InsertTempEmailAddress, tempEmailMessages, TempEmailMessage, InsertTempEmailMessage, virtualComputers, VirtualComputer, InsertVirtualComputer } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    await db
      .insert(users)
      .values(values)
      .onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
  }
}

export async function getUserByOpenId(openId: string): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.openId, openId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get user:", error);
    return null;
  }
}

export async function getUserById(id: number): Promise<InsertUser | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get user by id:", error);
    return null;
  }
}

// Scans operations
export async function createScan(scan: InsertScan): Promise<Scan | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(scans).values(scan);
    const scanId = result[0].insertId;
    const created = await db.select().from(scans).where(eq(scans.id, scanId as number)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create scan:", error);
    return null;
  }
}

export async function getScan(id: number): Promise<Scan | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(scans).where(eq(scans.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get scan:", error);
    return null;
  }
}

export async function getUserScans(userId: number, limit?: number): Promise<Scan[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const query = db.select().from(scans).where(eq(scans.userId, userId));
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  } catch (error) {
    console.error("[Database] Failed to get user scans:", error);
    return [];
  }
}

export async function updateScan(id: number, updates: Partial<Scan>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(scans).set(updates).where(eq(scans.id, id));
  } catch (error) {
    console.error("[Database] Failed to update scan:", error);
  }
}

// Discovered hosts operations
export async function createDiscoveredHost(host: InsertDiscoveredHost): Promise<DiscoveredHost | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(discoveredHosts).values(host);
    const hostId = result[0].insertId;
    const created = await db.select().from(discoveredHosts).where(eq(discoveredHosts.id, hostId as number)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create discovered host:", error);
    return null;
  }
}

export async function getScanHosts(scanId: number): Promise<DiscoveredHost[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(discoveredHosts).where(eq(discoveredHosts.scanId, scanId));
  } catch (error) {
    console.error("[Database] Failed to get scan hosts:", error);
    return [];
  }
}

// Domain records operations
export async function createDomainRecord(record: InsertDomainRecord): Promise<DomainRecord | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(domainRecords).values(record);
    const recordId = result[0].insertId;
    const created = await db.select().from(domainRecords).where(eq(domainRecords.id, recordId as number)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create domain record:", error);
    return null;
  }
}

export async function getScanDomainRecords(scanId: number): Promise<DomainRecord[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(domainRecords).where(eq(domainRecords.scanId, scanId));
  } catch (error) {
    console.error("[Database] Failed to get scan domain records:", error);
    return [];
  }
}

// Social media profiles operations
export async function createSocialProfile(profile: InsertSocialMediaProfile): Promise<SocialMediaProfile | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(socialMediaProfiles).values(profile);
  const profileId = result[0].insertId;
  const created = await db.select().from(socialMediaProfiles).where(eq(socialMediaProfiles.id, profileId as number)).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function getScanProfiles(scanId: number): Promise<SocialMediaProfile[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(socialMediaProfiles).where(eq(socialMediaProfiles.scanId, scanId));
}

// Canary Tokens operations
export async function createCanaryToken(token: InsertCanaryToken): Promise<CanaryToken | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    await db.insert(canaryTokens).values(token);
    const created = await db.select().from(canaryTokens).where(eq(canaryTokens.id, token.id)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create canary token:", error);
    return null;
  }
}

export async function getCanaryTokens(userId: number): Promise<CanaryToken[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(canaryTokens).where(eq(canaryTokens.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get canary tokens:", error);
    return [];
  }
}

export async function getCanaryToken(tokenId: string, userId: number): Promise<CanaryToken | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(canaryTokens).where(
      and(eq(canaryTokens.id, tokenId), eq(canaryTokens.userId, userId))
    ).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get canary token:", error);
    return null;
  }
}

export async function updateCanaryToken(tokenId: string, updates: Partial<CanaryToken>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.update(canaryTokens).set(updates).where(eq(canaryTokens.id, tokenId));
  } catch (error) {
    console.error("[Database] Failed to update canary token:", error);
  }
}

export async function deleteCanaryToken(tokenId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.delete(canaryTokenTriggers).where(eq(canaryTokenTriggers.tokenId, tokenId));
    await db.delete(canaryTokens).where(eq(canaryTokens.id, tokenId));
  } catch (error) {
    console.error("[Database] Failed to delete canary token:", error);
  }
}

export async function recordCanaryTokenTrigger(trigger: InsertCanaryTokenTrigger): Promise<CanaryTokenTrigger | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.insert(canaryTokenTriggers).values(trigger);
    const triggerId = result[0].insertId;
    const created = await db.select().from(canaryTokenTriggers).where(eq(canaryTokenTriggers.id, triggerId as number)).limit(1);
    
    // Update token trigger count and last triggered time
    if (created.length > 0) {
      await db.update(canaryTokens).set({
        triggerCount: sql`triggerCount + 1`,
        lastTriggeredAt: new Date(),
      }).where(eq(canaryTokens.id, trigger.tokenId));
    }
    
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to record canary token trigger:", error);
    return null;
  }
}

export async function getCanaryTokenTriggers(tokenId: string): Promise<CanaryTokenTrigger[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(canaryTokenTriggers).where(eq(canaryTokenTriggers.tokenId, tokenId)).orderBy(desc(canaryTokenTriggers.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get canary token triggers:", error);
    return [];
  }
}

export async function getCanaryTokenStats(userId: number): Promise<{ total_tokens: number; active_tokens: number; total_triggers: number; recent_activity: number }> {
  const db = await getDb();
  if (!db) return { total_tokens: 0, active_tokens: 0, total_triggers: 0, recent_activity: 0 };
  
  try {
    const tokens = await db.select().from(canaryTokens).where(eq(canaryTokens.userId, userId));
    const activeTokens = tokens.filter(t => t.status === 'Active').length;
    const totalTriggers = tokens.reduce((sum, t) => sum + (t.triggerCount || 0), 0);
    
    // Recent activity: triggers in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentTriggers = await db.select().from(canaryTokenTriggers).where(
      and(
        inArray(canaryTokenTriggers.tokenId, tokens.map(t => t.id)),
        gte(canaryTokenTriggers.createdAt, oneDayAgo)
      )
    );
    
    return {
      total_tokens: tokens.length,
      active_tokens: activeTokens,
      total_triggers: totalTriggers,
      recent_activity: recentTriggers.length,
    };
  } catch (error) {
    console.error("[Database] Failed to get canary token stats:", error);
    return { total_tokens: 0, active_tokens: 0, total_triggers: 0, recent_activity: 0 };
  }
}


export async function getScanDomains(scanId: number): Promise<DomainRecord[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(domainRecords).where(eq(domainRecords.scanId, scanId));
  } catch (error) {
    console.error("[Database] Failed to get scan domains:", error);
    return [];
  }
}


// URL Shortener operations
export async function createShortenedUrl(url: InsertShortenedUrl): Promise<ShortenedUrl | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.insert(shortenedUrls).values(url);
    const urlId = result[0].insertId;
    const created = await db.select().from(shortenedUrls).where(eq(shortenedUrls.id, urlId as number)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create shortened URL:", error);
    return null;
  }
}

export async function getShortenedUrl(shortCode: string): Promise<ShortenedUrl | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(shortenedUrls).where(eq(shortenedUrls.shortCode, shortCode)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get shortened URL:", error);
    return null;
  }
}

export async function getUserShortenedUrls(userId: number): Promise<ShortenedUrl[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(shortenedUrls).where(eq(shortenedUrls.userId, userId)).orderBy(desc(shortenedUrls.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get user shortened URLs:", error);
    return [];
  }
}

export async function updateShortenedUrl(id: number, updates: Partial<ShortenedUrl>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.update(shortenedUrls).set(updates).where(eq(shortenedUrls.id, id));
  } catch (error) {
    console.error("[Database] Failed to update shortened URL:", error);
  }
}

export async function deleteShortenedUrl(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.delete(shortenedUrls).where(eq(shortenedUrls.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete shortened URL:", error);
  }
}

// Temporary Email operations
export async function createTempEmail(email: InsertTempEmailAddress): Promise<TempEmailAddress | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.insert(tempEmailAddresses).values(email);
    const emailId = result[0].insertId;
    const created = await db.select().from(tempEmailAddresses).where(eq(tempEmailAddresses.id, emailId as number)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create temp email:", error);
    return null;
  }
}

export async function getTempEmail(emailAddress: string): Promise<TempEmailAddress | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(tempEmailAddresses).where(eq(tempEmailAddresses.emailAddress, emailAddress)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get temp email:", error);
    return null;
  }
}

export async function getUserTempEmails(userId: number): Promise<TempEmailAddress[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(tempEmailAddresses).where(eq(tempEmailAddresses.userId, userId)).orderBy(desc(tempEmailAddresses.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get user temp emails:", error);
    return [];
  }
}

export async function deleteTempEmail(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.delete(tempEmailAddresses).where(eq(tempEmailAddresses.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete temp email:", error);
  }
}

// Virtual Computers operations
export async function createVirtualComputer(computer: InsertVirtualComputer): Promise<VirtualComputer | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.insert(virtualComputers).values(computer);
    const computerId = result[0].insertId;
    const created = await db.select().from(virtualComputers).where(eq(virtualComputers.id, computerId as number)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create virtual computer:", error);
    return null;
  }
}

export async function getUserVirtualComputers(userId: number): Promise<VirtualComputer[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(virtualComputers).where(eq(virtualComputers.userId, userId)).orderBy(desc(virtualComputers.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get user virtual computers:", error);
    return [];
  }
}

export async function updateVirtualComputer(id: number, updates: Partial<VirtualComputer>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.update(virtualComputers).set(updates).where(eq(virtualComputers.id, id));
  } catch (error) {
    console.error("[Database] Failed to update virtual computer:", error);
  }
}

export async function deleteVirtualComputer(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.delete(virtualComputers).where(eq(virtualComputers.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete virtual computer:", error);
  }
}

// Temporary Email Messages operations
export async function createTempEmailMessage(message: InsertTempEmailMessage): Promise<TempEmailMessage | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.insert(tempEmailMessages).values(message);
    const messageId = result[0].insertId;
    const created = await db.select().from(tempEmailMessages).where(eq(tempEmailMessages.id, messageId as number)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create temp email message:", error);
    return null;
  }
}

export async function getTempEmailMessages(tempEmailId: number): Promise<TempEmailMessage[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(tempEmailMessages).where(eq(tempEmailMessages.tempEmailId, tempEmailId)).orderBy(desc(tempEmailMessages.receivedAt));
  } catch (error) {
    console.error("[Database] Failed to get temp email messages:", error);
    return [];
  }
}

export async function markTempEmailMessageAsRead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.update(tempEmailMessages).set({ isRead: true }).where(eq(tempEmailMessages.id, id));
  } catch (error) {
    console.error("[Database] Failed to mark message as read:", error);
  }
}

export async function deleteTempEmailMessage(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.delete(tempEmailMessages).where(eq(tempEmailMessages.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete temp email message:", error);
  }
}
