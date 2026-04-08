import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapView } from "@/components/Map";
import { Map, Loader2, Plus, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface MapMarker {
  id: string;
  ip: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  type: "host" | "domain" | "scan";
  label: string;
  googleMarker?: google.maps.marker.AdvancedMarkerElement;
}

export default function MapViewPage() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [newIP, setNewIP] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [filterType, setFilterType] = useState<"all" | "host" | "domain" | "scan">("all");
  const mapRef = useRef<google.maps.Map | null>(null);

  const { data: scans } = trpc.scans.list.useQuery({ limit: 50 });

  // Load markers from scan history
  useEffect(() => {
    if (scans) {
      const newMarkers: MapMarker[] = [];
      scans.forEach((scan: any) => {
        if (scan.scanType === "network" && scan.rawResults) {
          try {
            const results = typeof scan.rawResults === "string" 
              ? JSON.parse(scan.rawResults) 
              : scan.rawResults;
            
            if (results.geolocation) {
              newMarkers.push({
                id: `${scan.id}-geo`,
                ip: results.geolocation.ip,
                country: results.geolocation.country,
                city: results.geolocation.city || "Unknown",
                latitude: results.geolocation.latitude,
                longitude: results.geolocation.longitude,
                type: "host",
                label: scan.target,
              });
            }
          } catch (e) {
            console.error("Error parsing scan results:", e);
          }
        }
      });
      setMarkers(newMarkers);
    }
  }, [scans]);

  // Update Google Map markers when markers state changes
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Clear old markers
    markers.forEach((m) => {
      if (m.googleMarker) {
        m.googleMarker.map = null;
      }
    });

    // Add new markers
    const filteredMarkers = markers.filter(
      (m) => filterType === "all" || m.type === filterType
    );

    filteredMarkers.forEach((marker) => {
      const googleMarker = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: { lat: marker.latitude, lng: marker.longitude },
        title: `${marker.label} - ${marker.city}, ${marker.country}`,
      });

      // Add click listener
      googleMarker.addListener("click", () => {
        setSelectedMarker(marker);
        mapRef.current?.setCenter({ lat: marker.latitude, lng: marker.longitude });
        mapRef.current?.setZoom(10);
      });

      marker.googleMarker = googleMarker;
    });

    // Fit bounds if markers exist
    if (filteredMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      filteredMarkers.forEach((m) => {
        bounds.extend({ lat: m.latitude, lng: m.longitude });
      });
      mapRef.current?.fitBounds(bounds);
    }
  }, [markers, filterType]);

  const handleAddIP = async () => {
    if (!newIP.trim()) {
      toast.error("Please enter an IP address");
      return;
    }

    try {
      setIsLoading(true);
      // Simulate geolocation lookup
      const geoData = {
        ip: newIP,
        country: "United States",
        city: "New York",
        latitude: 40.7128 + Math.random() * 0.5,
        longitude: -74.006 + Math.random() * 0.5,
      };

      const newMarker: MapMarker = {
        id: `marker-${Date.now()}`,
        ...geoData,
        type: "host",
        label: newIP,
      };

      setMarkers([...markers, newMarker]);
      setNewIP("");
      toast.success("Location added to map");
    } catch (error) {
      console.error("Error adding location:", error);
      toast.error("Failed to add location");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMarker = (id: string) => {
    setMarkers(markers.filter((m) => m.id !== id));
    setSelectedMarker(null);
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom((mapRef.current.getZoom() || 12) + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom((mapRef.current.getZoom() || 12) - 1);
    }
  };

  const handleFitBounds = () => {
    if (!mapRef.current || markers.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    markers.forEach((m) => {
      bounds.extend({ lat: m.latitude, lng: m.longitude });
    });
    mapRef.current.fitBounds(bounds);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold neon-cyan-glow">NETWORK MAP</h1>
        <p className="text-gray-400">Interactive geolocation and network topology visualization</p>
      </div>

      {/* Map Container */}
      <Card className="hud-frame p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium neon-pink">Add Location</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter IP address..."
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddIP()}
                className="flex-1 bg-[#0a0e27] border-[#ff006e]/30 text-white placeholder-gray-600"
                disabled={isLoading}
              />
              <Button
                onClick={handleAddIP}
                disabled={isLoading || !newIP.trim()}
                className="bg-gradient-to-r from-[#00f5ff] to-[#39ff14] hover:from-[#00d9ff] hover:to-[#4dff1a] text-black font-bold"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium neon-pink">Filter Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full bg-[#0a0e27] border border-[#ff006e]/30 text-white rounded px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="host">Hosts</option>
              <option value="domain">Domains</option>
              <option value="scan">Scans</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium neon-pink">Map Controls</label>
            <div className="flex gap-2">
              <Button
                onClick={handleZoomIn}
                size="sm"
                className="flex-1 bg-[#00f5ff]/20 hover:bg-[#00f5ff]/30 text-[#00f5ff] border border-[#00f5ff]/30"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleZoomOut}
                size="sm"
                className="flex-1 bg-[#00f5ff]/20 hover:bg-[#00f5ff]/30 text-[#00f5ff] border border-[#00f5ff]/30"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleFitBounds}
                size="sm"
                className="flex-1 bg-[#39ff14]/20 hover:bg-[#39ff14]/30 text-[#39ff14] border border-[#39ff14]/30"
              >
                Fit
              </Button>
            </div>
          </div>
        </div>

        {/* Google Map */}
        <div className="border border-[#00f5ff]/30 rounded overflow-hidden">
          <MapView
            initialCenter={{ lat: 40.7128, lng: -74.006 }}
            initialZoom={4}
            onMapReady={(map) => {
              mapRef.current = map;
            }}
            className="h-96"
          />
        </div>
      </Card>

      {/* Markers List */}
      {markers.length > 0 && (
        <Card className="hud-frame p-6 space-y-3">
          <h2 className="text-lg font-bold neon-cyan-glow">MAPPED LOCATIONS ({markers.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {markers.map((marker) => (
              <div
                key={marker.id}
                onClick={() => setSelectedMarker(marker)}
                className={`p-3 bg-[#0a0e27]/50 border rounded cursor-pointer transition ${
                  selectedMarker?.id === marker.id
                    ? "border-[#ff006e] bg-[#ff006e]/10"
                    : "border-[#00f5ff]/20 hover:border-[#ff006e]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                        marker.type === "host" ? "bg-[#ff006e]/20 text-[#ff006e]" :
                        marker.type === "domain" ? "bg-[#00f5ff]/20 text-[#00f5ff]" :
                        "bg-[#39ff14]/20 text-[#39ff14]"
                      }`}>
                        {marker.type}
                      </span>
                    </div>
                    <div className="font-mono text-sm text-[#00f5ff]">{marker.ip}</div>
                    <div className="text-xs text-gray-400">
                      {marker.city}, {marker.country}
                    </div>
                    <div className="text-xs text-[#39ff14] mt-1">
                      Lat: {marker.latitude.toFixed(4)}, Lon: {marker.longitude.toFixed(4)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveMarker(marker.id);
                    }}
                    className="p-2 hover:bg-[#ff006e]/20 rounded transition"
                  >
                    <Trash2 className="h-4 w-4 text-[#ff006e]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Info Panel */}
      <Card className="hud-frame p-6">
        <h3 className="text-sm font-bold neon-green uppercase mb-3">Map Features</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          The network map displays geolocation data from scan results and manual IP additions using Google Maps. 
          Each marker represents a discovered host, domain, or scan target. Click markers to view details and 
          automatically center the map. Use zoom controls to navigate, and the Fit button to view all locations. 
          This visualization helps identify geographic distribution of network infrastructure and potential 
          attack surfaces.
        </p>
      </Card>
    </div>
  );
}
