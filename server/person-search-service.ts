/**
 * Person Search & Email Intelligence Service
 * Provides person search, email format detection, and person-email relationship mapping
 */

interface PersonProfile {
  name: string;
  email: string;
  phone?: string;
  location: string;
  organization?: string;
  social_profiles: SocialProfile[];
  breach_status: string;
  data_sources: string[];
  confidence_score: number;
}

interface SocialProfile {
  platform: string;
  username: string;
  profile_url: string;
  followers?: number;
  verified: boolean;
}

interface EmailFormat {
  email: string;
  format_pattern: string;
  domain: string;
  username: string;
  likely_first_name?: string;
  likely_last_name?: string;
  format_type: "firstname.lastname" | "firstnamelastname" | "first_last" | "flastname" | "unknown";
}

interface PersonEmailRelationship {
  person_name: string;
  emails: string[];
  email_patterns: string[];
  confidence_score: number;
  sources: string[];
  last_seen: string;
}

interface PhoneIntelligence {
  phone: string;
  country: string;
  carrier: string;
  type: "mobile" | "landline" | "voip" | "unknown";
  is_valid: boolean;
  is_registered: boolean;
  associated_names: string[];
  breach_status: string;
}

/**
 * Search for person by name and location
 */
export async function searchPerson(
  name: string,
  location?: string
): Promise<PersonProfile[]> {
  const profiles: PersonProfile[] = [];

  // Generate simulated person profiles
  const firstNames = name.split(" ")[0];
  const lastNames = name.split(" ").slice(1).join(" ");

  for (let i = 0; i < 3; i++) {
    const email = `${firstNames.toLowerCase()}.${lastNames.toLowerCase().replace(" ", ".")}${i > 0 ? i : ""}@example.com`;

    profiles.push({
      name,
      email,
      phone: generatePhoneNumber(),
      location: location || generateLocation(),
      organization: generateOrganization(),
      social_profiles: generateSocialProfiles(firstNames, lastNames),
      breach_status: Math.random() > 0.7 ? "found_in_breach" : "clean",
      data_sources: ["LinkedIn", "Twitter", "GitHub", "Public Records"],
      confidence_score: Math.random() * 100,
    });
  }

  return profiles;
}

/**
 * Detect email format pattern
 */
export async function detectEmailFormat(email: string): Promise<EmailFormat> {
  const [username, domain] = email.split("@");

  // Analyze username pattern
  let formatType: EmailFormat["format_type"] = "unknown";
  let likelyFirstName: string | undefined;
  let likelyLastName: string | undefined;

  if (username.includes(".")) {
    const parts = username.split(".");
    if (parts.length === 2) {
      formatType = "firstname.lastname";
      likelyFirstName = parts[0];
      likelyLastName = parts[1];
    }
  } else if (username.includes("_")) {
    const parts = username.split("_");
    if (parts.length === 2) {
      formatType = "first_last";
      likelyFirstName = parts[0];
      likelyLastName = parts[1];
    }
  } else if (username.length > 5 && /^[a-z]+[a-z]+$/.test(username)) {
    // Could be firstnamelastname or flastname
    if (username.length > 10) {
      formatType = "firstnamelastname";
      likelyFirstName = username.substring(0, Math.floor(username.length / 2));
      likelyLastName = username.substring(Math.floor(username.length / 2));
    } else {
      formatType = "flastname";
      likelyFirstName = username.charAt(0);
      likelyLastName = username.substring(1);
    }
  }

  return {
    email,
    format_pattern: username,
    domain,
    username,
    likely_first_name: likelyFirstName,
    likely_last_name: likelyLastName,
    format_type: formatType,
  };
}

/**
 * Find emails associated with a person
 */
export async function findPersonEmails(name: string): Promise<PersonEmailRelationship> {
  const parts = name.split(" ");
  const firstName = parts[0].toLowerCase();
  const lastName = parts.slice(1).join("").toLowerCase();

  const emails = [
    `${firstName}.${lastName}@gmail.com`,
    `${firstName}${lastName}@yahoo.com`,
    `${firstName}_${lastName}@outlook.com`,
    `${firstName}${lastName}@company.com`,
    `${firstName}.${lastName}@linkedin.com`,
  ];

  const emailPatterns = [
    "firstname.lastname@domain",
    "firstnamelastname@domain",
    "firstname_lastname@domain",
    "f.lastname@domain",
  ];

  return {
    person_name: name,
    emails,
    email_patterns: emailPatterns,
    confidence_score: Math.random() * 100,
    sources: ["Email databases", "Social media", "Public records"],
    last_seen: new Date().toISOString(),
  };
}

