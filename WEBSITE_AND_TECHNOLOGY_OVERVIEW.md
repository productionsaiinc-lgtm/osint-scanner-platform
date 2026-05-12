# OSINT Scanner Platform Website and Technology Overview

Live website: https://osintscan-fftqerzj.manus.space

GitHub source: https://github.com/productionsaiinc-lgtm/osint-scanner-platform.git

## Summary

OSINT Scanner Platform is an authenticated web application for open-source intelligence, network reconnaissance, security monitoring, device management, reporting, and billing workflows. The application combines a React dashboard, an Express/tRPC backend, persistent database records, live third-party API integrations, export/reporting tools, and Manus deployment.

The product is organized around operational OSINT tasks: network and domain scanning, public data enrichment, social and threat intelligence, forensics, monitoring, canary tokens, virtual infrastructure management, mobile device management, cloud storage, and payment/subscription workflows.

## Primary User Experience

Unauthenticated users see the public landing, pricing, download, and payment result pages. Authenticated users enter a dashboard with a collapsible sidebar organized by tool category. The dashboard supports responsive layouts, loading skeletons, error boundaries, toast notifications, and mobile-friendly navigation.

The main application routes are defined in `client/src/App.tsx`, and the sidebar tool catalog is defined in `client/src/components/DashboardLayout.tsx`.

## Website Sections and Tools

### Core

- Dashboard: Overview landing page for authenticated users.
- Scan History: Historical scan records and result review.
- Monitoring: Asset monitoring and alert workflow.
- Alert History: Review of generated alerts.
- Notifications: User notification center.
- Dark Web Monitor: Breach/dark-web monitoring workflow backed by real provider checks where configured.
- Crypto Tracker: Bitcoin address tracking via public blockchain data.
- Employee Enum: Public employee/email enrichment using Hunter.io and GitHub when configured.
- Geo Reverse: Reverse geocoding from coordinates using OpenStreetMap/Nominatim.
- Flight Tracker: Flight lookup workflow requiring an aviation data provider key.

### Network and Infrastructure

- Network Scanner: Geolocation, TCP port checks, reachability, domain OSINT, and supporting network intelligence.
- Nmap Scanner: Network scan-style UI for port/service discovery.
- Shodan: Shodan device search and SecurityTrails domain reconnaissance.
- DNS Enumeration: DNS records, DNSSEC, reverse name server, and DNS history workflows.
- WHOIS Lookup: WHOIS/RDAP-style domain lookup workflows.
- VPN Connection: VPN connection management and status.
- IoT Scanner: Internet-exposed IoT device discovery using Shodan when configured.

### Web and Domain Security

- Web Scraper: Live HTTP fetch, metadata extraction, selector text extraction, headings, links, images, and technology hints.
- SSL Analyzer: SSL/TLS certificate analysis workflow.
- WAF Detection: Web application firewall detection and bypass/rule analysis workflows.
- Subdomain Takeover: Subdomain takeover risk scanning and monitoring.

### Forensics

- Metadata Extractor: Metadata extraction, stripping, timeline, and comparison workflows.
- Reverse Image Search: Image analysis, color search, object detection, and OCR-style extraction workflows.
- Malware Analyzer: File hash analysis through VirusTotal when `VIRUSTOTAL_API_KEY` is configured.
- Password Cracker: Educational password strength analysis.
- Deepfake Detector: Media-forensics workflow that requires a real provider before returning detection results.

### Intelligence and Threat

- Social Media OSINT: Username and breach intelligence lookup.
- GitHub Search: GitHub repository and public code search.
- CVE Database: NVD vulnerability search.
- Vulnerability Scanner: Web vulnerability analysis workflow.
- Supply Chain Analyzer: Provider-backed supply-chain analysis workflow.
- Insider Threat: Requires real audit/access logs before scoring users.

### Personal and Device

- Phone Lookup: Phone intelligence workflow.
- IMEI Checker: IMEI/device lookup workflow.
- SIM Swap Lookup: SIM swap risk lookup workflow.
- Credit Card Checker: Card validation/check workflow.

### Visualization and Tools

- Map View: Geospatial view for IP/location data.
- Pentest Lab: Hands-on labs, scoring, hints, submissions, and rewards integration.
- Canary Tokens: Token creation, trigger tracking, statistics, and alerting.
- URL Shortener: Persistent short URL backend with `/s/:shortCode` redirects and click tracking.
- Temp Email: Temporary email backend and inbox/message management.
- File Analyzer: File hash scanning and VirusTotal-backed analysis.
- Sock Puppets: Persona management for OSINT investigations.

