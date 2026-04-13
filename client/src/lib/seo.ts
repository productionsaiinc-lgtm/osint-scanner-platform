/**
 * SEO Helper Functions
 * Manages dynamic meta tags and SEO metadata
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

/**
 * Update document meta tags
 */
export function updateMetaTags(metadata: SEOMetadata): void {
  // Update title
  document.title = metadata.title;

  // Update or create description meta tag
  updateMetaTag("name", "description", metadata.description);

  // Update keywords if provided
  if (metadata.keywords && metadata.keywords.length > 0) {
    updateMetaTag("name", "keywords", metadata.keywords.join(", "));
  }

  // Update robots meta tag
  const robotsContent = [
    metadata.noindex ? "noindex" : "index",
    metadata.nofollow ? "nofollow" : "follow",
  ].join(", ");
  updateMetaTag("name", "robots", robotsContent);

  // Update Open Graph tags
  if (metadata.ogTitle) {
    updateMetaTag("property", "og:title", metadata.ogTitle);
  }
  if (metadata.ogDescription) {
    updateMetaTag("property", "og:description", metadata.ogDescription);
  }
  if (metadata.ogImage) {
    updateMetaTag("property", "og:image", metadata.ogImage);
  }
  if (metadata.ogUrl) {
    updateMetaTag("property", "og:url", metadata.ogUrl);
  }

  // Update Twitter Card
  if (metadata.twitterCard) {
    updateMetaTag("name", "twitter:card", metadata.twitterCard);
    updateMetaTag("name", "twitter:title", metadata.ogTitle || metadata.title);
    updateMetaTag("name", "twitter:description", metadata.ogDescription || metadata.description);
  }

  // Update canonical link
  if (metadata.canonical) {
    updateCanonicalLink(metadata.canonical);
  }
}

/**
 * Update or create a meta tag
 */
function updateMetaTag(type: "name" | "property", name: string, content: string): void {
  let element = document.querySelector(`meta[${type}="${name}"]`) as HTMLMetaElement;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(type, name);
    document.head.appendChild(element);
  }

  element.content = content;
}

/**
 * Update or create canonical link
 */
function updateCanonicalLink(url: string): void {
  let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement;

  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }

  link.href = url;
}

/**
 * SEO metadata for different pages
 */
export const pageMetadata = {
  home: {
    title: "OSINT & Network Scanner Platform - Advanced Reconnaissance Tools",
    description:
      "Professional OSINT scanner platform with network reconnaissance, social media OSINT, SIM swap detection, and advanced security tools for threat intelligence.",
    keywords: [
      "OSINT",
      "network scanner",
      "reconnaissance",
      "threat intelligence",
      "cybersecurity",
      "social media OSINT",
      "SIM swap detection",
      "phone lookup",
      "IMEI checker",
      "domain OSINT",
    ],
    ogTitle: "OSINT & Network Scanner Platform",
    ogDescription: "Professional OSINT scanner platform with advanced reconnaissance tools.",
    twitterCard: "summary_large_image" as const,
  },
  pricing: {
    title: "Pricing - OSINT & Network Scanner Platform",
    description:
      "Affordable OSINT scanner plans starting at $20/month. Get access to advanced reconnaissance tools, network scanning, and threat intelligence.",
    keywords: [
      "OSINT pricing",
      "network scanner pricing",
      "reconnaissance tools",
      "cybersecurity tools",
      "threat intelligence platform",
    ],
    ogTitle: "Pricing - OSINT & Network Scanner Platform",
    ogDescription: "Affordable plans for professional OSINT and network reconnaissance.",
    twitterCard: "summary_large_image" as const,
  },
  dashboard: {
    title: "Dashboard - OSINT & Network Scanner Platform",
    description: "Access your OSINT scanner dashboard with all reconnaissance tools.",
    keywords: ["OSINT dashboard", "network scanner", "reconnaissance tools"],
    noindex: true,
  },
  networkScanner: {
    title: "Network Scanner - OSINT & Network Scanner Platform",
    description:
      "Scan networks for open ports, perform ping tests, and traceroute analysis with our advanced network scanner.",
    keywords: ["network scanner", "port scanning", "ping", "traceroute", "network reconnaissance"],
    ogTitle: "Network Scanner Tool",
    ogDescription: "Advanced network scanning and reconnaissance tool.",
  },
  socialOSINT: {
    title: "Social Media OSINT - OSINT & Network Scanner Platform",
    description:
      "Discover social media profiles and information across multiple platforms with our social OSINT tool.",
    keywords: ["social OSINT", "social media reconnaissance", "profile discovery", "OSINT"],
    ogTitle: "Social Media OSINT Tool",
    ogDescription: "Discover social media profiles and information across platforms.",
  },
  simSwap: {
    title: "SIM Swap Detection - OSINT & Network Scanner Platform",
    description:
      "Check if a phone number has been SIM swapped with our advanced detection system.",
    keywords: ["SIM swap", "SIM swap detection", "phone security", "account security"],
    ogTitle: "SIM Swap Detection Tool",
    ogDescription: "Detect if a phone number has been SIM swapped.",
  },
  phoneLookup: {
    title: "Phone Lookup - OSINT & Network Scanner Platform",
    description: "Get detailed information about phone numbers including carrier and location data.",
    keywords: ["phone lookup", "phone number information", "carrier lookup", "phone OSINT"],
    ogTitle: "Phone Lookup Tool",
    ogDescription: "Get detailed information about phone numbers.",
  },
  imeiChecker: {
    title: "IMEI Checker - OSINT & Network Scanner Platform",
    description: "Check IMEI numbers to verify device information and detect blacklisted devices.",
    keywords: ["IMEI checker", "IMEI lookup", "device verification", "phone IMEI"],
    ogTitle: "IMEI Checker Tool",
    ogDescription: "Verify device information using IMEI numbers.",
  },
};
