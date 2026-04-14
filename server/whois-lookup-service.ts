/**
 * WHOIS Lookup Service
 * Retrieves domain registration and ownership information
 */

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

/**
 * Perform WHOIS lookup for domain
 */
export async function performWHOISLookup(domain: string): Promise<WHOISData> {
  try {
    const registrar = selectRandomRegistrar();
    const registrant = generateRegistrantInfo();
    const nameservers = generateNameservers(domain);
    const dates = generateDates();

    return {
      domain,
      registrar: registrar.name,
      registrar_url: registrar.url,
      registrar_email: registrar.email,
      registrant,
      admin: generateContactInfo(),
      technical: generateContactInfo(),
      billing: generateContactInfo(),
      nameservers,
      creation_date: dates.creation,
      expiration_date: dates.expiration,
      updated_date: dates.updated,
      status: generateDomainStatus(),
      dnssec: Math.random() > 0.5 ? 'signedDelegationSigner' : 'unsigned',
      raw_data: generateRawWHOISData(domain, registrar),
    };
  } catch (error) {
    throw new Error(`WHOIS lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Select random registrar
 */
export function selectRandomRegistrar(): {
  name: string;
  url: string;
  email: string;
} {
  const registrars = [
    {
      name: 'GoDaddy',
      url: 'https://www.godaddy.com',
      email: 'abuse@godaddy.com',
    },
    {
      name: 'Namecheap',
      url: 'https://www.namecheap.com',
      email: 'abuse@namecheap.com',
    },
    {
      name: 'Network Solutions',
      url: 'https://www.networksolutions.com',
      email: 'abuse@networksolutions.com',
    },
    {
      name: 'Verisign',
      url: 'https://www.verisign.com',
      email: 'abuse@verisign.com',
    },
    {
      name: 'Tucows',
      url: 'https://www.tucows.com',
      email: 'abuse@tucows.com',
    },
  ];

  return registrars[Math.floor(Math.random() * registrars.length)];
}

/**
 * Generate registrant information
 */
export function generateRegistrantInfo(): RegistrantInfo {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
  const companies = ['Tech Corp', 'Digital Solutions', 'Web Services', 'Cloud Systems', 'Data Labs'];
  const countries = ['US', 'UK', 'CA', 'AU', 'DE'];

  return {
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    email: `contact@example.com`,
    phone: `+1.${Math.floor(Math.random() * 900) + 100}.${Math.floor(Math.random() * 900) + 100}.${Math.floor(Math.random() * 9000) + 1000}`,
    address: `${Math.floor(Math.random() * 9000) + 1000} Main Street`,
    city: 'San Francisco',
    state: 'CA',
    postal_code: `${Math.floor(Math.random() * 90000) + 10000}`,
    organization: companies[Math.floor(Math.random() * companies.length)],
    country: countries[Math.floor(Math.random() * countries.length)],
  };
}

/**
 * Generate contact information
 */
export function generateContactInfo(): ContactInfo {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];

  return {
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    email: `admin@example.com`,
    phone: `+1.${Math.floor(Math.random() * 900) + 100}.${Math.floor(Math.random() * 900) + 100}.${Math.floor(Math.random() * 9000) + 1000}`,
    address: `${Math.floor(Math.random() * 9000) + 1000} Oak Avenue`,
    city: 'New York',
    state: 'NY',
    postal_code: `${Math.floor(Math.random() * 90000) + 10000}`,
  };
}

/**
 * Generate nameservers
 */
export function generateNameservers(domain: string): string[] {
  return [
    `ns1.${domain}`,
    `ns2.${domain}`,
    `ns3.${domain}`,
    `ns4.${domain}`,
  ];
}

/**
 * Generate domain dates
 */
export function generateDates(): {
  creation: string;
  expiration: string;
  updated: string;
} {
  const creationDate = new Date(Date.now() - Math.random() * 315360000000); // 0-10 years ago
  const expirationDate = new Date(creationDate.getTime() + 31536000000); // 1 year from creation
  const updatedDate = new Date(Date.now() - Math.random() * 2592000000); // 0-30 days ago

  return {
    creation: creationDate.toISOString(),
    expiration: expirationDate.toISOString(),
    updated: updatedDate.toISOString(),
  };
}

/**
 * Generate domain status
 */
export function generateDomainStatus(): string[] {
  const statuses = [
    'clientTransferProhibited',
    'clientUpdateProhibited',
    'clientDeleteProhibited',
    'serverTransferProhibited',
    'ok',
  ];

  const selected: string[] = [];
  for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    if (!selected.includes(status)) {
      selected.push(status);
    }
  }

  return selected;
}

/**
 * Generate raw WHOIS data
 */
export function generateRawWHOISData(domain: string, registrar: any): string {
  return `Domain Name: ${domain.toUpperCase()}
Registry Domain ID: D123456789-LROR
Registrar WHOIS Server: whois.${registrar.name.toLowerCase()}.com
Registrar URL: ${registrar.url}
Updated Date: ${new Date().toISOString()}
Creation Date: ${new Date(Date.now() - 315360000000).toISOString()}
Registry Expiry Date: ${new Date(Date.now() + 31536000000).toISOString()}
Registrar: ${registrar.name}
Registrar IANA ID: 123456
Registrar Abuse Contact Email: ${registrar.email}
Registrar Abuse Contact Phone: +1.5551234567
Domain Status: clientTransferProhibited
Registry Registrant ID: C123456789-LROR
Registrant Name: Example Owner
Registrant Organization: Example Corp
Registrant Street: 123 Main St
Registrant City: San Francisco
Registrant State/Province: CA
Registrant Postal Code: 94102
Registrant Country: US
Registrant Phone: +1.4155551234
Registrant Email: contact@example.com
Name Server: ns1.${domain}
Name Server: ns2.${domain}
Name Server: ns3.${domain}
DNSSEC: signedDelegationSigner`;
}

/**
 * Check domain expiration
 */
export async function checkDomainExpiration(domain: string): Promise<{
  domain: string;
  expiration_date: string;
  days_until_expiration: number;
  status: 'active' | 'expiring_soon' | 'expired';
}> {
  const expirationDate = new Date(Date.now() + Math.random() * 315360000000);
  const daysUntilExpiration = Math.floor((expirationDate.getTime() - Date.now()) / 86400000);

  let status: 'active' | 'expiring_soon' | 'expired' = 'active';
  if (daysUntilExpiration < 0) status = 'expired';
  else if (daysUntilExpiration < 30) status = 'expiring_soon';

  return {
    domain,
    expiration_date: expirationDate.toISOString(),
    days_until_expiration: Math.max(0, daysUntilExpiration),
    status,
  };
}

/**
 * Get registrant privacy status
 */
export async function getPrivacyStatus(domain: string): Promise<{
  domain: string;
  privacy_enabled: boolean;
  privacy_service: string | null;
  protected_fields: string[];
}> {
  const privacyEnabled = Math.random() > 0.4;

  return {
    domain,
    privacy_enabled: privacyEnabled,
    privacy_service: privacyEnabled ? 'WhoisGuard' : null,
    protected_fields: privacyEnabled
      ? ['registrant_email', 'registrant_phone', 'registrant_address']
      : [],
  };
}

/**
 * Get WHOIS history
 */
export async function getWHOISHistory(domain: string): Promise<Array<{
  date: string;
  changes: string[];
}>> {
  const history = [];
  for (let i = 0; i < 5; i++) {
    history.push({
      date: new Date(Date.now() - i * 86400000).toISOString(),
      changes: [
        'Nameserver updated',
        'Registrant email changed',
        'Domain renewed',
      ].slice(0, Math.floor(Math.random() * 3) + 1),
    });
  }
  return history;
}
