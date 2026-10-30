import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Layers, 
  Droplet, 
  Ruler, 
  MapPin, 
  CloudSun,
  PenTool,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
  Crosshair
} from 'lucide-react';
import { GroundwaterStationInfo, WeatherData } from '../types';
import { Translations } from '../constants/translations';

interface GeospatialMapProps {
  coordinates: [number, number][];
  areaHa: number;
  areaAcres: number;
  center: [number, number];
  groundwaterStation?: GroundwaterStationInfo;
  weather?: WeatherData;
  onPolygonChange?: (newCoords: [number, number][]) => void;
  onPolygonDrawn?: (newCoords: [number, number][], calculatedAreaHa: number) => void;
  onLocationPinChange?: (lat: number, lon: number) => void;
  isCustomDrawn?: boolean;
  onResetCustomPlot?: () => void;
  allocatedCrops?: { crop_name: string; allocated_ha: number; percentage_of_land: number }[];
  t: Translations;
}

export const GeospatialMap: React.FC<GeospatialMapProps> = ({
  coordinates,
  areaHa,
  areaAcres,
  center,
  groundwaterStation,
  weather,
  onPolygonChange,
  onPolygonDrawn,
  onLocationPinChange,
  isCustomDrawn = false,
  onResetCustomPlot,
  allocatedCrops,
  t
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const drawingLayerRef = useRef<L.LayerGroup | null>(null);
  const farmMarkerRef = useRef<L.Marker | null>(null);
  const stationMarkerRef = useRef<L.Marker | null>(null);

  // Layer & Interactive State
  const [mapLayer, setMapLayer] = useState<'satellite' | 'terrain' | 'street'>('satellite');
  const [showBoundary, setShowBoundary] = useState<boolean>(true);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);

  // Calculate Geodesic Area (Shoelace spherical formula)
  const calculatePolygonAreaHa = (pts: [number, number][]): number => {
    if (pts.length < 3) return 25.0;
    const earthRadius = 6378137; // meters
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      const p1 = pts[i];
      const p2 = pts[j];
      const radLat1 = (p1[0] * Math.PI) / 180;
      const radLat2 = (p2[0] * Math.PI) / 180;
      const deltaLon = ((p2[1] - p1[1]) * Math.PI) / 180;
      area += deltaLon * (2 + Math.sin(radLat1) + Math.sin(radLat2));
    }
    area = Math.abs((area * earthRadius * earthRadius) / 2.0);
    const ha = area / 10000;
    return Math.max(1, Math.min(150, Math.round(ha * 10) / 10));
  };

  // 1. Initialize Map on Mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: 16,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      drawingLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let attribution = '&copy; Esri &mdash; High-Resolution Satellite';

    if (mapLayer === 'terrain') {
      tileUrl = 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap &copy; CARTO';
    } else if (mapLayer === 'street') {
      tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    L.tileLayer(tileUrl, {
      attribution: attribution,
      maxZoom: 19
    }).addTo(map);

    setTimeout(() => map.invalidateSize(), 150);
  }, [mapLayer]);

  // 2. Fly directly to farm center when location changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setView(center, 16);
  }, [center]);

  // 3. Handle Interactive Clicks (Drawing or Repositioning Pin)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isDrawing) {
        const newPoint: [number, number] = [
          Number(e.latlng.lat.toFixed(6)), 
          Number(e.latlng.lng.toFixed(6))
        ];
        setDrawnPoints((prev) => [...prev, newPoint]);
      } else {
        // One-click reposition: User clicks their field on satellite imagery to place pin
        if (onLocationPinChange) {
          onLocationPinChange(
            Number(e.latlng.lat.toFixed(6)), 
            Number(e.latlng.lng.toFixed(6))
          );
        }
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawing, onLocationPinChange]);

  // 4. Render Live Drawing Points
  useEffect(() => {
    if (!drawingLayerRef.current || !mapInstanceRef.current) return;
    const dGroup = drawingLayerRef.current;
    dGroup.clearLayers();

    if (isDrawing && drawnPoints.length > 0) {
      drawnPoints.forEach((pt, idx) => {
        const marker = L.circleMarker(pt, {
          radius: 6,
          color: '#ffffff',
          weight: 2,
          fillColor: '#22c55e',
          fillOpacity: 1
        });
        marker.bindTooltip(`Point ${idx + 1}`, { permanent: true, direction: 'top' });
        dGroup.addLayer(marker);
      });

      if (drawnPoints.length >= 2) {
        const line = L.polyline(drawnPoints, {
          color: '#22c55e',
          weight: 3,
          dashArray: '4, 4'
        });
        dGroup.addLayer(line);
      }

      if (drawnPoints.length >= 3) {
        const polyPreview = L.polygon(drawnPoints, {
          color: '#22c55e',
          weight: 2,
          fillColor: '#4ade80',
          fillOpacity: 0.25
        });
        dGroup.addLayer(polyPreview);
      }
    }
  }, [drawnPoints, isDrawing]);

  // Complete Drawing Action
  const handleFinishDrawing = () => {
    if (drawnPoints.length < 3) {
      alert("Please click at least 3 points on the satellite map to outline your field.");
      return;
    }
    const closedCoords: [number, number][] = [...drawnPoints, drawnPoints[0]];
    const calculatedHa = calculatePolygonAreaHa(drawnPoints);

    if (onPolygonDrawn) {
      onPolygonDrawn(closedCoords, calculatedHa);
    } else if (onPolygonChange) {
      onPolygonChange(closedCoords);
    }

    setIsDrawing(false);
    setDrawnPoints([]);
    if (drawingLayerRef.current) {
      drawingLayerRef.current.clearLayers();
    }
  };

  // Cancel Drawing Action
  const handleCancelDrawing = () => {
    setIsDrawing(false);
    setDrawnPoints([]);
    if (drawingLayerRef.current) {
      drawingLayerRef.current.clearLayers();
    }
  };

  // 5. Update Farm Pin Marker, Boundary Polygon, and CGWB Well Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // A. Farm Location Pin (Placed PRECISELY at center)
    if (farmMarkerRef.current) {
      map.removeLayer(farmMarkerRef.current);
    }

    const farmPinIcon = L.divIcon({
      className: 'custom-farm-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); cursor: grab;">
          <div style="
            background: #15803d;
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 7px;
            border-radius: 9999px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            border: 1.5px solid #ffffff;
            white-space: nowrap;
            margin-bottom: 2px;
            display: flex;
            align-items: center;
            gap: 4px;
            letter-spacing: 0.5px;
          ">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #4ade80;"></span>
            MY FARM
          </div>
          <div style="
            width: 30px;
            height: 30px;
            background: #16a34a;
            border: 3px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background: #ffffff;
              border-radius: 50%;
            "></div>
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    const fMarker = L.marker(center, {
      icon: farmPinIcon,
      draggable: true,
      zIndexOffset: 1000
    }).addTo(map);

    fMarker.bindPopup(`
      <div style="font-family: 'Inter', sans-serif; padding: 6px; color: #0f172a; min-width: 190px;">
        <div style="font-weight: 800; color: #15803d; font-size: 13px; margin-bottom: 2px;">📍 Your Farm Location</div>
        <div style="font-size: 12px; line-height: 1.5; color: #334155;">
          <b>Coordinates:</b> ${center[0].toFixed(5)}°N, ${center[1].toFixed(5)}°E<br/>
          <b>Farm Area:</b> ${areaHa} ha (${areaAcres} acres)<br/>
          <span style="color: #64748b; font-size: 11px;">💡 Drag this pin or click anywhere on satellite view to move your farm.</span>
        </div>
      </div>
    `);

    fMarker.on('dragend', (e: any) => {
      const latlng = e.target.getLatLng();
      if (onLocationPinChange) {
        onLocationPinChange(
          Number(latlng.lat.toFixed(6)), 
          Number(latlng.lng.toFixed(6))
        );
      }
    });

    farmMarkerRef.current = fMarker;

    // B. Plot Boundary Polygon
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
    }

    if (showBoundary && coordinates.length >= 3 && !isDrawing) {
      const isSatellite = mapLayer === 'satellite';
      const poly = L.polygon(coordinates, {
        color: isSatellite ? '#22c55e' : '#15803d',
        weight: 3,
        opacity: 0.95,
        fillColor: isSatellite ? '#4ade80' : '#16a34a',
        fillOpacity: isSatellite ? 0.22 : 0.2,
        dashArray: isCustomDrawn ? undefined : '5, 5'
      }).addTo(map);

      poly.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; padding: 6px; color: #0f172a; min-width: 190px;">
          <div style="font-weight: 800; color: #15803d; font-size: 13px; margin-bottom: 4px;">
            ${isCustomDrawn ? '✏️ Custom Drawn Farm Field' : '📐 Symmetrically Centered Plot'}
          </div>
          <div style="font-size: 12px; line-height: 1.5;">
            <b>Total Land:</b> ${areaHa} ha (${areaAcres} acres)<br/>
            <b>Centroid:</b> ${center[0].toFixed(4)}°N, ${center[1].toFixed(4)}°E<br/>
            <span style="color: #64748b; font-size: 11px;">
              ${isCustomDrawn ? 'Manually traced field boundary' : 'Centered on your farm pin. Click "✏️ Draw Plot" to trace exact borders.'}
            </span>
          </div>
        </div>
      `);

      polygonLayerRef.current = poly;

      // Only fit bounds if user manually drew a custom shape; otherwise stay focused on center at zoom 16
      if (isCustomDrawn) {
        try {
          map.fitBounds(poly.getBounds(), { padding: [40, 40], maxZoom: 17 });
        } catch (e) {}
      }
    }

    // C. Groundwater Station Marker
    if (stationMarkerRef.current) {
      map.removeLayer(stationMarkerRef.current);
    }

    if (groundwaterStation) {
      const gwIcon = L.divIcon({
        className: 'custom-gw-marker',
        html: `
          <div style="
            background: #0284c7;
            border: 2.5px solid #ffffff;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.35);
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
            </svg>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const stMarker = L.marker([groundwaterStation.latitude, groundwaterStation.longitude], {
        icon: gwIcon
      }).addTo(map);

      stMarker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; padding: 6px; color: #0f172a; min-width: 210px;">
          <div style="font-weight: 700; color: #0284c7; font-size: 13px; margin-bottom: 4px;">Govt Well: ${groundwaterStation.station_name}</div>
          <div style="font-size: 12px; line-height: 1.5;">
            <b>Water Depth:</b> <span style="color: #dc2626; font-weight: bold;">${groundwaterStation.depth_mbgl} m below ground</span><br/>
            <b>Aquifer Status:</b> <span style="background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 4px; font-weight: bold;">${groundwaterStation.classification}</span><br/>
            <b>Distance:</b> ${groundwaterStation.distance_km} km from your plot<br/>
            <span style="color: #64748b; font-size: 10px;">Source: Central Ground Water Board (CGWB)</span>
          </div>
        </div>
      `);

      stationMarkerRef.current = stMarker;
    }

  }, [coordinates, center, areaHa, areaAcres, groundwaterStation, mapLayer, isDrawing, showBoundary, isCustomDrawn]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, 16);
    }
  };

  return (
    <div className="relative w-full h-[460px] rounded-2xl overflow-hidden farm-card shadow-xs border border-slate-200">
      
      {/* Map Canvas */}
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%', minHeight: '460px', cursor: isDrawing ? 'crosshair' : 'pointer' }} 
        className="w-full h-full z-0 bg-slate-900" 
      />

      {/* Top Left Floating HUD: Layer Toggles & Drawing Tools */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        
        {/* Layer Switcher Pill */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              mapLayer === 'satellite' 
                ? 'bg-emerald-700 text-white shadow-2xs' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>🛰️</span>
            <span>Satellite</span>
          </button>
          <button
            onClick={() => setMapLayer('terrain')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              mapLayer === 'terrain' 
                ? 'bg-emerald-700 text-white shadow-2xs' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>🗺️</span>
            <span>Farmland</span>
          </button>
          <button
            onClick={() => setMapLayer('street')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              mapLayer === 'street' 
                ? 'bg-emerald-700 text-white shadow-2xs' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>🛣️</span>
            <span>Roads</span>
          </button>
        </div>

        {/* Plot Tools Pill */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
          {/* Boundary Overlay Toggle (Show/Hide green plot) */}
          <button
            onClick={() => setShowBoundary(!showBoundary)}
            title="Toggle farm plot boundary overlay"
            className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 border ${
              showBoundary 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {showBoundary ? <Eye className="w-3.5 h-3.5 text-emerald-700" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            <span>Boundary</span>
          </button>

          {/* Re-Center Button */}
          <button
            onClick={handleRecenter}
            title="Re-center camera on your farm pin"
            className="p-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {/* Interactive Draw My Plot Button */}
          {!isDrawing ? (
            <button
              onClick={() => {
                setIsDrawing(true);
                setDrawnPoints([]);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <PenTool className="w-3 h-3" />
              <span>{t.drawPlotBtn}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={handleFinishDrawing}
                disabled={drawnPoints.length < 3}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                <Check className="w-3 h-3" />
                <span>Finish ({drawnPoints.length})</span>
              </button>
              <button
                onClick={handleCancelDrawing}
                className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {isCustomDrawn && onResetCustomPlot && !isDrawing && (
            <button
              onClick={onResetCustomPlot}
              title="Reset to default centered square plot"
              className="px-2 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 transition cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

      </div>

      {/* Floating Prompt Banner when in Drawing Mode */}
      {isDrawing && (
        <div className="absolute top-16 left-3 right-3 z-10 bg-amber-500/95 text-white px-4 py-2.5 rounded-xl shadow-md text-xs font-bold flex items-center justify-between backdrop-blur-xs">
          <span>📍 {t.drawPlotPrompt} ({drawnPoints.length} points placed)</span>
          <span className="text-[11px] underline cursor-pointer" onClick={handleCancelDrawing}>Cancel</span>
        </div>
      )}

      {/* Helper Tip Pill at Bottom Center */}
      {!isDrawing && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] text-white font-medium shadow-md pointer-events-none hidden md:flex items-center gap-1.5 border border-white/20">
          <span>💡</span>
          <span>Click anywhere or drag pin to position on your exact field</span>
        </div>
      )}

      {/* Right Floating HUD: Acreage & Land Details */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 max-w-[230px]">
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span className="flex items-center gap-1.5 uppercase text-[10px]">
              <Ruler className="w-3.5 h-3.5 text-emerald-700" /> Farm Field Area
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
              {isCustomDrawn ? 'TRACED' : 'CENTERED'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-heading font-extrabold text-slate-900">{areaHa}</span>
            <span className="text-xs font-bold text-slate-600">Hectares</span>
          </div>
          <p className="text-xs text-emerald-700 font-bold mt-0.5">
            = {areaAcres} Standard Acres
          </p>

          {allocatedCrops && allocatedCrops.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Crop Mix</span>
              <div className="flex flex-wrap gap-1">
                {allocatedCrops.slice(0, 3).map((c, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200 font-semibold">
                    {c.crop_name.split(' ')[0]}: {c.allocated_ha}ha
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Aquifer Well Indicator Badge */}
        {groundwaterStation && (
          <div className="bg-white/95 backdrop-blur-md p-2 rounded-xl border border-red-200 shadow-sm text-xs">
            <div className="flex items-center gap-1.5 text-red-700 font-bold mb-0.5">
              <Droplet className="w-3.5 h-3.5 fill-current" />
              <span>CGWB Well ({groundwaterStation.distance_km} km)</span>
            </div>
            <div className="text-slate-800 flex items-center justify-between">
              <span>Depth: <b className="text-red-700 font-bold">{groundwaterStation.depth_mbgl} m</b></span>
              <span className="text-red-800 text-[10px] font-bold uppercase bg-red-100 px-1.5 py-0.5 rounded border border-red-200">
                {groundwaterStation.classification}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: Environmental Info */}
      {weather && (
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-2.5 text-xs text-slate-700">
          <div className="flex items-center gap-1.5">
            <CloudSun className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-slate-900 font-bold">{weather.temperature_c}°C</span>
          </div>
          <div className="h-3 w-px bg-slate-300 hidden sm:block" />
          <div>
            ET0: <span className="font-bold text-blue-700">{weather.et0_mm} mm/d</span>
          </div>
          <div className="h-3 w-px bg-slate-300 hidden sm:block" />
          <div>
            Drought: <span className={`font-bold ${weather.drought_risk === 'High' ? 'text-red-700' : 'text-amber-700'}`}>{weather.drought_risk}</span>
          </div>
        </div>
      )}

    </div>
  );
};
