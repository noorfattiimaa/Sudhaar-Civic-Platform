import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Plus, Loader2, FileText, Calendar, MapPin, 
  AlertCircle, CheckCircle2, Clock, TrendingUp,
  RefreshCw, Filter, Search, ChevronDown, Check,
  ShieldCheck, AlertOctagon // Added new icons for Verified/Critical
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ImageWithFallback } from "../../../components/ui/ImageWithFallback";
import { Issue } from "../types";
import IssueDetailModal from "../components/IssueDetailModal";
import ReportModal from "../components/ReportModal";
import { issuesService } from "../../../services/issues";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// --- FIXED STATUS CONFIGURATION (Matches Dashboard) ---
const statusConfig: Record<string, { color: string; icon: any }> = {
  "Critical": { 
    color: "bg-red-100 text-red-700 border-red-200", 
    icon: AlertOctagon
  },
  "Verified": { 
    color: "bg-teal-100 text-teal-700 border-teal-200", 
    icon: ShieldCheck
  },
  "In Progress": { 
    color: "bg-blue-100 text-blue-700 border-blue-200", 
    icon: TrendingUp
  },
  "Resolved": { 
    color: "bg-emerald-100 text-emerald-700 border-emerald-200", 
    icon: CheckCircle2
  },
  "Pending": { 
    color: "bg-amber-100 text-amber-700 border-amber-200", 
    icon: Clock
  },
  "Rejected": { 
    color: "bg-slate-100 text-slate-600 border-slate-200", 
    icon: AlertCircle
  }
};

