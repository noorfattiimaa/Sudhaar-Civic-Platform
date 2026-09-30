import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Camera, MapPin, ArrowRight, ArrowLeft,
  CheckCircle2, AlertTriangle, Droplets, Zap,
  Truck, Construction, Loader2, Search, Crosshair
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- LEAFLET IMPORTS ---
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { issuesService } from '../../../services/issues';

// --- CUSTOM MARKER ICON ---
const customMarkerIcon = L.divIcon({
  className: 'custom-marker',
  html: renderToStaticMarkup(
    <div className="relative">
      <div className="w-10 h-10 bg-blue-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white relative z-10">
        <MapPin size={20} fill="currentColor" />
      </div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-600 rotate-45 transform"></div>
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/20 blur-sm rounded-full"></div>
    </div>
  ),
  iconSize: [40, 50],
  iconAnchor: [20, 50],
});

const CATEGORIES = [
  { id: 'Roads', label: 'Roads', icon: Construction, color: 'bg-orange-500' },
  { id: 'Sanitation', label: 'Sanitation', icon: Truck, color: 'bg-emerald-500' },
  { id: 'Water', label: 'Water', icon: Droplets, color: 'bg-blue-500' },
  { id: 'Electricity', label: 'Electricity', icon: Zap, color: 'bg-yellow-500' },
  { id: 'Health', label: 'Health', icon: CheckCircle2, color: 'bg-red-500' },
  { id: 'Environment', label: 'Environment', icon: CheckCircle2, color: 'bg-green-600' },
  { id: 'Other', label: 'Other', icon: AlertTriangle, color: 'bg-slate-500' },
];

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 16, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReportModal({ isOpen, onClose, onSuccess }: ReportModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const isComponentMounted = useRef(true);

  // Map State
  const [mapCenter, setMapCenter] = useState<[number, number]>([31.5204, 74.3587]);
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    locationName: '',
    coordinates: '',
    image: null as File | null
  });

  useEffect(() => {
    setMounted(true);
    isComponentMounted.current = true;
    return () => { isComponentMounted.current = false; };
  }, []);

  // --- CRITICAL FIX START ---
  // Reset everything when the modal opens (prevent ghost success screen)
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsSubmitting(false);
      setSearchQuery("");
      setMarkerPos(null);
      setMapCenter([31.5204, 74.3587]);
      setFormData({
        category: '',
        title: '',
        description: '',
        locationName: '',
        coordinates: '',
        image: null
      });
    }
  }, [isOpen]);
  // --- CRITICAL FIX END ---

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.coordinates) {
      alert("Please fill in all required fields and pin the location.");
      return;
    }

    setIsSubmitting(true);

    try {
      const [lat, lng] = formData.coordinates.split(',').map(coord => parseFloat(coord.trim()));

      const response = await issuesService.create({
        title: formData.title,
        description: formData.description,
        location: formData.locationName || "Narowal",
        category: formData.category,
        latitude: lat,
        longitude: lng,
        image: formData.image || undefined
      });

      if (!isComponentMounted.current) return;

      if (response.error) {
        alert(`Submission Failed: ${response.error}`);
        setIsSubmitting(false);
        return;
      }

      setStep(3);
      if (onSuccess) onSuccess(); // Just notifies dashboard to reload data
    } catch (error) {
      if (isComponentMounted.current) {
        console.error("Submission error:", error);
        alert('Failed to submit issue. Please check your connection.');
        setIsSubmitting(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0 && isComponentMounted.current) {
        const { lat, lon, display_name } = data[0];
        const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
        
        setMapCenter(newPos);
        setMarkerPos(newPos);
        
        setFormData(prev => ({
          ...prev,
          locationName: display_name.split(',')[0],
          coordinates: `${parseFloat(lat).toFixed(6)}, ${parseFloat(lon).toFixed(6)}`
        }));
      } else {
        alert("Location not found. Try adding 'Narowal' to your search.");
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      if (isComponentMounted.current) setIsSearching(false);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        if (!isComponentMounted.current) return;
        
        setMapCenter([latitude, longitude]);
        setMarkerPos([latitude, longitude]);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (isComponentMounted.current) {
            setFormData(prev => ({
              ...prev,
              locationName: data.display_name ? data.display_name.split(',')[0] : "My Location",
              coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            }));
          }
        } catch (e) {
          if (isComponentMounted.current) {
            setFormData(prev => ({ ...prev, locationName: "Current Location", coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
          }
        }
        if (isComponentMounted.current) setIsLocating(false);
      },
      () => {
        alert("Unable to retrieve location");
        if (isComponentMounted.current) setIsLocating(false);
      }
    );
  };

  const onMapClick = async (lat: number, lng: number) => {
    setMarkerPos([lat, lng]);
    setIsReverseGeocoding(true);
    setFormData(prev => ({ ...prev, coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, locationName: "Fetching address..." }));

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (isComponentMounted.current) {
        const address = data?.display_name ? data.display_name.split(',').slice(0, 2).join(',') : "Marked Location";
        setFormData(prev => ({ ...prev, locationName: address }));
      }
    } catch (error) {
      if (isComponentMounted.current) setFormData(prev => ({ ...prev, locationName: "Marked Location" }));
    } finally {
      if (isComponentMounted.current) setIsReverseGeocoding(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 font-sans">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="fixed inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity" />

          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-[99999]">
            
            {/* HEADER */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Report Issue</h2>
                <p className="text-slate-500 text-sm">Submit a new civic problem for review</p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* BODY */}
            <div className="p-8 overflow-y-auto custom-scrollbar bg-white">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">1. Select Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {CATEGORIES.map((cat) => (
                        <button key={cat.id} onClick={() => setFormData({ ...formData, category: cat.id })} className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 h-32 ${formData.category === cat.id ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]' : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50'}`}>
                          <div className={`p-3 rounded-full mb-3 text-white ${cat.color}`}><cat.icon size={24} /></div>
                          <span className="font-bold text-slate-800">{cat.label}</span>
                          {formData.category === cat.id && <div className="absolute top-3 right-3 text-blue-500"><CheckCircle2 size={18} fill="currentColor" className="text-white" /></div>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">2. Issue Title</label>
                      <input type="text" placeholder="e.g. Broken Street Light" className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none font-medium" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">3. Description</label>
                      <textarea rows={3} placeholder="Describe the problem details..." className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none font-medium resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">4. Location</label>
                    <div className="flex gap-2">
                      <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
                        <input 
                          type="text" 
                          placeholder="Search area..." 
                          className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors" 
                          value={searchQuery} 
                          onChange={(e) => setSearchQuery(e.target.value)} 
                        />
                        <button 
                          type="submit"
                          disabled={isSearching || !searchQuery.trim()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSearching ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                        </button>
                      </form>

                      <button onClick={handleLocateMe} disabled={isLocating} className="px-4 bg-white border border-slate-200 rounded-xl hover:text-blue-600 transition-all flex items-center justify-center">
                        {isLocating ? <Loader2 className="animate-spin" /> : <Crosshair />}
                      </button>
                    </div>

                    <div className="relative w-full h-64 rounded-2xl overflow-hidden border-2 z-0">
                      <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                        <MapUpdater center={mapCenter} />
                        <LocationMarker onLocationSelect={onMapClick} />
                        {markerPos && <Marker position={markerPos} icon={customMarkerIcon} />}
                      </MapContainer>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">5. Evidence Photo</label>
                    <div onClick={() => fileInputRef.current?.click()} className={`relative w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${formData.image ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-white hover:border-blue-400'}`}>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                      {formData.image ? (<><div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-2"><CheckCircle2 size={20} /></div><p className="font-bold text-emerald-700 text-sm">{formData.image.name}</p></>) : (<><div className="h-10 w-10 bg-white text-blue-500 rounded-xl shadow-sm flex items-center justify-center mb-2"><Camera size={20} /></div><p className="font-bold text-slate-600 text-sm">Click to Upload Photo</p></>)}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-12 flex flex-col items-center text-center">
                  <div className="h-28 w-28 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-200">
                    <CheckCircle2 size={64} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-3">Submission Successful!</h3>
                  <p className="text-slate-500 text-lg mb-8 max-w-sm leading-relaxed">
                    Your report has been securely recorded. Thank you for making Narowal better.
                  </p>
                  <button 
                    onClick={handleClose} 
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
                  >
                    Return to Dashboard
                  </button>
                </motion.div>
              )}
            </div>

            {/* FOOTER */}
            {step < 3 && (
              <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center sticky bottom-0 z-20">
                {step > 1 ? (<button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors px-4 py-2"><ArrowLeft size={20} /> Back</button>) : (<div />)}
                <button
                  onClick={step === 1 ? () => setStep(2) : handleSubmit}
                  disabled={step === 1 ? (!formData.title || !formData.category) : (!formData.coordinates || isSubmitting)}
                  className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all ${isSubmitting ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-500 hover:translate-y-[-2px]'}`}
                >
                  {isSubmitting ? (<><Loader2 size={20} className="animate-spin" /> Submitting...</>) : step === 1 ? (<>Next Step <ArrowRight size={20} /></>) : (<>Submit Report <CheckCircle2 size={20} /></>)}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}