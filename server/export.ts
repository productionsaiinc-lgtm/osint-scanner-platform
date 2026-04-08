/**
 * Export functionality for scan results
 * Supports PDF, CSV, JSON, and XLSX formats
 */

import { Scan, DiscoveredHost, DomainRecord, SocialMediaProfile } from "../drizzle/schema";

export interface ExportOptions {
  format: "pdf" | "csv" | "json" | "xlsx";
  includeAnalysis?: boolean;
  customTemplate?: string;
}

export async function exportScanResultsJSON(
  scan: Scan,
  hosts: DiscoveredHost[],
  domains: DomainRecord[],
  profiles: SocialMediaProfile[]
) {
  return {
    scan: {
      id: scan.id,
      type: scan.scanType,
      target: scan.target,
      status: scan.status,
      createdAt: scan.createdAt,
      updatedAt: scan.updatedAt,
    },
    hosts,
    domains,
    profiles,
    exportedAt: new Date().toISOString(),
  };
}

export async function exportScanResultsCSV(
  scan: Scan,
  hosts: DiscoveredHost[],
  domains: DomainRecord[],
  profiles: SocialMediaProfile[]
) {
  let csv = "OSINT Scan Results Export\n";
  csv += `Scan Type: ${scan.scanType}\n`;
  csv += `Target: ${scan.target}\n`;
  csv += `Status: ${scan.status}\n`;
  csv += `Created: ${scan.createdAt}\n\n`;

  // Hosts section
  if (hosts.length > 0) {
    csv += "DISCOVERED HOSTS\n";
    csv += "IP,Hostname,Open Ports,Services\n";
    hosts.forEach((host) => {
      csv += `${host.ipAddress || ""},${host.hostname || ""},${host.openPorts || ""},${host.services || ""}\n`;
    });
    csv += "\n";
  }

  // Domains section
  if (domains.length > 0) {
    csv += "DOMAIN RECORDS\n";
    csv += "Domain,Registrar,Registration Date,Expiration Date\n";
    domains.forEach((domain) => {
      csv += `${domain.domain || ""},${domain.registrar || ""},${domain.registrationDate || ""},${domain.expirationDate || ""}\n`;
    });
    csv += "\n";
  }

  // Profiles section
  if (profiles.length > 0) {
    csv += "SOCIAL PROFILES\n";
    csv += "Username,Platform,Followers\n";
    profiles.forEach((profile) => {
      csv += `${profile.username || ""},${profile.platform || ""},${profile.followers || ""}\n`;
    });
  }

  return csv;
}

export async function generatePDFReport(
  scan: Scan,
  hosts: DiscoveredHost[],
  domains: DomainRecord[],
  profiles: SocialMediaProfile[],
  analysis?: string
) {
  return {
    title: "OSINT Scan Report",
    scanType: scan.scanType,
    target: scan.target,
    status: scan.status,
    createdAt: scan.createdAt,
    hostsCount: hosts.length,
    domainsCount: domains.length,
    profilesCount: profiles.length,
    analysis: analysis || "No analysis available",
    generatedAt: new Date().toISOString(),
  };
}

export async function generateXLSXReport(
  scan: Scan,
  hosts: DiscoveredHost[],
  domains: DomainRecord[],
  profiles: SocialMediaProfile[]
) {
  return {
    sheets: [
      {
        name: "Summary",
        data: [
          ["OSINT Scan Report"],
          ["Scan Type", scan.scanType],
          ["Target", scan.target],
          ["Status", scan.status],
          ["Created", scan.createdAt],
          ["Hosts Found", hosts.length],
          ["Domains Found", domains.length],
          ["Profiles Found", profiles.length],
        ],
      },
      {
        name: "Hosts",
        data: [
          ["IP", "Hostname", "Open Ports", "Services"],
          ...hosts.map((h) => [h.ipAddress, h.hostname || "", h.openPorts || "", h.services || ""]),
        ],
      },
      {
        name: "Domains",
        data: [
          ["Domain", "Registrar", "Registration Date", "Expiration Date"],
          ...domains.map((d) => [
            d.domain,
            d.registrar || "",
            d.registrationDate || "",
            d.expirationDate || "",
          ]),
        ],
      },
      {
        name: "Profiles",
        data: [
          ["Username", "Platform", "Followers"],
          ...profiles.map((p) => [p.username, p.platform, p.followers || ""]),
        ],
      },
    ],
  };
}