export default function MyReports() {
  const [selectedReport, setSelectedReport] = useState<Issue | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reports, setReports] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Custom Dropdown State
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMyReports();
    
    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadMyReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await issuesService.getAll({ my_reports: true });
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const issuesData = response.data.results || (Array.isArray(response.data) ? response.data : []);
        setReports(issuesData);
      }
    } catch (err) {
      setError("Failed to load your reports. Check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIssueCreated = () => {
    loadMyReports();
  }; 

  const openReportModal = (report: Issue) => {
    setSelectedReport(report);
  };

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            report.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === "all" || report.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [reports, searchQuery, filterStatus]);

  // --- UPDATED STATS CALCULATION ---
  const stats = useMemo(() => {
    return {
      total: reports.length,
      verified: reports.filter(r => r.status === "Verified").length,
      inProgress: reports.filter(r => r.status === "In Progress").length,
      resolved: reports.filter(r => r.status === "Resolved").length,
    };
  }, [reports]);

  // --- UPDATED FILTER OPTIONS (Matches App Logic) ---
  const filterOptions = [
    { value: "all", label: "All Reports", color: "text-slate-600" },
    { value: "Pending", label: "Pending Approval", color: "text-amber-600" },
    { value: "Verified", label: "Verified Issues", color: "text-teal-600" }, // Added Verified
    { value: "In Progress", label: "In Progress", color: "text-blue-600" },
    { value: "Resolved", label: "Resolved", color: "text-emerald-600" },
    { value: "Critical", label: "Critical Priority", color: "text-red-600" } // Added Critical
  ];

  const currentFilterLabel = filterOptions.find(f => f.value === filterStatus)?.label || "Filter";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 font-sans pb-20 pt-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div className="animate-in fade-in slide-in-from-left duration-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">My Reports</h1>
            </div>
            <p className="text-slate-500 font-medium ml-1">Track and manage all your submitted issues</p>
          </div>
          <div className="flex gap-3 animate-in fade-in slide-in-from-right duration-500 w-full md:w-auto">
            <button 
              onClick={loadMyReports} 
              disabled={isLoading}
              className="flex-1 md:flex-none justify-center bg-white border-2 border-slate-200 text-slate-700 px-5 py-3.5 rounded-xl font-bold flex gap-2 items-center hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 shadow-sm disabled:opacity-50 group"
            >
              <RefreshCw size={18} className={cn("transition-transform group-hover:rotate-180", isLoading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button 
              onClick={() => setIsReportModalOpen(true)} 
              className="flex-1 md:flex-none justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3.5 rounded-xl font-bold flex gap-2 items-center transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/40 group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
              <span>New Report</span>
            </button>
          </div>
        </div>

        {/* Stats (Updated to reflect meaningful categories) */}
        {!isLoading && reports.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-200 transition-all duration-200 hover:shadow-lg group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total</span>
                <FileText className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-3xl font-black text-slate-900">{stats.total}</p>
            </div>
            
            {/* Verified (Replaces Pending) */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 p-5 rounded-2xl border-2 border-teal-200 hover:border-teal-300 transition-all duration-200 hover:shadow-lg group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">Verified</span>
                <ShieldCheck className="h-5 w-5 text-teal-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-black text-teal-900">{stats.verified}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-2xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Progress</span>
                <TrendingUp className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-black text-blue-900">{stats.inProgress}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-2xl border-2 border-emerald-200 hover:border-emerald-300 transition-all duration-200 hover:shadow-lg group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Resolved</span>
                <CheckCircle2 className="h-5 w-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-black text-emerald-900">{stats.resolved}</p>
            </div>
          </div>
        )}

        {/* --- CUSTOM SEARCH & FILTER BAR --- */}
        {!isLoading && reports.length > 0 && (
          <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 mb-8 flex flex-col md:flex-row gap-3 shadow-sm animate-in fade-in slide-in-from-bottom duration-700 z-30 relative">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>
            
            {/* Custom Dropdown */}
            <div className="relative min-w-[220px]" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 bg-slate-50 border-2 rounded-xl transition-all duration-200 font-bold text-sm",
                  isFilterOpen ? "border-blue-500 bg-white shadow-md ring-2 ring-blue-100" : "border-slate-100 hover:border-slate-300"
                )}
              >
                <div className="flex items-center gap-2">
                  <Filter className={cn("h-4 w-4", isFilterOpen ? "text-blue-600" : "text-slate-400")} />
                  <span className="text-slate-700">{currentFilterLabel}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", isFilterOpen && "rotate-180 text-blue-600")} />
              </button>

              {/* Dropdown Menu */}
              {isFilterOpen && (
                <div className="absolute top-full right-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-1">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterStatus(option.value);
                          setIsFilterOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition-colors mb-0.5 last:mb-0",
                          filterStatus === option.value 
                            ? "bg-slate-100 text-slate-900" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <span className={option.color}>{option.label}</span>
                        {filterStatus === option.value && <Check className="h-4 w-4 text-slate-900" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100/50 border-2 border-red-200 text-red-700 px-4 py-4 rounded-xl text-sm font-medium mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top duration-300 shadow-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800">Error Loading Reports</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}
        
        {/* Loading */}
        {isLoading ? (
          <div className="min-h-[500px] flex flex-col items-center justify-center text-slate-400 animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
              <div className="absolute inset-0 h-16 w-16 animate-ping text-blue-600 opacity-20">
                <Loader2 className="h-16 w-16" />
              </div>
            </div>
            <p className="font-bold text-lg mt-6 animate-pulse text-slate-600">Loading your reports...</p>
            <p className="text-sm text-slate-400 mt-2">Connecting to secure server</p>
          </div>
        ) : filteredReports.length === 0 ? (
          // Empty State
          <div className="min-h-[500px] flex flex-col items-center justify-center text-slate-400 animate-in fade-in zoom-in duration-500 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
            <div className="bg-slate-100 p-8 rounded-full mb-6">
              <FileText className="h-16 w-16 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">
              {searchQuery || filterStatus !== "all" ? "No reports found" : "No reports yet"}
            </h2>
            <p className="font-medium text-slate-500 mb-8 text-center max-w-md">
              {searchQuery || filterStatus !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "You haven't reported any issues yet. Be the first to make a change."}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <button 
                onClick={() => setIsReportModalOpen(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all duration-200 flex items-center gap-2 group"
              >
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                Report Your First Issue
              </button>
            )}
          </div>
        ) : (
          // Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report, index) => {
              // Safety fallback
              const config = statusConfig[report.status] || statusConfig.Pending;
              const StatusIcon = config.icon;
              
              return (
                <div 
                  key={report.id} 
                  onClick={() => openReportModal(report)} 
                  className="bg-white rounded-3xl border-2 border-slate-200 cursor-pointer hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden group animate-in fade-in slide-in-from-bottom flex flex-col h-full"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="h-48 bg-slate-100 overflow-hidden relative shrink-0">
                    <ImageWithFallback 
                      src={report.image || (report as any).image_url_full || ''} 
                      alt={report.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    
                    <div className={cn(
                      "absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-sm flex items-center gap-1.5 uppercase tracking-wide",
                      config.color,
                      "bg-white/90"
                    )}>
                      <StatusIcon className="h-3 w-3" />
                      {report.status}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-xl text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                      {report.title}
                    </h3>
                    
                    <div className="space-y-3 mb-4 flex-1">
                      <div className="flex items-start gap-2 text-sm text-slate-500">
                        <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1 font-medium">{report.location}</span>
                      </div>
                      
                      {(report as any).created_at && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">
                            {new Date((report as any).created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-auto">
                      <span className="text-sm font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                        View Details
                        <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Count */}
        {!isLoading && filteredReports.length > 0 && (
          <div className="mt-12 text-center pb-12">
            <span className="inline-block px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-500 animate-in fade-in duration-700">
              Showing {filteredReports.length} of {reports.length} report{reports.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <IssueDetailModal issue={selectedReport} onClose={() => setSelectedReport(null)} />
      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} onSuccess={handleIssueCreated} />
    </div>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}