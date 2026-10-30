import React from 'react';
import { Sprout } from 'lucide-react';

interface LandingHeroProps {
  onLaunchPlatform: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onLaunchPlatform
}) => {
  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center shadow-xs">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-5">
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span>Smart Crop Planning &bull; Save Water &bull; Higher Profit</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-slate-900 max-w-3xl leading-tight">
          Help Farmers Plan What to Grow: <br />
          <span className="text-emerald-700">
            Save Groundwater & Maximize Income
          </span>
        </h1>

        <p className="text-base text-slate-600 max-w-2xl mt-4 leading-relaxed font-normal">
          AquaShift connects satellite weather, local soil health, and government well telemetry to calculate the exact crop mix that earns the highest profit while preventing borewells from drying up.
        </p>

        {/* Clear Action Button */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-7">
          <button
            onClick={onLaunchPlatform}
            className="px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-sm flex items-center gap-2 shadow-md shadow-emerald-700/20 active:scale-95 transition cursor-pointer"
          >
            <span>Open Farm Crop Planner</span>
            <span className="hidden sm:inline w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};