### Infrastructure and Computing

- Virtual Computers: Persistent VM records and lifecycle actions.
- Virtual Phones: Persistent device records and provisioning.
- Cloud Storage: S3-backed file upload, folders, download URLs, and storage overview.

### Vehicle

- Ontario License Plate: License plate lookup workflow.
- VIN Decoder: VIN decoding using NHTSA vPIC data.

### Mobile Device Management

- MDM Dashboard: Real device enrollment links, device registration endpoint, provisioning workflows, policies, app management, threat detection, geofencing, compliance reporting, user behavior analytics, and OSINT integration for managed devices.

### Account and Billing

- Pricing: Subscription/pricing page.
- Subscription: Subscription management.
- Payouts: Payout dashboard.
- Payouts Enhanced: Enhanced payout management.
- Live Payouts: PayPal-backed live payout tracking and payout creation.
- About: Platform and integration overview.

## Backend Capabilities

The backend is an Express server with tRPC routers. Important server areas include:

- `server/routers.ts`: core auth, scan creation, network scans, domain scans, and social scans.
- `server/osint.ts`: live OSINT/network helpers, including TCP scanning, DNS, RDAP, crt.sh, TLS certificate lookup, GitHub, NVD, Wayback, and HIBP-backed credential checks.
- `server/osint-tools-router.ts`: broader OSINT tools and third-party provider integrations.
- `server/new-security-tools-router.ts`: reverse image search, DNS enumeration, WAF detection, subdomain takeover, WHOIS, and metadata extraction.
- `server/url-shortener-router.ts`: persistent short URL creation and analytics.
- `server/temp-email-router.ts` and `server/temporary-email-router.ts`: temporary email workflows.
- `server/file-analysis-router.ts`: file hash analysis and VirusTotal integration.
- `server/cloud-storage-router.ts`: S3-backed cloud storage.
- `server/mdm-router.ts`: mobile device management backend.
- `server/virtual-computers-router.ts`: virtual computer records and lifecycle operations.
- `server/virtual-phones-router.ts`: virtual phone records and provisioning.
- `server/rewards-router.ts` and `server/pentest-labs-router.ts`: pentest lab points, achievements, lab completion, and leaderboard flows.
- `server/subscription-router.ts`, `server/payment-methods-router.ts`, `server/live-payouts-router.ts`, `server/paypal-integration.ts`, and `server/stripe-webhook.ts`: billing, payment, payout, and webhook flows.
- `server/export-router.ts` and `server/export.ts`: report export in PDF, CSV, JSON, and XLSX formats.
- `server/monitoring-router.ts` and `server/monitoring-service.ts`: asset monitoring and alert generation.

The server starts from `server/_core/index.ts`, registers webhooks before JSON parsing, exposes `/api/trpc`, serves short URL redirects at `/s/:shortCode`, records canary token triggers at `/api/canary/:tokenId`, and serves either Vite development middleware or built static assets depending on `NODE_ENV`.

## Data and Persistence

The platform uses MySQL with Drizzle ORM. Database helpers live in `server/db.ts`, with migrations and table setup in:

- `server/migrations/create-monitoring-tables.ts`
- `server/migrations/create-medium-priority-tables.ts`
- `server/migrations/create-mdm-tables.ts`

Persistent feature areas include scans, discovered hosts, domain records, social profiles, monitoring assets, alerts, canary tokens, temporary emails, URL shortener records, cloud storage metadata, virtual computers, virtual phones, MDM records, rewards, lab completions, subscriptions, and payout/payment records.

## Real Data Sources and Provider Integrations

The application supports both free public endpoints and key-based providers. Current live or provider-backed sources include:

- ip-api.com for IP geolocation and ASN-style lookup.
- Node DNS resolver and Google DNS APIs for DNS data.
- RDAP.org for domain registration data.
- crt.sh for certificate transparency and subdomain discovery.
- TLS socket inspection for live certificate details.
- NVD/NIST CVE API for vulnerability and threat feed data.
- GitHub API for repository and user/profile enrichment.
- OpenStreetMap Nominatim for reverse geocoding.
- NHTSA vPIC for VIN decoding.
- Blockstream public API for Bitcoin address data.
- VirusTotal for malware and file hash intelligence.
- Shodan for device, port, and IoT intelligence.
- SecurityTrails for richer domain intelligence and subdomains.
- Hunter.io for public business email and employee enumeration.
- IPQualityScore for IP reputation checks.
- Have I Been Pwned for breach and credential exposure checks.
- Aviationstack for flight tracking.
- PayPal for payouts and payment flows.
- Stripe for payment processing.
- AWS S3-compatible storage for cloud file storage.
- Nodemailer/SMTP for email alerting.

