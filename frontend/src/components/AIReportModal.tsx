import React from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  AlertCircle
} from 'lucide-react';
import { AIExplanationResponse } from '../types';

interface AIReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: AIExplanationResponse | null;
  isLoading: boolean;
}

export const AIReportModal: React.FC<AIReportModalProps> = ({
  isOpen,
  onClose,
  reportData,
  isLoading
}) => {
  if (!isOpen) return null;

  const handleDownloadMarkdown = () => {
    if (!reportData) return;
    const blob = new Blob([reportData.full_markdown_report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AquaShift_Farmer_Advisory_Report_${reportData.scenario_name.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-heading font-extrabold text-slate-900">
                Official Farmer Advisory &amp; Crop Planning Report
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Comprehensive seasonal crop recommendations, water budgets &amp; market price audit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMarkdown}
              disabled={!reportData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-300 shadow-2xs transition cursor-pointer disabled:opacity-40"
              title="Download text report"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export .MD</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={!reportData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-xs font-semibold text-white shadow-2xs transition cursor-pointer disabled:opacity-40"
              title="Print or save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-200" />
              <span>Print PDF Report</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-800">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Generating plain-language agronomic recommendations...</p>
            </div>
          ) : reportData ? (
            <>
              {/* Executive Summary */}
              <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block mb-2">
                  1. Executive Summary &amp; Key Recommendations
                </span>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {reportData.executive_summary}
                </p>
              </div>

              {/* Crop Allocation Rationale */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block mb-3">
                  2. Crop-by-Crop Planting Guide &amp; Rationale
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reportData.crop_allocation_rationale.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 text-sm">{item.crop}</span>
                        <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                          {item.allocated_area}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Water & Aquifer Sustainability */}
              <div className="bg-blue-50/70 p-4.5 rounded-xl border border-blue-200">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" /> 3. Borewell &amp; Groundwater Protection Strategy
                </span>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {reportData.water_sustainability_assessment}
                </p>
              </div>

              {/* Financial Impact & Market Risks */}
              <div className="bg-emerald-50/70 p-4.5 rounded-xl border border-emerald-200">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block mb-2">
                  4. Farmer Profitability &amp; Mandi Price Risk Assessment
                </span>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {reportData.financial_impact_and_risks}
                </p>
              </div>

              {/* Bottleneck Guidance */}
              <div className="bg-amber-50 p-4.5 rounded-xl border border-amber-200">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" /> 5. Water Constraints &amp; Government Scheme Advisory
                </span>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {reportData.constraint_bottlenecks_and_recommendations}
                </p>
              </div>
            </>
          ) : (
            <p className="text-slate-500 text-center py-10">No report generated yet.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            AquaShift &bull; Grounded in ICAR guidelines &amp; CGWB telemetry
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-xs font-bold text-white transition cursor-pointer"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};
