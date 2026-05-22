# API Keys and External Providers

The application must not fabricate OSINT results when a live provider is missing. Tools that cannot use a public source now return a clear provider/API-key message instead of mock data.

## Currently Configured Locally

- `VIRUSTOTAL_API_KEY`

## OSINT Provider Keys

- `HIBP_API_KEY` - Have I Been Pwned breach and dark web monitoring.
- `HUNTER_API_KEY` - Employee email enrichment from Hunter.io.
- `GITHUB_TOKEN` or `GITHUB_API_KEY` - Higher-rate GitHub code/profile search.
- `SHODAN_API_KEY` - Shodan host intelligence, IoT search, and Nmap-style host results.
- `SECURITYTRAILS_API_KEY` - Domain/subdomain intelligence.
- `IPQUALITYSCORE_API_KEY` or `IPQS_API_KEY` - IP reputation checks.
- `AVIATIONSTACK_API_KEY` - Flight tracking.
- `NUMVERIFY_API_KEY` or `ABSTRACT_PHONE_API_KEY` - Phone carrier/line-type lookup.
- `LICENSE_PLATE_LOOKUP_API_URL` - Authorized license plate lookup provider endpoint. The app sends `POST { plate, region, country }` and normalizes vehicle-only fields.
- `LICENSE_PLATE_LOOKUP_API_KEY` - Optional provider credential for the license plate endpoint.
- `LICENSE_PLATE_LOOKUP_API_KEY_HEADER` - Optional auth header name for the license plate provider. Defaults to `Authorization`; `x-api-key` is also sent when a key is present.
- `WHOIS_API_KEY` - Optional paid WHOIS provider if public WHOIS/RDAP is insufficient.
- `NVD_API_KEY` - Optional NVD rate-limit key for CVE searches.
- `MAXMIND_API_KEY` - Optional MaxMind geolocation key; current IP lookup can use public `ip-api.com`.

## Platform and Infrastructure Keys

- `DATABASE_URL` - Production database connection.
- `JWT_SECRET` - Session/cookie signing.
- `VITE_APP_URL` - Public application URL for links and enrollment pages.
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` - Stripe payments and webhooks.
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_WEBHOOK_SECRET`, `PAYPAL_PAYOUT_EMAIL` - PayPal payments and payouts.
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` or `S3_REGION`, `AWS_S3_BUCKET` or `S3_BUCKET` - Cloud storage.
- `EMAIL_USER` and `EMAIL_PASSWORD` - Email alert delivery.
- `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_URL`, `VITE_FRONTEND_FORGE_API_KEY` - Manus/Forge proxy services such as maps and storage.
- `VITE_ANALYTICS_ENDPOINT` and `VITE_ANALYTICS_WEBSITE_ID` - Analytics script values used by `client/index.html`.

## Provider Required Before Real Data Is Possible

- IMEI device model and blacklist data requires an authorized TAC/GSMA-style provider.
- Ontario plate ownership/registration requires an authorized DMV/MTO data provider. Without `LICENSE_PLATE_LOOKUP_API_URL`, the tool only validates/classifies plate format and never fabricates vehicle or owner records.
- Supply-chain analysis requires a vendor/product intelligence provider.
- Deepfake detection requires a media-forensics provider.
- Insider-threat scoring requires real audit/access logs from the customer's environment.
- Social comments/follower counts require official platform API access and authorization.
