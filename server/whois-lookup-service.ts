/**
 * WHOIS/RDAP Lookup Service
 * Retrieves live domain registration information through RDAP. Historical
 * WHOIS and private contact data require a paid WHOIS history provider.
 */

import axios from "axios";

export interface WHOISData {
  domain: string;
  registrar: string;
  registrar_url: string;
  registrar_email: string;
  registrant: RegistrantInfo;
  admin: ContactInfo;
  technical: ContactInfo;
  billing: ContactInfo;
  nameservers: string[];
  creation_date: string;
  expiration_date: string;
  updated_date: string;
  status: string[];
  dnssec: string;
  raw_data: string;
}

export interface RegistrantInfo extends ContactInfo {
  organization: string;
  country: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
}

const emptyContact: ContactInfo = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  postal_code: "",
};

export async function performWHOISLookup(domain: string): Promise<WHOISData> {
  try {
    const normalized = domain.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
    const response = await axios.get(`https://rdap.org/domain/${encodeURIComponent(normalized)}`, {
      timeout: 12000,
      validateStatus: (status) => status >= 200 && status < 500,
      headers: { "User-Agent": "OSINT-Scanner-Platform/1.0" },
    });
    if (response.status >= 400) {
      throw new Error(`RDAP returned HTTP ${response.status}`);
    }
    const data = response.data || {};
    const registrarEntity = (data.entities || []).find((entity: any) => entity.roles?.includes("registrar")) || {};
    const abuseEntity = (registrarEntity.entities || []).find((entity: any) => entity.roles?.includes("abuse")) || {};
    const registrantEntity = (data.entities || []).find((entity: any) => entity.roles?.includes("registrant"));
    const admin = mapEntity((data.entities || []).find((entity: any) => entity.roles?.includes("administrative")));
    const technical = mapEntity((data.entities || []).find((entity: any) => entity.roles?.includes("technical")));
    const billing = mapEntity((data.entities || []).find((entity: any) => entity.roles?.includes("billing")));
    const registrantContact = mapEntity(registrantEntity);

    return {
      domain: normalized,
      registrar: vcardValue(registrarEntity, "fn") || registrarEntity.handle || "Unknown",
      registrar_url: firstLink(registrarEntity.links) || "",
      registrar_email: vcardValue(abuseEntity, "email") || vcardValue(registrarEntity, "email") || "",
      registrant: {
        ...registrantContact,
        organization: vcardValue(registrantEntity, "org") || "",
        country: registrantContact.state || "",
      },
      admin,
      technical,
      billing,
      nameservers: (data.nameservers || []).map((ns: any) => ns.ldhName || ns.unicodeName).filter(Boolean),
      creation_date: eventDate(data.events, "registration"),
      expiration_date: eventDate(data.events, "expiration"),
      updated_date: eventDate(data.events, "last changed") || eventDate(data.events, "last update of RDAP database"),
      status: data.status || [],
      dnssec: data.secureDNS?.delegationSigned ? "signedDelegation" : "unsigned",
      raw_data: JSON.stringify(data, null, 2),
    };
  } catch (error) {
    throw new Error(`WHOIS lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function selectRandomRegistrar() {
  return { name: "Provider required", url: "", email: "" };
}

export function generateRegistrantInfo(): RegistrantInfo {
  return { ...emptyContact, organization: "", country: "" };
}

export function generateContactInfo(): ContactInfo {
  return { ...emptyContact };
}

export function generateNameservers(_domain: string): string[] {
  return [];
}

export function generateDates() {
  return { creation: "", expiration: "", updated: "" };
}

export function generateDomainStatus(): string[] {
  return [];
}

export function generateRawWHOISData(domain: string, _registrar: any): string {
  return `RDAP provider required for ${domain}. No mock WHOIS data returned.`;
}

export async function checkDomainExpiration(domain: string): Promise<{
  domain: string;
  expiration_date: string;
  days_until_expiration: number;
  status: 'active' | 'expiring_soon' | 'expired';
}> {
  const whois = await performWHOISLookup(domain);
  const expirationDate = whois.expiration_date ? new Date(whois.expiration_date) : null;
  const daysUntilExpiration = expirationDate ? Math.floor((expirationDate.getTime() - Date.now()) / 86400000) : 0;
  let status: 'active' | 'expiring_soon' | 'expired' = 'active';
  if (expirationDate && daysUntilExpiration < 0) status = 'expired';
  else if (expirationDate && daysUntilExpiration < 30) status = 'expiring_soon';
  return {
    domain,
    expiration_date: whois.expiration_date,
    days_until_expiration: Math.max(0, daysUntilExpiration),
    status,
  };
}

export async function getPrivacyStatus(domain: string) {
  const whois = await performWHOISLookup(domain);
  const protectedFields = [
    !whois.registrant.email ? "registrant_email" : null,
    !whois.registrant.phone ? "registrant_phone" : null,
    !whois.registrant.address ? "registrant_address" : null,
  ].filter(Boolean) as string[];
  return {
    domain,
    privacy_enabled: protectedFields.length > 0,
    privacy_service: protectedFields.length > 0 ? "Redacted by registry/registrar RDAP policy" : null,
    protected_fields: protectedFields,
  };
}

export async function getWHOISHistory(domain: string) {
  const whois = await performWHOISLookup(domain);
  return [{
    date: new Date().toISOString(),
    changes: [`Current RDAP status: ${whois.status.join(", ") || "unknown"}`],
  }];
}

function eventDate(events: any[] = [], action: string) {
  return events.find((event) => String(event.eventAction || "").toLowerCase() === action)?.eventDate || "";
}

function firstLink(links: any[] = []) {
  return links.find((link) => link.href)?.href || "";
}

function mapEntity(entity: any): ContactInfo {
  if (!entity) return { ...emptyContact };
  const adr = vcardArray(entity, "adr")?.[0] || [];
  return {
    name: vcardValue(entity, "fn") || entity.handle || "",
    email: vcardValue(entity, "email") || "",
    phone: vcardValue(entity, "tel") || "",
    address: [adr[2], adr[3]].filter(Boolean).join(" "),
    city: adr[4] || "",
    state: adr[5] || "",
    postal_code: adr[6] || "",
  };
}

function vcardValue(entity: any, key: string): string {
  return vcardArray(entity, key)?.[0] || "";
}

function vcardArray(entity: any, key: string): any[] | null {
  const item = entity?.vcardArray?.[1]?.find((entry: any[]) => entry[0] === key);
  const value = item?.[3];
  if (!value) return null;
  return Array.isArray(value) ? value : [value];
}
