import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Droplets, 
  Utensils, 
  TrendingUp, 
  ShieldCheck, 
  FileText,
  PieChart as PieIcon,
  Printer,
  Sparkles
} from 'lucide-react';
import { OptimizationResponse } from '../types';
import { Translations } from '../constants/translations';

interface OptimizationResultsProps {
  result: OptimizationResponse;
  onOpenAIReport: () => void;
  onOpenKisanCard: () => void;
  t: Translations;
}

const CROP_COLORS: Record<string, string> = {
  PADDY: '#0284c7', // Sky Blue
  WHEAT: '#eab308', // Golden Yellow
  MAIZE: '#f97316', // Orange
  COTTON: '#a855f7', // Purple
  MOONG: '#16a34a', // Leaf Green
  CHICKPEA: '#84cc16', // Lime
  MUSTARD: '#f59e0b', // Amber Yellow
  SUGARCANE: '#06b6d4', // Cyan
  GROUNDNUT: '#b45309', // Amber Brown
  TOMATO: '#dc2626' // Red
};

export const OptimizationResults: React.FC<OptimizationResultsProps> = ({
  result,
  onOpenAIReport,
  onOpenKisanCard,
  t
}) => {
  const { allocations, diagnosis } = result;
  const [hoveredCrop, setHoveredCrop] = useState<string | null>(null);

  const waterPct = Math.min(100, Math.round((result.total_water_consumed_m3 / Math.max(1, result.total_water_budget_m3)) * 100));
  const foodPct = Math.round((result.total_food_produced_tonnes / Math.max(1, result.total_food_target_tonnes)) * 100);
  const incomePct = Math.round((result.total_farmer_net_income_inr / Math.max(1, result.total_income_target_inr)) * 100);

  // Calculate SVG Donut segments
  const totalHa = Math.max(0.1, result.total_land_allocated_ha);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  const donutSegments = allocations.map((a) => {
    const fraction = a.allocated_ha / totalHa;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += fraction * circumference;
    return {
      crop: a,
      color: CROP_COLORS[a.crop_code] || '#16a34a',
      fraction,
      percentage: a.percentage_of_land,
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className="farm-card p-6 flex flex-col gap-6">
      
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200 shrink-0">
            <CheckCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-heading font-extrabold text-slate-900">
                {t.recommendedPlanTitle}
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {result.solver_status === 'OPTIMAL' ? 'Mathematically Optimal' : 'Feasible Solution'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Allocated across {result.total_land_allocated_ha} Hectares ({(result.total_land_allocated_ha * 2.471).toFixed(1)} Acres)
            </p>
          </div>
        </div>

        {/* Dual Actions: Print Kisan Card & AI Advisory Report */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenKisanCard}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>{t.printCardBtn}</span>
          </button>

          <button
            onClick={onOpenAIReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>AI Report</span>
          </button>
        </div>
      </div>

      {/* Conflict / Bottleneck Diagnosis Alert */}
      {diagnosis.has_conflict && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-800">
            <span className="font-bold text-amber-900 uppercase tracking-wide block mb-1">
              Tight Water Constraint Detected
            </span>
            <p className="text-slate-700 leading-relaxed mb-2">
              {diagnosis.explanation}
            </p>
            <div className="flex flex-wrap gap-2 font-semibold">
              {diagnosis.water_shortfall_m3 > 0 && (
                <span className="bg-white text-red-700 px-2.5 py-1 rounded-md border border-red-200 shadow-2xs">
                  Water Shortfall: {diagnosis.water_shortfall_m3.toLocaleString()} m³
                </span>
              )}
              {diagnosis.income_shortfall_inr > 0 && (
                <span className="bg-white text-amber-800 px-2.5 py-1 rounded-md border border-amber-200 shadow-2xs">
                  Income Gap: ₹{diagnosis.income_shortfall_inr.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3 Core Metric Cards: Water, Food, Income */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* 1. Water Consumed vs Budget */}
        <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-blue-700 font-bold">
                <Droplets className="w-4 h-4" /> {t.waterConsumed}
              </span>
              <span className="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                {waterPct}% of Budget
              </span>
            </div>
            <div className="text-2xl font-heading font-extrabold text-slate-900 my-1">
              {result.total_water_consumed_m3.toLocaleString()} <span className="text-sm font-semibold text-slate-500">m³</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full my-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  waterPct > 95 ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, waterPct)}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-emerald-800 font-bold flex items-center gap-1 mt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            {result.water_savings_vs_budget_m3.toLocaleString()} m³ Saved vs Paddy
          </p>
        </div>

        {/* 2. Food Production vs Target */}
        <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-amber-700 font-bold">
                <Utensils className="w-4 h-4" /> {t.foodHarvested}
              </span>
              <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                {foodPct}% of Target
              </span>
            </div>
            <div className="text-2xl font-heading font-extrabold text-slate-900 my-1">
              {result.total_food_produced_tonnes.toFixed(1)} <span className="text-sm font-semibold text-slate-500">Tonnes</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full my-2 overflow-hidden">
              <div 
                className="h-full rounded-full bg-amber-500 transition-all duration-300" 
                style={{ width: `${Math.min(100, foodPct)}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-2">
            ≈ {(result.total_food_produced_tonnes * 10).toFixed(0)} Quintals Harvested
          </p>
        </div>

        {/* 3. Farmer Net Profit */}
        <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <TrendingUp className="w-4 h-4" /> {t.netProfit}
              </span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                {incomePct}% of Target
              </span>
            </div>
            <div className="text-2xl font-heading font-extrabold text-emerald-700 my-1">
              ₹{result.total_farmer_net_income_inr.toLocaleString()}
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full my-2 overflow-hidden">
              <div 
                className="h-full rounded-full bg-emerald-600 transition-all duration-300" 
                style={{ width: `${Math.min(100, incomePct)}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-slate-700 font-semibold mt-2">
            ₹{(result.total_farmer_net_income_inr / Math.max(1, result.total_land_allocated_ha)).toFixed(0)}/ha (₹{(result.total_farmer_net_income_inr / (Math.max(1, result.total_land_allocated_ha) * 2.471)).toFixed(0)}/ac)
          </p>
        </div>

      </div>

      {/* Visual Crop Land Share: Clean SVG Donut + Horizontal Bars */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {t.acreageShareTitle}
            </span>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-200">
            {allocations.length} Diversified Crops
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          
          {/* Crisp Custom SVG Donut */}
          <div className="md:col-span-5 flex items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="18"
                />
                {donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="18"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    className="transition-all duration-300"
                    style={{
                      opacity: hoveredCrop && hoveredCrop !== seg.crop.crop_code ? 0.35 : 1
                    }}
                  />
                ))}
              </svg>
              {/* Donut Center Label */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Allocated</span>
                <span className="text-xl font-heading font-extrabold text-slate-900 leading-none my-0.5">
                  {result.total_land_allocated_ha} ha
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  {(result.total_land_allocated_ha * 2.471).toFixed(1)} Acres
                </span>
              </div>
            </div>
          </div>

          {/* Allocation Breakdown Progress Bars & Cards */}
          <div className="md:col-span-7 flex flex-col gap-2.5">
            {allocations.map((a) => {
              const color = CROP_COLORS[a.crop_code] || '#16a34a';
              const isHovered = hoveredCrop === a.crop_code;
              return (
                <div 
                  key={a.crop_code}
                  onMouseEnter={() => setHoveredCrop(a.crop_code)}
                  onMouseLeave={() => setHoveredCrop(null)}
                  className={`p-2.5 rounded-lg border transition ${
                    isHovered ? 'bg-white border-emerald-400 shadow-xs' : 'bg-white border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      {a.crop_name}
                    </span>
                    <span className="font-bold text-slate-700">
                      {a.allocated_ha} ha <span className="text-slate-500 font-normal">({(a.allocated_ha * 2.471).toFixed(1)} ac &bull; {a.percentage_of_land}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${a.percentage_of_land}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Full-Width Recommended Planting Breakdown Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h4 className="text-sm font-heading font-extrabold text-slate-900">
              {t.actionPlanTitle}
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Exact land acreage, harvest expectations, water requirement, and projected net profit
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Anti-Monoculture Diversified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px] bg-slate-50/50">
                <th className="py-2.5 pl-3">{t.cropToPlant}</th>
                <th className="py-2.5 px-3">{t.landSize}</th>
                <th className="py-2.5 px-3">{t.expectedHarvest}</th>
                <th className="py-2.5 px-3">{t.waterNeeded}</th>
                <th className="py-2.5 pr-3 text-right">{t.netFarmerProfit}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allocations.map((a) => (
                <tr key={a.crop_code} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 pl-3">
                    <div className="flex items-center gap-2.5">
                      <span 
                        className="w-3.5 h-3.5 rounded-full shrink-0" 
                        style={{ backgroundColor: CROP_COLORS[a.crop_code] || '#16a34a' }} 
                      />
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">{a.crop_name}</span>
                        <span className="text-[11px] text-slate-500">{a.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 text-xs block">{a.allocated_ha} ha</span>
                    <span className="text-[11px] text-slate-500 font-medium">({(a.allocated_ha * 2.471).toFixed(1)} Acres)</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 text-xs block">{a.expected_yield_tonnes.toFixed(1)} Tonnes</span>
                    <span className="text-[11px] text-slate-500 font-medium">({(a.expected_yield_tonnes * 10).toFixed(0)} Quintals)</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-blue-700 text-xs block">{a.expected_water_consumed_m3.toLocaleString()} m³</span>
                    <span className="text-[11px] text-slate-500 font-medium">{(a.expected_water_consumed_m3 / a.allocated_ha).toFixed(0)} m³/ha</span>
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <span className="font-extrabold text-emerald-700 text-sm block">₹{a.expected_net_income_inr.toLocaleString()}</span>
                    <span className="text-[11px] text-slate-500 font-medium">₹{(a.expected_net_income_inr / a.allocated_ha).toFixed(0)} / ha</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-xs">
                <td className="py-3 pl-3 text-slate-900">Total Farm Allocation</td>
                <td className="py-3 px-3 text-slate-900">
                  {result.total_land_allocated_ha} ha ({(result.total_land_allocated_ha * 2.471).toFixed(1)} ac)
                </td>
                <td className="py-3 px-3 text-slate-900">
                  {result.total_food_produced_tonnes.toFixed(1)} t
                </td>
                <td className="py-3 px-3 text-blue-800">
                  {result.total_water_consumed_m3.toLocaleString()} m³
                </td>
                <td className="py-3 pr-3 text-right text-emerald-800 text-sm">
                  ₹{result.total_farmer_net_income_inr.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
};
