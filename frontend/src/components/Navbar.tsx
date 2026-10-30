import React from 'react';
import { 
  Sprout, 
  MapPin, 
  Map, 
  LayoutDashboard, 
  AlertTriangle,
  Globe,
  Search,
  ChevronDown
} from 'lucide-react';
import { Language, Translations } from '../constants/translations';

export interface NavbarProps {
  currentView: 'dashboard' | 'map' | 'stress' | 'landing';
  setCurrentView: (view: 'dashboard' | 'map' | 'stress' | 'landing') => void;
  locationLabel: string;
  coordinates: [number, number];
  onOpenLocationSearch: () => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  t: Translations;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  locationLabel,
  coordinates,
  onOpenLocationSearch,
  language,
  onSelectLanguage,
  t
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md px-4 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Platform Identity */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md group-hover:from-emerald-400 group-hover:to-teal-500 transition-all">
            <Sprout className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-heading font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Aqua<span className="text-emerald-400">Shift</span>
              </span>
              <span className="text-[10px] font-extrabold tracking-wide px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-mono">
                Farmer Advisory
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium -mt-0.5 hidden sm:block">
              Smart Crop Planning &bull; Save Water &bull; Higher Profit
            </p>
          </div>
        </div>

        {/* Universal Farm Location Pill */}
        <button
          type="button"
          onClick={onOpenLocationSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500/50 text-left transition cursor-pointer shadow-xs group w-full md:w-auto max-w-md justify-between"
          title="Click to search location, paste Google Maps link, enter coordinates, or use GPS"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <MapPin className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
                  Farm Location &bull; GPS Active
                </span>
                <span className="text-[9px] text-emerald-300 font-bold bg-emerald-500/20 px-1 rounded">
                  Change
                </span>
              </div>
              <span className="text-xs font-bold text-slate-100 truncate mt-0.5 block group-hover:text-emerald-300">
                {locationLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 pl-2 text-slate-400 group-hover:text-emerald-400 shrink-0">
            <Search className="w-3.5 h-3.5" />
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Right Controls: Views & Languages */}
        <div className="flex items-center gap-2.5 shrink-0 justify-between w-full md:w-auto">
          
          {/* Navigation View Tabs */}
          <nav className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 gap-1 text-xs font-semibold">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                currentView === 'dashboard' 
                  ? 'bg-emerald-600 text-white shadow-xs font-bold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{t.cropPlanner}</span>
            </button>
            <button
              onClick={() => setCurrentView('map')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                currentView === 'map' 
                  ? 'bg-emerald-600 text-white shadow-xs font-bold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>{t.satelliteMap}</span>
            </button>
            <button
              onClick={() => setCurrentView('stress')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                currentView === 'stress' 
                  ? 'bg-amber-600 text-white shadow-xs font-bold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.droughtStressTest}</span>
            </button>
          </nav>

          {/* Language Switcher (EN | हिंदी | ਪੰਜਾਬੀ) */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs font-bold gap-0.5 shrink-0">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5 hidden lg:inline" />
            <button
              onClick={() => onSelectLanguage('en')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                language === 'en' 
                  ? 'bg-emerald-600 text-white font-extrabold shadow-2xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onSelectLanguage('hi')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                language === 'hi' 
                  ? 'bg-emerald-600 text-white font-extrabold shadow-2xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => onSelectLanguage('pa')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                language === 'pa' 
                  ? 'bg-emerald-600 text-white font-extrabold shadow-2xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ਪੰਜਾਬੀ
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
