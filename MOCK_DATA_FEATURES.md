# Mock Data Features & Real API Integration Guide

**Last Updated:** May 5, 2026  
**Status:** Ready for API Integration

---

## Features Using Mock/Simulated Data

### 1. **Dark Web Monitor** ⚠️ MOCK
- **File:** `server/osint-tools-router.ts` (Line 6-22)
- **Current Implementation:** Random mention counts, simulated sources
- **Real API Options:**
  - **Shodan Darkweb API** - Monitor dark web mentions
  - **Have I Been Pwned API** - Breach database monitoring
  - **Recorded Future API** - Threat intelligence
  - **Flashpoint API** - Dark web intelligence
- **Integration Effort:** Medium (API key + webhook setup)
- **Estimated Cost:** $500-2000/month

### 2. **VIN Decoder** ⚠️ MOCK
- **File:** `server/osint-tools-router.ts` (Line 24-44)
- **Current Implementation:** Hardcoded vehicle specs
- **Real API Options:**
  - **NHTSA VIN Decoder API** - Free, official US vehicle data
  - **VinAudit API** - Commercial vehicle database
  - **VinCheck API** - Comprehensive vehicle history
- **Integration Effort:** Low (simple REST API)
- **Estimated Cost:** Free-$100/month

### 3. **Crypto Address Tracker** ⚠️ MOCK
- **File:** `server/osint-tools-router.ts` (Line 46-63)
- **Current Implementation:** Random balance and transaction counts
- **Real API Options:**
  - **Etherscan API** - Ethereum blockchain data
  - **BlockChain.com API** - Bitcoin data
  - **CoinGecko API** - Multi-chain crypto data
  - **Alchemy API** - Advanced blockchain analytics
- **Integration Effort:** Low (REST API calls)
- **Estimated Cost:** Free-$500/month

### 4. **Malware Detection (File Analysis)** ⚠️ PARTIALLY MOCK
- **File:** `server/osint-tools-router.ts` (Line ~150-180)
- **Current Implementation:** Random detection rates, simulated malware types
- **Real API:** VirusTotal API is integrated but fallback uses mock data
- **Enhancement:** Use real VirusTotal for all files
- **Integration Effort:** Already integrated, just remove fallback
- **Estimated Cost:** Free-$500/month

### 5. **Password Strength Checker** ⚠️ MOCK
- **File:** `server/osint-tools-router.ts` (Line ~200-220)
- **Current Implementation:** Random strength ratings
- **Real API Options:**
  - **Have I Been Pwned API** - Check compromised passwords
  - **zxcvbn library** - Local password strength analysis
  - **1Password Password Generator** - Strength validation
- **Integration Effort:** Low (library or API)
- **Estimated Cost:** Free-$50/month

### 6. **Flight Tracker** ⚠️ MOCK
- **File:** `server/osint-tools-router.ts` (Line ~250-280)
- **Current Implementation:** Random flight status, altitude, speed
- **Real API Options:**
  - **FlightRadar24 API** - Real-time flight tracking
  - **OpenSky Network API** - Free ADS-B data
  - **Aviation Edge API** - Flight data
- **Integration Effort:** Medium (real-time data handling)
- **Estimated Cost:** $100-1000/month

### 7. **Deepfake Detection** ⚠️ MOCK
- **File:** `server/osint-tools-router.ts` (Line ~300-330)
- **Current Implementation:** Random confidence scores
- **Real API Options:**
  - **Microsoft Video Indexer** - Deepfake detection
  - **Sensetime API** - Face manipulation detection
  - **AWS Rekognition** - Face analysis
  - **Google Cloud Vision** - Image analysis
- **Integration Effort:** High (complex ML models)
- **Estimated Cost:** $500-5000/month

### 8. **Phone IMEI Lookup** ⚠️ MOCK
- **File:** `server/phone-imei-router.ts`
- **Current Implementation:** Random carrier and device type
- **Real API Options:**
  - **IMEI.info API** - IMEI database lookup
  - **Swappa IMEI API** - Device information
  - **OpenCellID API** - Cell tower data
- **Integration Effort:** Low (simple REST API)
- **Estimated Cost:** $50-500/month

### 9. **Shodan Device Search** ⚠️ MOCK
- **File:** `server/data-integrations-router.ts`
- **Current Implementation:** LLM-generated device data
- **Real API:** Shodan API (requires API key)
- **Integration Effort:** Low (REST API)
- **Estimated Cost:** $99-999/month (Shodan subscription)

### 10. **IoT Scanner** ⚠️ MOCK
- **File:** `server/data-integrations-router.ts`
- **Current Implementation:** LLM-simulated device discovery
- **Real API Options:**
  - **Shodan API** - IoT device search
  - **Censys API** - Internet-wide scanning
  - **BinaryEdge API** - IoT/ICS scanning
- **Integration Effort:** Medium (network scanning)
- **Estimated Cost:** $100-1000/month

### 11. **Web Scraper** ⚠️ MOCK
- **File:** `server/data-integrations-router.ts`
- **Current Implementation:** LLM-generated website data
- **Real Implementation Options:**
  - **Puppeteer** - Headless browser automation
  - **Cheerio** - HTML parsing
  - **Scrapy** - Full web scraping framework
  - **Bright Data API** - Managed web scraping
- **Integration Effort:** Medium (requires proxy management)
- **Estimated Cost:** Free-$1000/month

