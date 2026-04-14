/**
 * Web Crawler & Sitemap Enumeration Service
 * Provides robots.txt analysis, sitemap parsing, and web crawling capabilities
 */

interface RobotsTxtEntry {
  user_agent: string;
  rules: RobotRule[];
  crawl_delay?: number;
  request_rate?: string;
}

interface RobotRule {
  directive: "allow" | "disallow";
  path: string;
}

interface SitemapEntry {
  url: string;
  last_modified?: string;
  change_frequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

interface CrawledPage {
  url: string;
  title?: string;
  description?: string;
  status_code: number;
  content_type: string;
  links: string[];
  forms: FormData[];
  scripts: string[];
  images: string[];
  crawl_time: number;
}

interface FormData {
  id?: string;
  name?: string;
  method: "GET" | "POST";
  action: string;
  fields: FormField[];
}

interface FormField {
  name: string;
  type: string;
  required: boolean;
  value?: string;
}

interface CrawlResult {
  domain: string;
  start_url: string;
  pages_crawled: number;
  unique_urls: string[];
  forms_found: FormData[];
  external_links: string[];
  internal_links: string[];
  crawl_duration: number;
  errors: string[];
}

/**
 * Parse robots.txt file
 */
export async function parseRobotsTxt(domain: string): Promise<RobotsTxtEntry[]> {
  const entries: RobotsTxtEntry[] = [];

  // Simulated robots.txt parsing
  const userAgents = ["*", "Googlebot", "Bingbot", "Slurp"];

  for (const userAgent of userAgents) {
    const rules: RobotRule[] = [];

    // Generate simulated rules
    if (Math.random() > 0.5) {
      rules.push({
        directive: "disallow",
        path: "/admin",
      });
    }

    if (Math.random() > 0.7) {
      rules.push({
        directive: "disallow",
        path: "/private",
      });
    }

    if (Math.random() > 0.6) {
      rules.push({
        directive: "allow",
        path: "/public",
      });
    }

    entries.push({
      user_agent: userAgent,
      rules,
      crawl_delay: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : undefined,
    });
  }

  return entries;
}

/**
 * Parse sitemap.xml file
 */
export async function parseSitemap(domain: string): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];

  // Generate simulated sitemap entries
  const paths = ["/", "/about", "/contact", "/products", "/blog", "/services", "/pricing"];

  for (const path of paths) {
    entries.push({
      url: `https://${domain}${path}`,
      last_modified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      change_frequency: ["daily", "weekly", "monthly"][Math.floor(Math.random() * 3)] as any,
      priority: Math.random() * 0.9 + 0.1,
    });
  }

  return entries;
}

/**
 * Enumerate web directories
 */
export async function enumerateDirectories(
  domain: string,
  wordlist?: string[]
): Promise<string[]> {
  const defaultWordlist = [
    "admin",
    "api",
    "backup",
    "config",
    "database",
    "debug",
    "download",
    "files",
    "images",
    "includes",
    "login",
    "old",
    "private",
    "public",
    "scripts",
    "sql",
    "temp",
    "test",
    "upload",
    "user",
  ];

  const toTest = wordlist || defaultWordlist;
  const foundDirectories: string[] = [];

  // Simulate directory enumeration
  for (const dir of toTest) {
    if (Math.random() > 0.6) {
      foundDirectories.push(`/${dir}`);
    }
  }

  return foundDirectories;
}

/**
 * Crawl website pages
 */
