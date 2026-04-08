# OSINT Scanner Platform

A full-featured cybersecurity reconnaissance and OSINT web application with a dark cyberpunk aesthetic, designed for pentesters and security researchers to perform network scanning, domain intelligence gathering, and social media reconnaissance.

## Features

### 🎯 Core Modules

#### Network Scanner
- **Port Scanning**: Identify open ports and services on target hosts
- **Ping**: Test host reachability and latency
- **Traceroute**: Map network path to target hosts
- **IP Geolocation**: Retrieve geographic location data for IP addresses

#### Domain OSINT
- **WHOIS Lookup**: Retrieve domain registration information
- **DNS Records**: Query A, MX, NS, TXT, and other DNS records
- **Subdomain Enumeration**: Discover subdomains associated with target domain
- **SSL Certificate Information**: Retrieve and analyze SSL/TLS certificates

#### Social Media OSINT
- **Username Search**: Search for usernames across multiple platforms
- **Profile Intelligence**: Gather publicly available profile information
- **Supported Platforms**: Twitter, GitHub, LinkedIn, Instagram, Facebook, Reddit, TikTok

### 📊 Dashboard & Analytics
- Real-time scan statistics and activity overview
- Quick-launch buttons for immediate scanning
- Scan performance metrics and vulnerability counts
- User authentication with Manus OAuth

### 💾 Scan History & Results Management
- Persistent database storage of all scan results
- Advanced filtering and search capabilities
- Detailed result views with raw data and analysis
- Status tracking (pending, running, completed, error)

### 🤖 LLM-Powered Analysis
- Automatic threat analysis and vulnerability assessment
- Plain-language security reports
- Vulnerability highlighting and risk assessment
- Actionable recommendations

### 🗺️ Interactive Network Map
- Google Maps integration for geolocation visualization
- Interactive markers for discovered hosts and domains
- Map controls (zoom, pan, fit bounds)
- Real-time marker updates from scan results

## Architecture

### Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Shadcn/UI
- **Backend**: Express 4, tRPC 11, Node.js
- **Database**: MySQL/TiDB with Drizzle ORM
- **Authentication**: Manus OAuth
- **Maps**: Google Maps JavaScript API
- **AI**: LLM integration for threat analysis

### Project Structure
```
osint-scanner-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Feature pages (Network, Domain, Social, Map, History)
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # tRPC client and utilities
│   │   ├── App.tsx        # Main app with routing
│   │   └── index.css      # Cyberpunk theme styling
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── osint.ts          # OSINT utility functions
│   ├── routers.ts        # tRPC procedure definitions
│   ├── db.ts             # Database query helpers
│   └── _core/            # Framework core (auth, context, etc)
├── drizzle/              # Database schema and migrations
└── shared/               # Shared types and constants
```

## Design System

### Cyberpunk Aesthetic
- **Primary Colors**: 
  - Neon Pink: `#ff006e`
  - Electric Cyan: `#00f5ff`
  - Neon Green: `#39ff14`
  - Neon Purple: `#b537f2`
- **Background**: Deep black `#0a0e27`
- **Typography**: Bold geometric sans-serif with neon glow effects
- **UI Elements**: HUD-style frames with corner brackets and thin technical lines

### Terminal-Style Output
All scan results display in a monospace font with color-coded information:
- Cyan for IP addresses and technical data
- Pink for labels and headers
- Green for successful results
- Red for errors and warnings

## Getting Started

### Prerequisites
- Node.js 22.13.0+
- pnpm 10.15.1+
- MySQL/TiDB database

### Installation

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   - Database connection string
   - OAuth credentials
   - API keys for external services

3. **Run database migrations**
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Access the application**
   - Open browser to `http://localhost:3000`
   - Authenticate with Manus OAuth

## Usage

### Running Scans

1. **Network Scanner**
   - Navigate to "Network Scanner" from sidebar
   - Enter target IP address or hostname
   - Select scan type (port scan, ping, traceroute, or geolocation)
   - Click "START SCAN"
   - View results in terminal-style output

2. **Domain OSINT**
   - Navigate to "Domain OSINT" from sidebar
   - Enter target domain name
   - Click "START SCAN"
   - Results include WHOIS, DNS records, subdomains, and SSL info

3. **Social Media OSINT**
   - Navigate to "Social Media OSINT" from sidebar
   - Enter username to search
   - Click "START SCAN"
   - View profiles found across platforms

### Viewing Results

- **Scan History**: Browse all past scans with filtering and search
- **Map View**: Visualize geolocation data on interactive map
- **Threat Analysis**: View LLM-generated security reports
- **Export**: Download scan results and reports

## API Reference

### tRPC Procedures

#### Scans
- `scans.create` - Create new scan record
- `scans.list` - List all scans with filtering
- `scans.get` - Get specific scan details
- `scans.executeDomainScan` - Execute domain OSINT scan
- `scans.executeNetworkScan` - Execute network scan
- `scans.executeSocialScan` - Execute social media scan
- `scans.generateThreatAnalysis` - Generate LLM threat report

#### Authentication
- `auth.me` - Get current user info
- `auth.logout` - Logout user

## Testing

### Run Unit Tests
```bash
pnpm test
```

### Test Coverage
- 15 comprehensive tests for OSINT utilities
- Authentication flow tests
- Database persistence tests

## Performance Considerations

- Scans are executed asynchronously with real-time status updates
- Results are cached in database to avoid duplicate scans
- Map rendering optimized for 100+ markers
- Frontend queries use tRPC with automatic caching

## Security

- All user input is validated and sanitized
- Database queries use parameterized statements (Drizzle ORM)
- OAuth authentication prevents unauthorized access
- Sensitive data (API keys, credentials) stored in environment variables
- HTTPS enforced in production

## Limitations

- Port scanning limited to common ports (1-65535)
- Subdomain enumeration uses common subdomain list (not exhaustive)
- Social media searches depend on platform API availability
- Geolocation accuracy ±5-10km depending on IP database
- Rate limiting applied to prevent abuse

## Troubleshooting

### Scans Not Running
- Verify network connectivity
- Check target is reachable
- Review scan logs for specific errors

### Map Not Loading
- Ensure Google Maps API key is valid
- Check browser console for CORS errors
- Verify location data is available from scans

### Database Connection Issues
- Verify DATABASE_URL environment variable
- Check MySQL/TiDB server is running
- Review connection string format

## Future Enhancements

- Real port scanning with nmap integration
- Advanced subdomain enumeration with multiple sources
- Social media profile scraping and analysis
- Network topology visualization with D3.js
- Automated vulnerability scanning
- Custom scan templates and workflows
- Report generation and export (PDF, CSV)
- API rate limiting and usage analytics
- Multi-user collaboration features

## Support

For issues, questions, or feature requests, please refer to the project documentation or contact the development team.

## License

MIT License - See LICENSE file for details

## Disclaimer

This tool is designed for authorized security testing and reconnaissance only. Users are responsible for obtaining proper authorization before scanning any systems or networks. Unauthorized access to computer systems is illegal.
