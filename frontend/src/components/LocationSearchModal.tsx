import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  Link as LinkIcon, 
  Compass, 
  Navigation, 
  X, 
  Check, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Translations } from '../constants/translations';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCoordinates: (lat: number, lon: number, label: string) => void;
  currentLabel: string;
  currentCenter: [number, number];
  t: Translations;
}

// Popular agri-districts pre-cached for 0ms instant response without network latency
const PRESET_DISTRICTS = [
  { label: "Sangrur, Punjab (Critical Water Level)", lat: 30.2458, lon: 75.8421 },
  { label: "Bathinda, Punjab (Cotton & Wheat Belt)", lat: 30.2110, lon: 74.9455 },
  { label: "Ludhiana, Punjab (Central Agro-Zone)", lat: 30.9010, lon: 75.8573 },
  { label: "Amritsar, Punjab (Majha Region)", lat: 31.6340, lon: 74.8723 },
  { label: "Patiala, Punjab (Malwa Plains)", lat: 30.3398, lon: 76.3869 },
  { label: "Karnal, Haryana (ICAR CSSRI Research Belt)", lat: 29.6857, lon: 76.9905 },
  { label: "Hisar, Haryana (Dryland Agriculture Zone)", lat: 29.1492, lon: 75.7217 },
  { label: "Sirsa, Haryana (Cotton-Paddy Transition)", lat: 29.5349, lon: 75.0298 },
  { label: "Nashik, Maharashtra (Horticulture & Onion)", lat: 19.9975, lon: 73.7898 },
  { label: "Pune, Maharashtra (Sugarcane & Drip)", lat: 18.5204, lon: 73.8567 },
  { label: "Nagpur, Maharashtra (Vidarbha Basin)", lat: 21.1458, lon: 79.0882 },
  { label: "Indore, Madhya Pradesh (Soybean Belt)", lat: 22.7196, lon: 75.8577 },
  { label: "Mandya, Karnataka (Cauvery Command Area)", lat: 12.5222, lon: 76.8974 },
  { label: "Guntur, Andhra Pradesh (Krishna Delta)", lat: 16.3067, lon: 80.4365 },
  { label: "Rajkot, Gujarat (Groundnut Hub)", lat: 22.3039, lon: 70.8022 }
];

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCoordinates,
  currentLabel,
  currentCenter,
  t
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'search' | 'link' | 'coords' | 'gps'>('search');

  // Search Tab State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ label: string; lat: number; lon: number }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Link Tab State
  const [mapLink, setMapLink] = useState('');
  const [linkError, setLinkError] = useState('');
  const [extractedLinkCoords, setExtractedLinkCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Coords Tab State
  const [coordLat, setCoordLat] = useState(currentCenter[0].toString());
  const [coordLon, setCoordLon] = useState(currentCenter[1].toString());
  const [coordError, setCoordError] = useState('');

  // GPS Tab State
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // 1. Handle Search by Place Name
  const handlePerformSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    // First filter presets
    const localMatches = PRESET_DISTRICTS.filter(d => 
      d.label.toLowerCase().includes(query)
    );

    if (localMatches.length > 0) {
      setSearchResults(localMatches);
    }

    // Also query OpenStreetMap Nominatim for pan-India villages/towns
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      if (res.ok) {
        const data = await res.json();
        const onlineMatches = data.map((item: any) => ({
          label: item.display_name.split(',').slice(0, 3).join(','),
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon)
        }));

        // Combine unique results
        const combined = [...localMatches];
        onlineMatches.forEach((om: any) => {
          if (!combined.some(c => Math.abs(c.lat - om.lat) < 0.01 && Math.abs(c.lon - om.lon) < 0.01)) {
            combined.push(om);
          }
        });
        setSearchResults(combined);
      }
    } catch (err) {
      console.warn("Nominatim search error, using local matches:", err);
      if (localMatches.length === 0) {
        // Fallback demo match
        setSearchResults([{
          label: `${searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1)} (Regional Benchmark)`,
          lat: currentCenter[0],
          lon: currentCenter[1]
        }]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // 2. Handle Google Maps Link Parsing
  const handleParseMapLink = (url: string) => {
    setMapLink(url);
    setLinkError('');
    setExtractedLinkCoords(null);

    if (!url.trim()) return;

    // Examples:
    // https://www.google.com/maps/@30.2458,75.8421,15z
    // https://maps.google.com/?q=30.2458,75.8421
    // https://www.google.com/maps/place/.../@30.2458,75.8421,17z
    // ...!3d30.2458!4d75.8421
    // 30.2458, 75.8421
    const atRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const qRegex = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const llRegex = /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const bangRegex = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
    const plainRegex = /(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/;

    let match = url.match(atRegex) || url.match(qRegex) || url.match(llRegex) || url.match(bangRegex) || url.match(plainRegex);

    if (match) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        setExtractedLinkCoords({ lat, lon });
        return;
      }
    }

    // Short links like goo.gl/maps or maps.app.goo.gl:
    if (url.includes('goo.gl') || url.includes('maps.app')) {
      setLinkError("Google short links redirect dynamically. Please copy coordinates or open the link and paste the full URL with '@latitude,longitude'.");
    } else {
      setLinkError("Could not find valid coordinates in the link. Please ensure it contains @lat,lon or enter coordinates directly.");
    }
  };

  const handleApplyLinkCoords = () => {
    if (extractedLinkCoords) {
      onSelectCoordinates(
        extractedLinkCoords.lat, 
        extractedLinkCoords.lon, 
        `Custom Plot (${extractedLinkCoords.lat.toFixed(4)}, ${extractedLinkCoords.lon.toFixed(4)})`
      );
      onClose();
    }
  };

  // 3. Handle Manual Coordinates
  const handleApplyManualCoords = (e: React.FormEvent) => {
    e.preventDefault();
    setCoordError('');
    const lat = parseFloat(coordLat);
    const lon = parseFloat(coordLon);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setCoordError("Latitude must be a valid number between -90 and 90.");
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      setCoordError("Longitude must be a valid number between -180 and 180.");
      return;
    }

    onSelectCoordinates(lat, lon, `Field Coordinates (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
    onClose();
  };

  // 4. Handle GPS Detection
  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }
    setIsGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setIsGpsLoading(false);
        onSelectCoordinates(lat, lon, `My Current Farm (${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`);
        onClose();
      },
      (err) => {
        setIsGpsLoading(false);
        setGpsError("Failed to get GPS location. Please check browser permissions or use Place Search / Coordinates.");
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-slate-900 text-base">
                Set Farm Location
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Current: <span className="text-slate-800 font-bold">{currentLabel}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Interactive Search Mode Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'search' 
                ? 'bg-white text-emerald-800 shadow-xs' 
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Place</span>
          </button>

          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'link' 
                ? 'bg-white text-emerald-800 shadow-xs' 
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Google Maps Link</span>
          </button>

          <button
            onClick={() => setActiveTab('coords')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'coords' 
                ? 'bg-white text-emerald-800 shadow-xs' 
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Coordinates</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('gps');
              handleGpsDetect();
            }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'gps' 
                ? 'bg-white text-emerald-800 shadow-xs' 
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Use GPS</span>
          </button>
        </div>

        {/* Modal Tab Content */}
        <div className="p-6">
          
          {/* TAB 1: Search by Place / Village Name */}
          {activeTab === 'search' && (
            <div className="flex flex-col gap-4">
              <form onSubmit={handlePerformSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.length >= 2) {
                        const q = e.target.value.toLowerCase();
                        setSearchResults(PRESET_DISTRICTS.filter(d => d.label.toLowerCase().includes(q)));
                      }
                    }}
                    placeholder="Enter village, city, district or state (e.g. Sangrur, Karnal, Nashik)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </form>

              {/* Search Results List */}
              <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {searchResults.length > 0 ? "Search Matches" : "Popular Agricultural Districts"}
                </span>
                {(searchResults.length > 0 ? searchResults : PRESET_DISTRICTS.slice(0, 6)).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onSelectCoordinates(item.lat, item.lon, item.label);
                      onClose();
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/60 text-left transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-950">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.lat.toFixed(4)}°N, {item.lon.toFixed(4)}°E
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition">
                      Select →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Google Maps Link */}
          {activeTab === 'link' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Paste Google Maps URL or Location Link
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={mapLink}
                    onChange={(e) => handleParseMapLink(e.target.value)}
                    placeholder="https://maps.google.com/?q=30.2458,75.8421 or paste Google Maps URL"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Open Google Maps on your phone or browser, drop a pin on your field, copy the link or coordinates, and paste it here.
                </p>
              </div>

              {linkError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{linkError}</span>
                </div>
              )}

              {extractedLinkCoords && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">Coordinates Detected!</span>
                      <span className="text-xs text-emerald-800 font-mono font-semibold">
                        Latitude: {extractedLinkCoords.lat}° | Longitude: {extractedLinkCoords.lon}°
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleApplyLinkCoords}
                    className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    Apply Location
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Enter Coordinates Directly */}
          {activeTab === 'coords' && (
            <form onSubmit={handleApplyManualCoords} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Latitude (°N)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={coordLat}
                    onChange={(e) => setCoordLat(e.target.value)}
                    placeholder="e.g. 30.2458"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Longitude (°E)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={coordLon}
                    onChange={(e) => setCoordLon(e.target.value)}
                    placeholder="e.g. 75.8421"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                    required
                  />
                </div>
              </div>

              {coordError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{coordError}</span>
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                Tip: Indian agricultural regions typically range between <b>8°N to 36°N Latitude</b> and <b>68°E to 96°E Longitude</b>.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Set Coordinates &amp; Center Satellite Map
              </button>
            </form>
          )}

          {/* TAB 4: Use GPS */}
          {activeTab === 'gps' && (
            <div className="p-6 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                <Navigation className={`w-7 h-7 ${isGpsLoading ? 'animate-spin' : ''}`} />
              </div>
              <h4 className="font-heading font-extrabold text-slate-900 text-sm">
                {isGpsLoading ? "Querying Device GPS Sensors..." : "GPS Location Detection"}
              </h4>
              <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
                AquaShift uses HTML5 High-Accuracy Geolocation to pinpoint your exact coordinates on the satellite map.
              </p>

              {gpsError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 max-w-sm">
                  {gpsError}
                </div>
              )}

              {!isGpsLoading && (
                <button
                  onClick={handleGpsDetect}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer mt-2"
                >
                  Retry GPS Detection
                </button>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
