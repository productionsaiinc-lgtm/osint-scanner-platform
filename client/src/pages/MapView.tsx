import { Card } from "@/components/ui/card";
import { Map as MapIcon } from "lucide-react";

export default function MapView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <MapIcon className="h-8 w-8 text-neon-green-glow" />
        <h1 className="text-3xl font-bold neon-green-glow tracking-wider">NETWORK TOPOLOGY MAP</h1>
      </div>

      {/* Map Container */}
      <Card className="hud-frame p-6 min-h-[600px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-neon-cyan-glow text-lg font-mono">
            [MAP VISUALIZATION LAYER]
          </div>
          <p className="text-foreground/60 text-sm">
            Interactive map showing IP geolocation and network topology will be displayed here.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-8 text-xs">
            <div className="hud-frame p-4">
              <div className="text-neon-pink mb-2">● Active Host</div>
              <div className="text-foreground/60">192.168.1.1</div>
            </div>
            <div className="hud-frame p-4">
              <div className="text-neon-cyan mb-2">● Discovered Domain</div>
              <div className="text-foreground/60">example.com</div>
            </div>
            <div className="hud-frame p-4">
              <div className="text-neon-green mb-2">● Geolocation</div>
              <div className="text-foreground/60">New York, USA</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Legend */}
      <Card className="hud-frame p-6">
        <h3 className="text-sm font-bold text-neon-purple-glow uppercase tracking-wider mb-4">Map Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-neon-pink rounded-full"></div>
            <span className="text-foreground/80">Active Hosts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-neon-cyan rounded-full"></div>
            <span className="text-foreground/80">Domains</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-neon-green rounded-full"></div>
            <span className="text-foreground/80">Geolocation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-neon-purple rounded-full"></div>
            <span className="text-foreground/80">Network Link</span>
          </div>
        </div>
      </Card>

      {/* Info Panel */}
      <Card className="hud-frame p-6">
        <h3 className="text-sm font-bold text-neon-cyan-glow uppercase tracking-wider mb-3">About Network Topology</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          The network topology map visualizes discovered hosts, domains, and their geographic locations. 
          This interactive visualization helps identify network structure, potential vulnerabilities, 
          and relationships between discovered assets during reconnaissance operations.
        </p>
      </Card>
    </div>
  );
}
