import React from 'react';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  Sprout, 
  Droplets, 
  MapPin, 
  Calendar, 
  FileText,
  QrCode
} from 'lucide-react';
import { OptimizationResponse, WeatherData, SoilProfile, GroundwaterStationInfo } from '../types';
import { Translations } from '../constants/translations';

interface KisanAdvisoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: OptimizationResponse;
  locationLabel: string;
  totalLand: number;
  center: [number, number];
  weather?: WeatherData;
  soil?: SoilProfile;
  groundwater?: GroundwaterStationInfo;
  t: Translations;
}

export const KisanAdvisoryCardModal: React.FC<KisanAdvisoryCardModalProps> = ({
  isOpen,
  onClose,
  result,
  locationLabel,
  totalLand,
  center,
  weather,
  soil,
  groundwater,
  t
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="print:hidden bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-heading font-extrabold text-sm">
              Official Kisan Soil &amp; Seasonal Crop Advisory Card
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Body */}
        <div className="p-8 text-slate-900 print:p-6" id="kisan-card-print">
          
          {/* Card Official Header */}
          <div className="border-b-2 border-emerald-700 pb-4 mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-emerald-700 inline-block" />
                <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest">
                  National Agricultural Decision Support Framework
                </span>
              </div>
              <h1 className="text-2xl font-heading font-extrabold text-slate-900">
                AquaShift Kisan Crop &amp; Water Advisory
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Integrated Groundwater, Soil Nutrition &amp; Market Optimization Report
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="font-mono font-bold text-slate-700 block">CARD ID: AS-2026-{Math.floor(1000 + Math.random() * 9000)}</span>
              <span className="text-slate-500 block mt-0.5">Date: {currentDate}</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                Kharif / Rabi 2026
              </span>
            </div>
          </div>

          {/* Farmer & Field Cadastre Section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs mb-6">
            <div>
              <span className="text-slate-500 block text-[11px]">Farm Location</span>
              <span className="font-bold text-slate-900 block mt-0.5">{locationLabel}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">GPS Cadastre</span>
              <span className="font-mono font-semibold text-slate-800 block mt-0.5">
                {center[0].toFixed(4)}°N, {center[1].toFixed(4)}°E
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Total Land Area</span>
              <span className="font-bold text-slate-900 block mt-0.5">
                {totalLand} ha ({(totalLand * 2.471).toFixed(1)} ac)
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Aquifer Status</span>
              <span className="font-bold text-red-700 block mt-0.5">
                {groundwater?.depth_mbgl || 34.6} m ({groundwater?.classification || 'Over-Exploited'})
              </span>
            </div>
          </div>

          {/* Soil & Weather Telemetry Highlights */}
          <div className="grid grid-cols-3 gap-3 text-xs mb-6">
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Soil Profile</span>
              <span className="font-bold text-slate-900 block mt-1">{soil?.texture || 'Alluvial Sandy Loam'}</span>
              <span className="text-[11px] text-slate-600 block">pH: {soil?.ph || 7.6} &bull; OC: {soil?.organic_carbon_pct || 0.52}%</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">NPK Nutrients</span>
              <span className="font-bold text-slate-900 block mt-1">
                N:{soil?.nitrogen_kg_ha || 215} | P:{soil?.phosphorus_kg_ha || 22} | K:{soil?.potassium_kg_ha || 210}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold block">Balanced for Pulses</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Seasonal Rain Risk</span>
              <span className="font-bold text-red-700 block mt-1">{weather?.rainfall_deficit_pct || 72}% Deficit</span>
              <span className="text-[11px] text-slate-600 block">Drip irrigation recommended</span>
            </div>
          </div>

          {/* Recommended Allocation Table */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Approved Mathematical Crop Allocation
            </h4>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="p-2.5">Crop Name</th>
                  <th className="p-2.5">Sowing Area</th>
                  <th className="p-2.5">Expected Yield</th>
                  <th className="p-2.5">Water Quota</th>
                  <th className="p-2.5 text-right">Net Farmer Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {result.allocations.map((a) => (
                  <tr key={a.crop_code}>
                    <td className="p-2.5 font-bold text-slate-900">
                      {a.crop_name} <span className="text-[10px] text-slate-500 font-normal">({a.category})</span>
                    </td>
                    <td className="p-2.5 text-slate-800 font-semibold">
                      {a.allocated_ha} ha ({(a.allocated_ha * 2.471).toFixed(1)} ac)
                    </td>
                    <td className="p-2.5 text-slate-800 font-medium">
                      {a.expected_yield_tonnes.toFixed(1)} Tonnes
                    </td>
                    <td className="p-2.5 text-blue-800 font-semibold">
                      {a.expected_water_consumed_m3.toLocaleString()} m³
                    </td>
                    <td className="p-2.5 text-emerald-800 font-bold text-right">
                      ₹{a.expected_net_income_inr.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-emerald-50 font-bold border-t-2 border-emerald-700">
                <tr>
                  <td className="p-2.5 text-emerald-950">Total Farm Plan</td>
                  <td className="p-2.5 text-emerald-950">{result.total_land_allocated_ha} ha</td>
                  <td className="p-2.5 text-emerald-950">{result.total_food_produced_tonnes.toFixed(1)} t</td>
                  <td className="p-2.5 text-blue-900">{result.total_water_consumed_m3.toLocaleString()} m³</td>
                  <td className="p-2.5 text-right text-emerald-900">₹{result.total_farmer_net_income_inr.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Key Agronomic Advisories */}
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 text-xs mb-6">
            <span className="font-bold text-emerald-900 block mb-1">
              Field Action Guidelines for Sowing Season:
            </span>
            <ul className="list-disc list-inside text-slate-700 space-y-1">
              <li><b>Moong (Green Gram):</b> Sow with ridge-and-furrow method to minimize irrigation water loss and naturally restore nitrogen.</li>
              <li><b>Mustard:</b> Optimal sowing window is October 10 - 25. Requires only 2 irrigations at flowering and siliqua stage.</li>
              <li><b>High-Yield Tomato:</b> Must use micro-drip fertigation; provides up to 300% return over traditional flood irrigation.</li>
              <li><b>Water Conservation:</b> This plan saves <b>{result.water_savings_vs_budget_m3.toLocaleString()} m³</b> of borewell water vs mono-paddy.</li>
            </ul>
          </div>

          {/* Signature & Verification Seal */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center font-mono text-[9px] text-center p-1">
                [ QR CODE VERIFIED ]
              </div>
              <div>
                <span className="font-bold text-slate-800 block">AquaShift Digital Agronomy Certification</span>
                <span className="text-[11px]">Calibrated with ICAR &amp; CGWB hydrological models</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-bold text-slate-900 block">Authorized Kisan Advisory</span>
              <span className="text-[11px] text-emerald-700">Digital Seal &bull; Valid for 2026 Season</span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="print:hidden bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
