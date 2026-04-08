import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, scans, discoveredHosts, domainRecords, socialMediaProfiles, Scan, InsertScan, DiscoveredHost, InsertDiscoveredHost, DomainRecord, InsertDomainRecord, SocialMediaProfile, InsertSocialMediaProfile } from "../drizzle/schema";
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

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Scan operations
export async function createScan(scan: InsertScan): Promise<Scan | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(scans).values(scan);
  const scanId = result[0].insertId;
  const created = await db.select().from(scans).where(eq(scans.id, scanId as number)).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function getScanById(scanId: number): Promise<Scan | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(scans).where(eq(scans.id, scanId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserScans(userId: number, limit: number = 50): Promise<Scan[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(scans).where(eq(scans.userId, userId)).orderBy(desc(scans.createdAt)).limit(limit);
}

export async function updateScan(scanId: number, updates: Partial<Scan>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(scans).set(updates).where(eq(scans.id, scanId));
}

// Discovered hosts operations
export async function createDiscoveredHost(host: InsertDiscoveredHost): Promise<DiscoveredHost | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(discoveredHosts).values(host);
  const hostId = result[0].insertId;
  const created = await db.select().from(discoveredHosts).where(eq(discoveredHosts.id, hostId as number)).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function getScanHosts(scanId: number): Promise<DiscoveredHost[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(discoveredHosts).where(eq(discoveredHosts.scanId, scanId));
}

// Domain records operations
export async function createDomainRecord(record: InsertDomainRecord): Promise<DomainRecord | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(domainRecords).values(record);
  const recordId = result[0].insertId;
  const created = await db.select().from(domainRecords).where(eq(domainRecords.id, recordId as number)).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function getScanDomains(scanId: number): Promise<DomainRecord[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(domainRecords).where(eq(domainRecords.scanId, scanId));
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
