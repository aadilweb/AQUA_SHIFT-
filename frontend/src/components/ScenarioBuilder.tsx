import React from 'react';
import { 
  Sliders, 
  Droplet, 
  TrendingUp, 
  Utensils, 
  Ruler, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  Check, 
  Leaf,
  Sun,
  CloudRain,
  Flame
} from 'lucide-react';
import { CropDetail } from '../types';
import { Translations } from '../constants/translations';

interface ScenarioBuilderProps {
  totalLand: number;
  setTotalLand: (val: number) => void;
  waterBudget: number;
  setWaterBudget: (val: number) => void;
  foodTarget: number;
  setFoodTarget: (val: number) => void;
  incomeTarget: number;
  setIncomeTarget: (val: number) => void;
  availableCrops: CropDetail[];
  selectedCrops: string[];
  toggleCrop: (code: string) => void;
  onRunOptimization: () => void;
  isLoading: boolean;
  onApplyPreset: (presetKey: string) => void;
  activePreset: string;
  t: Translations;
}

const CROP_EMOJIS: Record<string, string> = {
  PADDY: '🌾',
  WHEAT: '🌾',
  MAIZE: '🌽',
  COTTON: '☁️',
  MOONG: '🟢',
  CHICKPEA: '🧆',
  MUSTARD: '🌻',
  SUGARCANE: '🎋',
  GROUNDNUT: '🥜',
  TOMATO: '🍅'
};