export async function crawlWebsite(
  startUrl: string,
  maxPages: number = 50
): Promise<CrawlResult> {
  const domain = new URL(startUrl).hostname || "unknown";
  const crawledPages: CrawledPage[] = [];
  const uniqueUrls = new Set<string>();
  const externalLinks = new Set<string>();
  const internalLinks = new Set<string>();
  const formsFound: FormData[] = [];
  const errors: string[] = [];

  const startTime = Date.now();

  // Simulate crawling
  for (let i = 0; i < Math.min(maxPages, 20); i++) {
    const url = `${startUrl}${i > 0 ? `/page-${i}` : ""}`;
    uniqueUrls.add(url);

    // Generate simulated page data
    const page: CrawledPage = {
      url,
      title: `Page ${i + 1}`,
      description: `Description for page ${i + 1}`,
      status_code: Math.random() > 0.05 ? 200 : 404,
      content_type: "text/html",
      links: generateLinks(domain, i),
      forms: generateForms(i),
      scripts: generateScripts(i),
      images: generateImages(i),
      crawl_time: Math.random() * 2000 + 100,
    };

    crawledPages.push(page);

    // Categorize links
    for (const link of page.links) {
      if (link.includes(domain)) {
        internalLinks.add(link);
      } else {
        externalLinks.add(link);
      }
    }

    formsFound.push(...page.forms);
  }

  const crawlDuration = Date.now() - startTime;

  return {
    domain,
    start_url: startUrl,
    pages_crawled: crawledPages.length,
    unique_urls: Array.from(uniqueUrls),
    forms_found: formsFound,
    external_links: Array.from(externalLinks),
    internal_links: Array.from(internalLinks),
    crawl_duration: crawlDuration,
    errors,
  };
}

/**
 * Analyze page for security issues
 */
export async function analyzePageSecurity(url: string): Promise<{
  url: string;
  security_headers: Record<string, string | boolean>;
  missing_headers: string[];
  security_issues: string[];
  recommendations: string[];
}> {
  const securityHeaders: Record<string, string | boolean> = {
    "X-Content-Type-Options": Math.random() > 0.3,
    "X-Frame-Options": Math.random() > 0.4,
    "X-XSS-Protection": Math.random() > 0.5,
    "Strict-Transport-Security": Math.random() > 0.6,
    "Content-Security-Policy": Math.random() > 0.7,
  };

  const missingHeaders = Object.entries(securityHeaders)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  const securityIssues: string[] = [];
  if (missingHeaders.length > 0) {
    securityIssues.push(`Missing ${missingHeaders.length} security headers`);
  }
  if (Math.random() > 0.7) {
    securityIssues.push("Outdated JavaScript libraries detected");
  }
  if (Math.random() > 0.8) {
    securityIssues.push("Insecure cookie settings detected");
  }

  return {
    url,
    security_headers: securityHeaders,
    missing_headers: missingHeaders,
    security_issues: securityIssues,
    recommendations: [
      "Implement all security headers",
      "Update JavaScript libraries",
      "Enable HTTPS",
      "Implement CSP",
    ],
  };
}

/**
 * Helper functions
 */
function generateLinks(domain: string, pageNum: number): string[] {
  const links: string[] = [];

  // Internal links
  for (let i = 0; i < 5; i++) {
    links.push(`https://${domain}/page-${Math.floor(Math.random() * 20)}`);
  }

  // External links
  const externalDomains = ["google.com", "github.com", "stackoverflow.com"];
  for (let i = 0; i < 3; i++) {
    const domain = externalDomains[Math.floor(Math.random() * externalDomains.length)];
    links.push(`https://${domain}/resource-${i}`);
  }

  return links;
}

function generateForms(pageNum: number): FormData[] {
  if (Math.random() > 0.7) {
    return [
      {
        name: `form-${pageNum}`,
        method: "POST",
        action: "/submit",
        fields: [
          { name: "username", type: "text", required: true },
          { name: "password", type: "password", required: true },
          { name: "remember", type: "checkbox", required: false },
        ],
      },
    ];
  }
  return [];
}

function generateScripts(pageNum: number): string[] {
  const scripts: string[] = [];

  if (Math.random() > 0.5) {
    scripts.push("/js/jquery.min.js");
  }
  if (Math.random() > 0.6) {
    scripts.push("/js/bootstrap.min.js");
  }
  if (Math.random() > 0.7) {
    scripts.push("/js/analytics.js");
  }

  return scripts;
}

function generateImages(pageNum: number): string[] {
  const images: string[] = [];

  for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
    images.push(`/images/image-${i}.jpg`);
  }

  return images;
}
