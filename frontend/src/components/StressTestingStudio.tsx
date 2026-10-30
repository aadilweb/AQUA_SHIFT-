import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  AlertTriangle, 
  ArrowRight,
  Sliders
} from 'lucide-react';
import { StressTestResponse, StressTestScenarioResult } from '../types';

interface StressTestingStudioProps {
  stressData: StressTestResponse;
  onSelectScenario: (scenario: StressTestScenarioResult) => void;
}

export const StressTestingStudio: React.FC<StressTestingStudioProps> = ({
  stressData,
  onSelectScenario
}) => {
  const allScenarios = [stressData.baseline, ...stressData.scenarios];
  const [selectedId, setSelectedId] = useState<string>(allScenarios[0]?.scenario_id || 'baseline');

  const activeScenario = allScenarios.find(s => s.scenario_id === selectedId) || allScenarios[0];

  // Format data for comparative chart
  const comparisonData = allScenarios.map((s) => ({
    name: s.scenario_name.split(':')[0].replace(/^[A-G]\.\s*/, ''),
    waterConsumedK: Math.round(s.water_consumed_m3 / 1000),
    incomeLakhs: Number((s.net_income_inr / 100000).toFixed(1)),
    foodTonnes: Math.round(s.food_produced_tonnes)
  }));

  return (
    <div className="farm-card p-6 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center border border-blue-200">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base font-heading font-extrabold text-slate-900">
              Drought &amp; Price Shock Stress-Testing
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Simulates how your farm will perform under 7 real-world drought conditions and market price drops.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 self-start sm:self-auto">
          7 Scenarios Simulated
        </span>
      </div>

      {/* Comparative Multi-Bar Chart */}
      <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Comparison: Water Consumed (k m³) vs Net Income (₹ Lakhs)
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Simulated by AquaShift Engine
          </span>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderColor: '#cbd5e1', 
                  borderRadius: '8px', 
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="waterConsumedK" name="Water Consumed (Thousand m³)" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="incomeLakhs" name="Net Profit (₹ Lakhs)" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="foodTonnes" name="Grain Harvest (Tonnes)" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scenario Selector & Deep-Dive Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Scenario List (Left) */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Click to Inspect a Specific Scenario
          </span>

          {allScenarios.map((s) => {
            const isSelected = s.scenario_id === selectedId;
            return (
              <button
                key={s.scenario_id}
                onClick={() => setSelectedId(s.scenario_id)}
                className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-400 shadow-xs ring-1 ring-emerald-300'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{s.scenario_name}</span>
                    {s.diagnosis.has_conflict && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-300">
                        Severe Water Limit
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{s.description}</p>
                </div>
                <ArrowRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-700 font-bold' : 'text-slate-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Selected Scenario Detailed Allocation Inspection (Right) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3.5">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {activeScenario.scenario_name}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">{activeScenario.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                  activeScenario.diagnosis.has_conflict
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {activeScenario.diagnosis.has_conflict ? 'Water-Saving Mode' : 'Normal Feasible'}
                </span>

                <button
                  onClick={() => onSelectScenario(activeScenario)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Apply these water & income targets to the live farm planner"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Apply Targets</span>
                </button>
              </div>
            </div>

            {/* Metrics summary */}
            <div className="grid grid-cols-3 gap-2.5 text-xs mb-3.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Water Consumed</span>
                <span className="font-extrabold text-blue-700 text-sm mt-0.5 block">{activeScenario.water_consumed_m3.toLocaleString()} m³</span>
                <span className="text-[10px] text-slate-400 block">budget: {activeScenario.water_budget_m3.toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Food Grain</span>
                <span className="font-extrabold text-amber-700 text-sm mt-0.5 block">{activeScenario.food_produced_tonnes.toFixed(1)} t</span>
                <span className="text-[10px] text-slate-400 block">target: {activeScenario.food_target_tonnes} t</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Net Farmer Profit</span>
                <span className="font-extrabold text-emerald-700 text-sm mt-0.5 block">₹{activeScenario.net_income_inr.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block">target: ₹{activeScenario.income_target_inr.toLocaleString()}</span>
              </div>
            </div>

            {/* Resulting Crop Mix */}
            <span className="text-xs font-bold text-slate-700 uppercase block mb-2">
              Recommended Crop Shift Under This Stress
            </span>
            <div className="space-y-1.5">
              {activeScenario.allocations.map((a) => (
                <div key={a.crop_code} className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900">{a.crop_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-700 font-semibold">{a.allocated_ha} ha ({(a.allocated_ha * 2.471).toFixed(1)} ac)</span>
                    <span className="text-blue-700 font-semibold">{(a.expected_water_consumed_m3 / 1000).toFixed(1)}k m³</span>
                    <span className="text-emerald-700 font-bold">₹{(a.expected_net_income_inr / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conflict diagnosis alert */}
          {activeScenario.diagnosis.has_conflict && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <span className="font-bold block mb-0.5">Why This Allocation Was Chosen:</span>
              <span>{activeScenario.diagnosis.explanation}</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