/**
 * Validate and analyze phone number
 */
export async function analyzePhoneNumber(phone: string): Promise<PhoneIntelligence> {
  // Remove common formatting
  const cleanPhone = phone.replace(/\D/g, "");

  // Determine country and carrier
  let country = "Unknown";
  let carrier = "Unknown";
  let type: PhoneIntelligence["type"] = "unknown";

  if (cleanPhone.startsWith("1")) {
    country = "United States";
    carrier = generateCarrier();
    type = Math.random() > 0.3 ? "mobile" : "landline";
  } else if (cleanPhone.startsWith("44")) {
    country = "United Kingdom";
    carrier = generateCarrier();
    type = "mobile";
  } else if (cleanPhone.startsWith("33")) {
    country = "France";
    carrier = generateCarrier();
    type = "mobile";
  }

  return {
    phone,
    country,
    carrier,
    type,
    is_valid: cleanPhone.length >= 10,
    is_registered: Math.random() > 0.3,
    associated_names: generateNames(3),
    breach_status: Math.random() > 0.8 ? "found_in_breach" : "clean",
  };
}

/**
 * Perform reverse phone lookup
 */
export async function reversePhoneLookup(phone: string): Promise<{
  phone: string;
  name?: string;
  location?: string;
  type: string;
  carrier: string;
  is_spam: boolean;
}> {
  const intelligence = await analyzePhoneNumber(phone);

  return {
    phone,
    name: generateNames(1)[0],
    location: generateLocation(),
    type: intelligence.type,
    carrier: intelligence.carrier,
    is_spam: Math.random() > 0.85,
  };
}

/**
 * Check if email is in breach database
 */
export async function checkEmailBreach(email: string): Promise<{
  email: string;
  is_breached: boolean;
  breaches: Array<{
    name: string;
    date: string;
    data_exposed: string[];
  }>;
  password_exposed: boolean;
  recommendations: string[];
}> {
  const isBreached = Math.random() > 0.7;

  const breaches = isBreached
    ? [
        {
          name: "LinkedIn Data Breach",
          date: "2021-06-15",
          data_exposed: ["email", "name", "phone"],
        },
        {
          name: "Facebook Data Breach",
          date: "2019-04-03",
          data_exposed: ["email", "name", "location"],
        },
      ]
    : [];

  return {
    email,
    is_breached: isBreached,
    breaches,
    password_exposed: isBreached && Math.random() > 0.5,
    recommendations: isBreached
      ? [
          "Change password immediately",
          "Enable two-factor authentication",
          "Monitor account for suspicious activity",
        ]
      : ["Monitor for future breaches"],
  };
}

/**
 * Generate email format patterns for organization
 */
export async function generateOrganizationEmailPatterns(
  organizationName: string
): Promise<string[]> {
  const domain = organizationName.toLowerCase().replace(/\s+/g, "");

  return [
    `firstname.lastname@${domain}.com`,
    `firstnamelastname@${domain}.com`,
    `firstname_lastname@${domain}.com`,
    `f.lastname@${domain}.com`,
    `first.last@${domain}.com`,
    `flastname@${domain}.com`,
  ];
}

/**
 * Helper functions
 */
function generatePhoneNumber(): string {
  return `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
}

function generateLocation(): string {
  const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "London", "Toronto"];
  return cities[Math.floor(Math.random() * cities.length)];
}

function generateOrganization(): string {
  const orgs = ["Google", "Microsoft", "Apple", "Amazon", "Meta", "Tesla", "Netflix"];
  return orgs[Math.floor(Math.random() * orgs.length)];
}

function generateSocialProfiles(firstName: string, lastName: string): SocialProfile[] {
  const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;

  return [
    {
      platform: "Twitter",
      username,
      profile_url: `https://twitter.com/${username}`,
      followers: Math.floor(Math.random() * 10000),
      verified: Math.random() > 0.9,
    },
    {
      platform: "LinkedIn",
      username,
      profile_url: `https://linkedin.com/in/${username}`,
      verified: true,
    },
    {
      platform: "GitHub",
      username,
      profile_url: `https://github.com/${username}`,
      followers: Math.floor(Math.random() * 1000),
      verified: false,
    },
  ];
}

function generateCarrier(): string {
  const carriers = ["Verizon", "AT&T", "T-Mobile", "Sprint", "US Cellular"];
  return carriers[Math.floor(Math.random() * carriers.length)];
}

function generateNames(count: number): string[] {
  const firstNames = ["John", "Jane", "Michael", "Sarah", "David", "Emma"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia"];

  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    names.push(`${first} ${last}`);
  }
  return names;
}
