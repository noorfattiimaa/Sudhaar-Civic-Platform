import { useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { MapPin, Navigation } from "lucide-react";
import L from "leaflet";

// Fix for default Leaflet marker icon not showing in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Sub-component to handle click events on the map
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation: { lat: number; lng: number } | null;
}

export default function LocationPicker({ onLocationSelect, selectedLocation }: LocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);
  
  // Default center: Lahore (as per your dashboard theme)
  const defaultCenter = { lat: 31.5204, lng: 74.3587 }; 
  const mapRef = useRef<L.Map | null>(null);

  const handleLocateMe = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationSelect(latitude, longitude);
        
        // Fly to the user's location smoothly
        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], 15, { duration: 1.5 });
        }
        setIsLocating(false);
      },
      () => {
        alert("Unable to retrieve your location");
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner group">
      
      {/* Map Container */}
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={13}
        scrollWheelZoom={false} // Prevent scrolling page from zooming map
        className="h-full w-full z-0"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onLocationSelect={onLocationSelect} />
        
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
        )}
      </MapContainer>

      {/* Floating "Locate Me" Button */}
      <button
        type="button"
        onClick={handleLocateMe}
        disabled={isLocating}
        className="absolute top-4 right-4 z-[400] bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
        title="Find my location"
      >
        <Navigation className={`h-6 w-6 ${isLocating ? "animate-spin text-blue-500" : ""}`} />
      </button>

      {/* Instruction Overlay (Disappears on interaction) */}
      {!selectedLocation && !isLocating && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg pointer-events-none animate-bounce">
          Tap anywhere to pin location
        </div>
      )}
    </div>
  );
}