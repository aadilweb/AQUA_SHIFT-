import React from 'react';
import { CloudSun, Droplets, Layers, TrendingDown, Thermometer, Wind, AlertCircle } from 'lucide-react';
import { WeatherData, SoilProfile, GroundwaterStationInfo } from '../types';

interface EnvironmentalCardsProps {
  weather?: WeatherData;
  soil?: SoilProfile;
  groundwater?: GroundwaterStationInfo;
}

export const EnvironmentalCards: React.FC<EnvironmentalCardsProps> = ({
  weather,
  soil,
  groundwater
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Weather Card */}
      <div className="farm-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-amber-700 mb-2">Local Weather & Rain</h3>
        {weather ? (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <Thermometer className="mr-1 h-3.5 w-3.5 text-amber-600" /> {weather.temperature_c}°C
            </div>
            <div>
              <Wind className="mr-1 h-3.5 w-3.5 text-blue-600" /> {weather.humidity_pct}% humidity
            </div>
            <div>
              <CloudSun className="mr-1 h-3.5 w-3.5 text-amber-600" /> ET0 {weather.et0_mm} mm/d
            </div>
            <div>
              <AlertCircle className="mr-1 h-3.5 w-3.5 text-red-600" /> Drought {weather.drought_risk}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Unavailable</p>
        )}
      </div>

      {/* Soil Card */}
      <div className="farm-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-emerald-700 mb-2">Soil Quality</h3>
        {soil ? (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <Layers className="mr-1 h-3.5 w-3.5 text-emerald-600" /> pH {soil.ph}
            </div>
            <div>
              <Droplets className="mr-1 h-3.5 w-3.5 text-blue-600" /> Moisture {soil.soil_moisture_pct}%
            </div>
            <div>
              <TrendingDown className="mr-1 h-3.5 w-3.5 text-red-600" /> Drop {Math.abs(groundwater?.historical_trend_slope || 0.68)} m/yr
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Unavailable</p>
        )}
      </div>

      {/* Groundwater Card */}
      <div className="farm-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-blue-700 mb-2">Borewell & Water Table</h3>
        {groundwater ? (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <Droplets className="mr-1 h-3.5 w-3.5 text-blue-600" /> {groundwater.depth_mbgl} m
            </div>
            <div>
              <AlertCircle className="mr-1 h-3.5 w-3.5 text-red-600" /> {groundwater.classification}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Unavailable</p>
        )}
      </div>
    </div>
  );
};