### 12. **MDM Enhancements (All Features)** ⚠️ MOCK
- **File:** `server/mdm-enhancements-router.ts`
- **Current Implementation:** LLM-generated MDM data
- **Real Implementation:** Integrate with actual MDM platforms
- **Real API Options:**
  - **Microsoft Intune API** - Azure MDM
  - **Jamf API** - Apple device management
  - **MobileIron API** - Enterprise MDM
  - **AirWatch API** - Workspace ONE
- **Integration Effort:** High (complex MDM protocols)
- **Estimated Cost:** $500-10000/month

---

## Priority Integration Roadmap

### Phase 1: High-Impact, Low-Effort (Week 1-2)
1. **VIN Decoder** - Use free NHTSA API
2. **Crypto Tracker** - Use free CoinGecko API
3. **Phone IMEI Lookup** - Use IMEI.info API
4. **Password Strength** - Use zxcvbn library (free)

### Phase 2: Medium-Effort (Week 3-4)
1. **Shodan Integration** - Already have API structure
2. **Flight Tracker** - Use OpenSky Network (free tier)
3. **Web Scraper** - Implement with Puppeteer
4. **IoT Scanner** - Integrate with Shodan

### Phase 3: High-Effort, High-Value (Week 5-8)
1. **Dark Web Monitor** - Integrate Recorded Future or Flashpoint
2. **Deepfake Detection** - Use AWS Rekognition or Microsoft Video Indexer
3. **MDM Enhancements** - Integrate with Microsoft Intune or Jamf
4. **Malware Detection** - Remove VirusTotal fallback, use real API only

---

## Implementation Examples

### Example 1: VIN Decoder (NHTSA API)
```typescript
// Replace mock data with real API
const vinDecoderProcedure = protectedProcedure
  .input(z.object({ vin: z.string().min(17).max(17) }))
  .mutation(async ({ input }) => {
    try {
      const response = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${input.vin}?format=json`
      );
      
      const data = response.data.Results;
      return {
        success: true,
        data: {
          manufacturer: data.find(d => d.Variable === 'Make')?.Value,
          year: data.find(d => d.Variable === 'Model Year')?.Value,
          model: data.find(d => d.Variable === 'Model')?.Value,
          bodyType: data.find(d => d.Variable === 'Body Class')?.Value,
          engine: data.find(d => d.Variable === 'Engine Description')?.Value,
        }
      };
    } catch (error) {
      return { success: false, error: 'VIN lookup failed' };
    }
  });
```

### Example 2: Crypto Tracker (CoinGecko API)
```typescript
// Replace mock data with real blockchain data
const cryptoTrackerProcedure = protectedProcedure
  .input(z.object({ address: z.string().min(1) }))
  .mutation(async ({ input }) => {
    try {
      // For Ethereum addresses
      const response = await axios.get(
        `https://api.etherscan.io/api?module=account&action=balance&address=${input.address}&tag=latest&apikey=${process.env.ETHERSCAN_API_KEY}`
      );
      
      return {
        success: true,
        data: {
          address: input.address,
          balance: parseFloat(response.data.result) / 1e18, // Convert from Wei
          transactions: 0, // Would need separate call
          riskLevel: 'unknown'
        }
      };
    } catch (error) {
      return { success: false, error: 'Crypto lookup failed' };
    }
  });
```

### Example 3: Shodan Integration
```typescript
// Already structured, just needs real API key
const shodanSearchProcedure = protectedProcedure
  .input(z.object({ query: z.string().min(1) }))
  .mutation(async ({ input }) => {
    try {
      const response = await axios.get(
        `https://api.shodan.io/shodan/host/search?query=${encodeURIComponent(input.query)}&key=${process.env.SHODAN_API_KEY}`
      );
      
      return {
        success: true,
        data: response.data.matches.map(match => ({
          ip: match.ip_str,
          port: match.port,
          service: match.product,
          vulnerability: match.vulns ? Object.keys(match.vulns) : []
        }))
      };
    } catch (error) {
      return { success: false, error: 'Shodan search failed' };
    }
  });
```

---

## API Keys Required

| Feature | API Provider | Key Name | Cost |
|---------|--------------|----------|------|
| VIN Decoder | NHTSA | None (free) | Free |
| Crypto Tracker | Etherscan | ETHERSCAN_API_KEY | Free-$500/mo |
| Shodan | Shodan | SHODAN_API_KEY | $99-999/mo |
| Dark Web | Recorded Future | RF_API_KEY | $500-2000/mo |
| Flight Tracker | OpenSky | OPENSKY_API_KEY | Free |
| Deepfake Detection | AWS Rekognition | AWS credentials | $0.10-1/image |
| Phone IMEI | IMEI.info | IMEI_API_KEY | $50-500/mo |
| Web Scraper | Bright Data | BD_API_KEY | $100-1000/mo |

---

## Next Steps

1. **Prioritize APIs** - Choose which features to integrate first based on business value
2. **Obtain API Keys** - Sign up for required services
3. **Update Secrets** - Add API keys to environment variables via `webdev_request_secrets`
4. **Replace Mock Code** - Update router procedures with real API calls
5. **Test Integration** - Verify real data is returned correctly
6. **Update Tests** - Mock API responses in test files
7. **Deploy** - Push changes to production

---

## Summary

**Total Mock Features:** 12  
**Ready for Real APIs:** 12  
**Estimated Integration Time:** 4-8 weeks  
**Estimated Monthly Cost:** $1,000-15,000 (depending on APIs chosen)

All features are architecturally ready for real API integration. The mock data is in place for MVP testing and can be swapped out for real APIs with minimal code changes.