export const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({
  totalLand,
  setTotalLand,
  waterBudget,
  setWaterBudget,
  foodTarget,
  setFoodTarget,
  incomeTarget,
  setIncomeTarget,
  availableCrops,
  selectedCrops,
  toggleCrop,
  onRunOptimization,
  isLoading,
  onApplyPreset,
  activePreset,
  t
}) => {
  const isExtreme = waterBudget < 60000 || activePreset === 'extreme';

  return (
    <div className="farm-card p-5 sm:p-6 flex flex-col gap-6 bg-white border border-slate-200/90 shadow-sm rounded-2xl">
      
      {/* Header & Quick Climate Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md">
            <Sliders className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base font-heading font-extrabold text-slate-900">
              {t.farmTargetTitle}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {t.farmTargetSubtitle}
            </p>
          </div>
        </div>

        {/* Quick Scenario Buttons with Semantic Colors */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          {[
            { key: 'baseline', label: t.normalYear, activeClass: 'bg-emerald-600 text-white shadow-xs', icon: '🌱' },
            { key: 'water_20', label: t.mildShortage, activeClass: 'bg-sky-600 text-white shadow-xs', icon: '💧' },
            { key: 'water_50', label: t.severeDrought, activeClass: 'bg-amber-600 text-white shadow-xs', icon: '☀️' },
            { key: 'extreme', label: t.crisis, activeClass: 'bg-rose-600 text-white shadow-xs', icon: '🔥' }
          ].map((p) => {
            const isActive = activePreset === p.key;
            return (
              <button
                key={p.key}
                onClick={() => onApplyPreset(p.key)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  isActive
                    ? p.activeClass
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders Grid: 2-Column Responsive Layout with Multi-tone Themes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* 1. Total Land Slider (Slate & Emerald Earth Theme) */}
        <div className="bg-slate-50/90 hover:bg-white p-4 rounded-xl border border-slate-200/90 transition shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-emerald-700" /> {t.totalFarmArea}
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">
                {(totalLand * 2.471).toFixed(1)} Acres
              </span>
            </div>
            <div className="text-2xl font-heading font-extrabold text-slate-900 my-1">
              {totalLand} <span className="text-sm font-semibold text-slate-500">Hectares</span>
            </div>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="1"
            value={totalLand}
            onChange={(e) => setTotalLand(parseFloat(e.target.value))}
            className="w-full my-2 accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>5 ha (12 ac)</span>
            <span>100 ha (247 ac)</span>
          </div>
        </div>

        {/* 2. Water Budget Slider (Hydro Azure/Blue Theme) */}
        <div className={`p-4 rounded-xl border transition shadow-2xs flex flex-col justify-between ${
          waterBudget < 60000 
            ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-200' 
            : 'bg-sky-50/50 hover:bg-white border-sky-200/90'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Droplet className={`w-4 h-4 ${waterBudget < 60000 ? 'text-rose-600' : 'text-sky-600'}`} /> 
                {t.availableBorewellWater}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md border font-mono ${
                waterBudget < 60000 
                  ? 'bg-rose-100 text-rose-800 border-rose-300' 
                  : 'bg-sky-100 text-sky-800 border-sky-200'
              }`}>
                {(waterBudget / 1000).toFixed(0)}k m³
              </span>
            </div>
            <div className="text-2xl font-heading font-extrabold text-slate-900 my-1">
              {(waterBudget / 1000).toFixed(0)} <span className="text-sm font-semibold text-slate-500">Thousand m³</span>
            </div>
          </div>
          <input
            type="range"
            min="10000"
            max="300000"
            step="5000"
            value={waterBudget}
            onChange={(e) => setWaterBudget(parseFloat(e.target.value))}
            className="w-full my-2 accent-sky-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>10,000 m³</span>
            <span>3,00,000 m³</span>
          </div>
        </div>

        {/* 3. Food Target Slider (Warm Amber Grain Theme) */}
        <div className="bg-amber-50/40 hover:bg-white p-4 rounded-xl border border-amber-200/80 transition shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-amber-700" /> {t.minimumFoodTarget}
              </span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200 font-mono">
                {(foodTarget * 10).toFixed(0)} Quintals
              </span>
            </div>
            <div className="text-2xl font-heading font-extrabold text-slate-900 my-1">
              {foodTarget} <span className="text-sm font-semibold text-slate-500">Tonnes Grain</span>
            </div>
          </div>
          <input
            type="range"
            min="10"
            max="150"
            step="5"
            value={foodTarget}
            onChange={(e) => setFoodTarget(parseFloat(e.target.value))}
            className="w-full my-2 accent-amber-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>10 Tonnes</span>
            <span>150 Tonnes</span>
          </div>
        </div>

        {/* 4. Income Target Slider (Prosperity Emerald/Gold Theme) */}
        <div className="bg-emerald-50/40 hover:bg-white p-4 rounded-xl border border-emerald-200/80 transition shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-700" /> {t.netProfitTarget}
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">
                ₹{(incomeTarget / (totalLand * 2.471)).toFixed(0)} / Acre
              </span>
            </div>
            <div className="text-2xl font-heading font-extrabold text-slate-900 my-1">
              ₹{(incomeTarget / 100000).toFixed(1)} <span className="text-sm font-semibold text-slate-500">Lakhs Total</span>
            </div>
          </div>
          <input
            type="range"
            min="300000"
            max="3000000"
            step="50000"
            value={incomeTarget}
            onChange={(e) => setIncomeTarget(parseFloat(e.target.value))}
            className="w-full my-2 accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>₹3.0 Lakhs</span>
            <span>₹30.0 Lakhs</span>
          </div>
        </div>

      </div>

      {/* Warning Callout when Water is Extremely Low */}
      {isExtreme && (
        <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs text-rose-900 animate-in fade-in duration-200">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <b className="font-bold">Severe Water Shortage Warning:</b> With only {(waterBudget / 1000).toFixed(0)}k m³ of available water, high-water crops like flood-irrigated paddy will deplete your tubewells. The system prioritizes drought-resilient crops (Moong, Mustard, Drip Tomato) to protect your livelihood and avoid dried-up borewells.
          </div>
        </div>
      )}

      {/* Candidate Crops Multi-Select Portfolio */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-700" />
              {t.cropsEligibleTitle} ({selectedCrops.length} Active Candidates)
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.cropsEligibleSubtitle}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            Selected: <b className="text-slate-900">{selectedCrops.length}</b> / {availableCrops.length}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {availableCrops.map((c) => {
            const isSelected = selectedCrops.includes(c.code);
            const emoji = CROP_EMOJIS[c.code] || '🌱';
            const isPulse = c.category.toLowerCase().includes('pulse');
            const isOilseed = c.category.toLowerCase().includes('oilseed');
            const isCereal = c.category.toLowerCase().includes('cereal');

            return (
              <button
                key={c.code}
                type="button"
                onClick={() => toggleCrop(c.code)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? isPulse 
                      ? 'bg-emerald-50/80 border-emerald-400 shadow-xs ring-1 ring-emerald-300' 
                      : isOilseed 
                      ? 'bg-amber-50/80 border-amber-400 shadow-xs ring-1 ring-amber-300'
                      : isCereal
                      ? 'bg-sky-50/80 border-sky-400 shadow-xs ring-1 ring-sky-300'
                      : 'bg-teal-50/80 border-teal-400 shadow-xs ring-1 ring-teal-300'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold truncate flex items-center gap-1.5 ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                      <span>{emoji}</span>
                      <span className="truncate">{c.name}</span>
                    </span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                    }`}>
                      {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : ''}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500 block truncate">
                    {c.category} &bull; {c.season}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold">
                  <span className={`text-[11px] ${isSelected ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
                    {(c.water_req_m3_ha / 1000).toFixed(1)}k m³
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    c.drought_tolerance === 'High' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : c.drought_tolerance === 'Medium' 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {c.drought_tolerance}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Trigger Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
        <div className="text-xs text-slate-600">
          <span className="font-bold text-emerald-800">Mathematically Guaranteed:</span> Balances your borewell water with maximum farm net profit.
        </div>

        <button
          onClick={onRunOptimization}
          disabled={isLoading}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:from-emerald-800 active:to-teal-900 text-white font-heading font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>{t.calculating}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>{t.generatePlanBtn}</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