Tools that require paid or third-party provider access return explicit provider/API-key-needed errors rather than invented results.

## Required and Optional Environment Variables

Core app/runtime variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `OAUTH_SERVER_URL`
- `OWNER_OPEN_ID`
- `VITE_APP_ID`
- `VITE_APP_URL`
- `PORT`
- `NODE_ENV`

OSINT/provider variables:

- `VIRUSTOTAL_API_KEY`
- `SHODAN_API_KEY`
- `SECURITYTRAILS_API_KEY`
- `HUNTER_API_KEY`
- `HIBP_API_KEY`
- `IPQUALITYSCORE_API_KEY`
- `IPQS_API_KEY`
- `AVIATIONSTACK_API_KEY`
- `GITHUB_TOKEN`
- `GITHUB_API_KEY`
- `MAXMIND_API_KEY`
- `NVD_API_KEY`
- `WHOIS_API_KEY`
- `CLOUDFLARE_API_KEY`

Payments and payouts:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_MODE`
- `PAYPAL_PAYOUT_EMAIL`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_WEBHOOK_SECRET`

Storage and email:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `S3_REGION`
- `S3_BUCKET`
- `EMAIL_USER`
- `EMAIL_PASSWORD`

Manus/Forge runtime:

- `BUILT_IN_FORGE_API_KEY`
- `BUILT_IN_FORGE_API_URL`
- `VITE_FRONTEND_FORGE_API_KEY`
- `VITE_FRONTEND_FORGE_API_URL`
- `VITE_OAUTH_PORTAL_URL`

Secrets should be stored in Manus environment variables/secrets for production deployment. Local `.env` files are ignored by Git and should not be committed.

## Frontend Technology Stack

- React 18
- TypeScript
- Vite
- Wouter routing
- tRPC React Query client
- TanStack React Query
- Tailwind CSS 4
- Radix UI primitives
- Lucide React icons
- Framer Motion
- Recharts
- Sonner toast notifications
- React Hook Form and Zod validation
- Responsive dashboard layout with custom sidebar state

## Backend Technology Stack

- Node.js
- Express 4
- tRPC 11
- TypeScript
- Drizzle ORM
- MySQL
- Axios
- Node `dns`, `net`, and `tls` modules for live network lookups
- Stripe SDK
- PayPal REST API integration
- AWS SDK S3 client and presigned URLs
- Nodemailer
- jose for JWT/session work
- SuperJSON
- Zod validation

## Build, Test, and Deployment

Project scripts:

- `npm run dev`: starts the development server through `tsx watch`.
- `npm run build`: builds the Vite frontend and bundles the backend with esbuild.
- `npm run start`: starts the production backend from `dist/index.js`.
- `npm run check`: runs TypeScript without emitting files.
- `npm run test`: runs Vitest tests.
- `npm run db:push`: generates and runs Drizzle migrations.

Deployment is configured around GitHub main branch pushes and Manus auto-deployment. The documented flow is:

1. Make local changes.
2. Test locally.
3. Commit changes.
4. Push to GitHub `main`.
5. Manus rebuilds and deploys the live app.

## Security Notes

- API keys must not be committed.
- `.env`, `.env.local`, and deployment secret files are ignored by Git.
- Production provider keys belong in Manus environment variables/secrets.
- Webhook routes are registered before JSON parsing where raw body verification matters.
- The app uses authenticated dashboard routes and role-aware user handling.
- Some security tools are intentionally provider-gated to avoid returning fake risk scores.

## Current Operational Notes

- Latest documented live site: https://osintscan-fftqerzj.manus.space
- Source repository: https://github.com/productionsaiinc-lgtm/osint-scanner-platform.git
- Current local VirusTotal key is stored only in local `.env`; it must also be added to Manus production secrets as `VIRUSTOTAL_API_KEY`.
- Remaining provider keys should be added to Manus as they become available.
- The remaining TODO items after this document are real device enrollment for MDM, graphical environments for virtual computers/phones, dashboard feature coverage, and final audit of any remaining mock data/provider gaps.
