import React, { useState, useMemo } from 'react';
import { 
  Sprout, 
  Droplets, 
  TrendingUp, 
  Info, 
  ArrowUpDown, 
  LayoutGrid, 
  Table as TableIcon,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { CropPredictionItem } from '../types';

interface CropPredictionStudioProps {
  predictions: CropPredictionItem[];
  modelName: string;
}

const CROP_ICONS: Record<string, string> = {
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

export const CropPredictionStudio: React.FC<CropPredictionStudioProps> = ({
  predictions,
  modelName
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'water_saver' | 'high_profit' | 'pulses'>('all');
  const [sortBy, setSortBy] = useState<'efficiency' | 'profit' | 'water_asc' | 'suitability'>('efficiency');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showModelExplainer, setShowModelExplainer] = useState<boolean>(false);

  // Compute Water Efficiency (Net Profit per m3 of water)
  const enrichedPredictions = useMemo(() => {
    return predictions.map(p => {
      const waterEff = p.water_req_m3_ha > 0 ? (p.estimated_net_income_inr_ha / p.water_req_m3_ha) : 0;
      const profitMarginPct = p.estimated_revenue_inr_ha > 0 
        ? Math.round((p.estimated_net_income_inr_ha / p.estimated_revenue_inr_ha) * 100) 
        : 0;
      const perAcreProfit = Math.round(p.estimated_net_income_inr_ha / 2.471);

      return {
        ...p,
        waterEff: Math.round(waterEff * 10) / 10,
        profitMarginPct,
        perAcreProfit
      };
    });
  }, [predictions]);

  // Apply Filter
  const filteredPredictions = useMemo(() => {
    return enrichedPredictions.filter(p => {
      if (filterMode === 'water_saver') return p.water_req_m3_ha <= 4000;
      if (filterMode === 'high_profit') return p.estimated_net_income_inr_ha >= 75000;
      if (filterMode === 'pulses') return p.category.toLowerCase().includes('pulse') || p.category.toLowerCase().includes('oilseed');
      return true;
    });
  }, [enrichedPredictions, filterMode]);

  // Apply Sorting
  const sortedPredictions = useMemo(() => {
    return [...filteredPredictions].sort((a, b) => {
      if (sortBy === 'efficiency') return b.waterEff - a.waterEff;
      if (sortBy === 'profit') return b.estimated_net_income_inr_ha - a.estimated_net_income_inr_ha;
      if (sortBy === 'water_asc') return a.water_req_m3_ha - b.water_req_m3_ha;
      if (sortBy === 'suitability') return b.suitability_score - a.suitability_score;
      return 0;
    });
  }, [filteredPredictions, sortBy]);

  return (
    <div className="farm-card p-5 sm:p-6 flex flex-col gap-5 border border-slate-200/90 shadow-sm rounded-2xl bg-white">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md">
            <Sprout className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-heading font-extrabold text-slate-900">
                Crop Yield &amp; Mandi Profit Estimator
              </h3>
              <span className="text-[10px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                ICAR &bull; ET0 Calibrated
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-xl leading-relaxed">
              Predicts regional harvest yields, water demand, and net mandi income using real-time solar evapotranspiration and mandi prices.
            </p>
          </div>
        </div>

        {/* Model Badge with Educational Explainer Modal Toggle */}
        <div className="relative self-start lg:self-center shrink-0">
          <button
            onClick={() => setShowModelExplainer(!showModelExplainer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer shadow-2xs"
            title="Learn how the FAO-56 model predicts crop water needs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-mono text-[11px]">{modelName}</span>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Model Explainer Popover */}
          {showModelExplainer && (
            <div className="absolute right-0 top-10 z-30 w-80 bg-slate-900 text-white p-3.5 rounded-xl shadow-xl text-xs space-y-2 border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="font-bold text-emerald-400">FAO-56 Irrigation Standard</span>
                <button onClick={() => setShowModelExplainer(false)} className="text-slate-400 hover:text-white">&times;</button>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Uses the standard <b>Penman-Monteith crop coefficient equation</b> (<code>ETc = Kc &times; ET0</code>). It dynamically adjusts water demand according to local temperature, humidity, and solar radiation to ensure crops thrive without over-pumping borewells.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Controls Bar: Filter Tabs, Sort, and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-2 rounded-xl border border-slate-200/80">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              filterMode === 'all' 
                ? 'bg-emerald-700 text-white shadow-2xs' 
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            All Crops ({enrichedPredictions.length})
          </button>
          <button
            onClick={() => setFilterMode('water_saver')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filterMode === 'water_saver' 
                ? 'bg-emerald-700 text-white shadow-2xs' 
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span>💧 Low Water</span>
          </button>
          <button
            onClick={() => setFilterMode('high_profit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filterMode === 'high_profit' 
                ? 'bg-emerald-700 text-white shadow-2xs' 
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span>💰 Top Profit</span>
          </button>
          <button
            onClick={() => setFilterMode('pulses')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              filterMode === 'pulses' 
                ? 'bg-emerald-700 text-white shadow-2xs' 
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Pulses &amp; Oilseeds
          </button>
        </div>

        {/* Sort & View Mode Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-bold text-xs text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="efficiency">Water Efficiency (₹/m³)</option>
              <option value="profit">Highest Net Profit (₹/ha)</option>
              <option value="water_asc">Lowest Water Demand</option>
              <option value="suitability">Agronomic Suitability</option>
            </select>
          </div>

          {/* Cards vs Table View */}
          <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === 'cards' ? 'bg-slate-100 text-emerald-800' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-100 text-emerald-800' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Cards View (2 Columns in Half-width Layout for optimal readability) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedPredictions.map((p) => {
            const icon = CROP_ICONS[p.crop_code] || '🌱';
            const isHeavyWater = p.water_req_m3_ha > 10000;
            const isSuperSaver = p.water_req_m3_ha <= 3000;
            const isTopEarner = p.estimated_net_income_inr_ha >= 80000;

            return (
              <div 
                key={p.crop_code} 
                className={`bg-white rounded-2xl p-4 border transition-all duration-150 flex flex-col justify-between hover:shadow-md ${
                  isHeavyWater 
                    ? 'border-red-200/80 hover:border-red-300' 
                    : isSuperSaver 
                    ? 'border-emerald-200 hover:border-emerald-300' 
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div>
                  
                  {/* Top Row: Crop Name, Icon & Status Pill */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl shrink-0">
                        {icon}
                      </div>
                      <div>
                        <h4 className="font-heading font-extrabold text-slate-900 text-sm leading-tight">
                          {p.crop_name}
                        </h4>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {p.category}
                        </span>
                      </div>
                    </div>

                    {/* Water Badge */}
                    {isHeavyWater ? (
                      <span className="text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        <span>High Water Drain</span>
                      </span>
                    ) : isSuperSaver ? (
                      <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Droplets className="w-3 h-3 text-emerald-600" />
                        <span>Water Saver</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full shrink-0">
                        Balanced
                      </span>
                    )}
                  </div>

                  {/* Primary Highlight Block: Net Profit & Water Efficiency */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3 space-y-2">
                    
                    {/* Net Profit Row */}
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-slate-600">Net Farmer Profit:</span>
                      <div className="text-right">
                        <span className="text-base font-heading font-extrabold text-emerald-800">
                          ₹{p.estimated_net_income_inr_ha.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium ml-1">/ ha</span>
                      </div>
                    </div>

                    {/* Per Acre Equivalent */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>Per Standard Acre:</span>
                      <span className="font-bold text-slate-700">₹{p.perAcreProfit.toLocaleString()} / acre</span>
                    </div>

                    {/* Water Efficiency Tag (The Key Innovation Metric) */}
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                      <span className="font-semibold text-slate-600 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500 fill-current" />
                        Water Return:
                      </span>
                      <span className="font-extrabold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded font-mono">
                        ₹{p.waterEff} / m³
                      </span>
                    </div>

                  </div>

                  {/* Secondary Agronomic Metrics Grid */}
                  <div className="space-y-1.5 text-xs text-slate-700 px-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Expected Yield:</span>
                      <b className="text-slate-900 font-bold">{p.predicted_yield_tonnes_ha} Tonnes/ha</b>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Irrigation Need:</span>
                      <b className={isHeavyWater ? 'text-red-700' : 'text-blue-700'}>
                        {p.water_req_m3_ha.toLocaleString()} m³/ha
                      </b>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Mandi Price (Gross):</span>
                      <span className="font-semibold text-slate-800">₹{p.estimated_revenue_inr_ha.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Cultivation Cost:</span>
                      <span className="text-slate-500 font-medium">₹{p.cultivation_cost_inr_ha.toLocaleString()}</span>
                    </div>
                  </div>

                </div>

                {/* Footer: Agronomic Suitability & Confidence Meter */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-slate-600 font-medium">
                      Suitability: <b className="text-slate-900 font-extrabold">{(p.suitability_score * 100).toFixed(0)}%</b>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Conf: {(p.confidence * 100).toFixed(0)}%
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Table View (Clean, Sortable Data Comparison) */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold">
                <th className="py-2.5 px-3">Crop Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Yield (t/ha)</th>
                <th className="py-2.5 px-3 text-right">Water (m³/ha)</th>
                <th className="py-2.5 px-3 text-right">Gross Rev (₹)</th>
                <th className="py-2.5 px-3 text-right">Cost (₹)</th>
                <th className="py-2.5 px-3 text-right text-emerald-800">Net Profit (₹/ha)</th>
                <th className="py-2.5 px-3 text-right text-emerald-800 font-mono">Efficiency (₹/m³)</th>
                <th className="py-2.5 px-3 text-center">Match</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedPredictions.map((p) => {
                const icon = CROP_ICONS[p.crop_code] || '🌱';
                const isHeavyWater = p.water_req_m3_ha > 10000;
                return (
                  <tr key={p.crop_code} className="hover:bg-slate-50 transition font-medium text-slate-800">
                    <td className="py-2.5 px-3 font-bold flex items-center gap-1.5">
                      <span>{icon}</span>
                      <span>{p.crop_name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{p.category}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{p.predicted_yield_tonnes_ha}</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${isHeavyWater ? 'text-red-700' : 'text-blue-700'}`}>
                      {p.water_req_m3_ha.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold">₹{p.estimated_revenue_inr_ha.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">₹{p.cultivation_cost_inr_ha.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-emerald-800 bg-emerald-50/50">
                      ₹{p.estimated_net_income_inr_ha.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 bg-emerald-50/70">
                      ₹{p.waterEff}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                      {(p.suitability_score * 100).toFixed(0)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Explanatory Footer Callout */}
      <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100 flex items-start gap-2 text-xs text-emerald-900">
        <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <b>Key Agro-Economic Insight:</b> Notice how <b>Green Gram (Moong)</b> generates <b>₹50+ net profit per m³ of water</b> compared to only <b>₹5/m³ for Flood Paddy</b>. Switching just 20% of acreage to Moong can preserve borewells for 15+ additional years while expanding farmer margins.
        </p>
      </div>

    </div>
  );
};
