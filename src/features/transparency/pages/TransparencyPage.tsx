import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom"; 
import { 
  ShieldCheck, AlertCircle, CheckCircle, Activity, 
  TrendingUp, Wrench, 
  Search, Calendar, Check, ArrowRight,
  LucideIcon, Building2, Landmark, XCircle
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- IMPORTS ---
import { ImageWithFallback } from "../../../components/ui/ImageWithFallback";
import TransparencyDetailModal from "../components/TransparencyDetailModal";
import { Issue } from "../../issues/types";
import { issuesService } from "../../../services/issues";
import { campaignsService } from "../../../services/campaigns";
import { apiService } from "../../../services/api";
import { API_ENDPOINTS } from "../../../config/api";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// FIX: Helper to safely parse numbers that might contain commas or currency symbols
const safeParse = (val: string | number | undefined | null): number => {
  if (val === undefined || val === null) return 0;
  // Convert to string, remove all commas, then parse
  const cleanStr = String(val).replace(/,/g, '').replace(/[^0-9.-]+/g, ''); 
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
};

// --- TYPES ---
interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  color: "blue" | "emerald" | "amber" | "slate";
  delay?: number;
  isLoading?: boolean;
}

interface ResolvedCardProps {
  issue: Issue;
  onDetails: () => void;
}

interface TimelineEventProps {
  title: string;
  resolver: string;
  date: string;
  align: "left" | "right";
  icon: LucideIcon;
}

interface Campaign {
  id: string | number;
  title: string;
  // Flexible types to handle raw API strings or numbers
  raised_amount?: string | number;
  current_amount?: string | number;
  goal_amount?: string | number;
  target_amount?: string | number;
}

interface StatsData {
  totalReported: number;
  issuesResolved: number;
  resolutionRate: number;
  activeIssues: number;
}

interface FinancialData {
  totalDonated: number;
  fundsUtilized: number;
  availableBalance: number;
}

// API Response Types
interface StatsAPIResponse {
  total_reported?: number;
  issues_resolved?: number;
  resolution_rate?: number;
  active_issues?: number;
}

interface FinancialAPIResponse {
  total_funds_donated?: number;
  funds_utilized?: number;
  available_balance?: number;
}

// --- SUB-COMPONENTS ---

// 1. STAT CARD
const StatCard = ({ icon: Icon, title, value, color, delay = 0, isLoading = false }: StatCardProps) => {
  const colorClasses = {
    blue: { border: "border-blue-600", icon: "text-blue-600", text: "text-blue-700" },
    emerald: { border: "border-emerald-500", icon: "text-emerald-600", text: "text-emerald-700" },
    amber: { border: "border-amber-500", icon: "text-amber-600", text: "text-amber-700" },
    slate: { border: "border-slate-500", icon: "text-slate-600", text: "text-slate-700" }
  };

  const colors = colorClasses[color];

  return (
    <div 
      className={cn(
        "bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-[6px] animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards",
        colors.border
      )}
      style={{ animationDelay: `${delay}ms` }}
      role="article"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("p-2 rounded-lg bg-slate-50", colors.icon)} aria-hidden="true">
          <Icon size={24} />
        </div>
        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{title}</h3>
      </div>
      {isLoading ? (
        <div className="h-10 bg-slate-200 rounded animate-pulse" />
      ) : (
        <p className={cn("text-4xl font-black", colors.text)}>{value}</p>
      )}
    </div>
  );
};

// 2. RESOLVED PROJECT CARD
const ResolvedCard = ({ issue, onDetails }: ResolvedCardProps) => (
  <article className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full">
    <div className="h-48 overflow-hidden relative bg-slate-100">
      <ImageWithFallback 
        src={issue.image || issue.image_url_full || issue.image_url || ""} 
        alt={`${issue.title} - resolved issue`} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
      />
      <div 
        className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-10"
        role="status"
        aria-label="Issue resolved"
      >
        <CheckCircle size={12} aria-hidden="true" /> Resolved
      </div>
    </div>
    <div className="p-6 flex flex-col flex-1">
      <h4 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
        {issue.title}
      </h4>
      <p className="text-sm text-slate-500 mb-1">
        <span className="font-semibold text-slate-700">Category:</span> {issue.category}
      </p>
      <p className="text-sm text-slate-500 mb-4">
        <span className="font-semibold text-slate-700">By:</span> {issue.author || issue.author_name || "Unknown"}
      </p>
      
      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
        <time className="text-xs font-bold text-emerald-600">
          {issue.timeText || issue.time_text || "Recently"}
        </time>
        <button 
          onClick={onDetails}
          className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`View details for ${issue.title}`}
        >
          <Search size={14} aria-hidden="true" /> Details
        </button>
      </div>
    </div>
  </article>
);

// 3. PROGRESS BAR ITEM
const ProjectFundingItem = ({ title, raised, goal }: { title: string; raised: number; goal: number }) => {
  const percentage = useMemo(() => {
    // Standard percentage calc: (raised / goal) * 100
    // Math.min is removed here to allow seeing if something is overfunded (e.g. 110%)
    // But for the bar width, we clamp it to 100% in the style prop below.
    return goal > 0 ? (raised / goal) * 100 : 0;
  }, [raised, goal]);
  
  const progressPercentage = Number.isFinite(percentage) ? Math.round(percentage) : 0;
  // Clamp for the visual bar width only, but display true % text
  const barWidth = Math.min(100, progressPercentage);

  return (
    <div 
      className="bg-slate-50 p-5 rounded-2xl flex flex-col"
      role="progressbar" 
      aria-valuenow={progressPercentage} 
      aria-valuemin={0} 
      aria-valuemax={100} 
    >
      <h4 className="font-bold text-slate-900 mb-2">{title}</h4>
      <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            progressPercentage >= 100 ? "bg-emerald-500" : "bg-blue-600"
          )}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-slate-500 font-medium">
          <span>{progressPercentage}% Funded</span>
          {/* Format goal with commas for display */}
          <span>Goal: {goal.toLocaleString()}</span>
      </div>
    </div>
  );
};

// 4. TIMELINE EVENT
const TimelineEvent = ({ title, resolver, date, align, icon: Icon }: TimelineEventProps) => (
  <div 
    className={cn(
      "relative w-full md:w-1/2 p-4",
      align === "left" ? "md:pr-12 md:text-right md:left-0" : "md:pl-12 md:text-left md:left-1/2"
    )}
  >
    <div 
      className={cn(
        "hidden md:flex absolute top-6 w-10 h-10 bg-blue-600 rounded-full items-center justify-center text-white shadow-lg z-10 border-4 border-white",
        align === "left" ? "-right-5" : "-left-5"
      )}
      aria-hidden="true"
    >
      <Icon size={16} />
    </div>
    <article 
      className={cn(
        "bg-white p-6 rounded-2xl shadow-sm border-t-4 border-blue-600 hover:shadow-md transition-shadow",
        align === "left" ? "md:mr-auto" : "md:ml-auto"
      )}
    >
      <h4 className="font-bold text-slate-900 text-lg mb-1">{title}</h4>
      <p className="text-sm text-slate-500 font-medium mb-2">{resolver}</p>
      <time className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
        {date}
      </time>
    </article>
  </div>
);

// Loading Skeletons
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-pulse">
        <div className="h-8 bg-slate-200 rounded mb-4" />
        <div className="h-12 bg-slate-200 rounded" />
      </div>
    ))}
  </div>
);

const CardsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse">
        <div className="h-48 bg-slate-200" />
        <div className="p-6">
          <div className="h-6 bg-slate-200 rounded mb-2" />
          <div className="h-4 bg-slate-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// Error Alert Component
const ErrorAlert = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-3">
    <XCircle size={20} className="flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p>{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-2 text-xs font-bold text-red-800 underline hover:no-underline focus:outline-none"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---

export default function TransparencyPage() {
  const navigate = useNavigate();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data State
  const [stats, setStats] = useState<StatsData>({
    totalReported: 0,
    issuesResolved: 0,
    resolutionRate: 0,
    activeIssues: 0
  });
  const [resolvedIssues, setResolvedIssues] = useState<Issue[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalDonated: 0,
    fundsUtilized: 0,
    availableBalance: 0
  });
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);

  const calculateTimeText = useCallback((createdAt: string): string => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    return diffDays > 0 ? `${diffDays} day${diffDays > 1 ? 's' : ''} ago` : "Recently";
  }, []);

  // --- OPTIMIZED LOADING LOGIC (Parallel Requests) ---
  const loadTransparencyData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Execute all independent requests in parallel
      const [statsRes, resolvedRes, financialRes, campaignsRes] = await Promise.allSettled([
        issuesService.getStats(),
        issuesService.getAll({ resolved_only: true, ordering: "-created_at" }),
        apiService.get(API_ENDPOINTS.TRANSPARENCY_SUMMARY),
        campaignsService.getAll({ is_active: true, is_verified: true })
      ]);

      // 1. Handle Stats
      if (statsRes.status === "fulfilled" && statsRes.value.data) {
        const s = statsRes.value.data as StatsAPIResponse;
        setStats({
          totalReported: s.total_reported || 0,
          issuesResolved: s.issues_resolved || 0,
          resolutionRate: s.resolution_rate || 0,
          activeIssues: s.active_issues || 0
        });
      }

      // 2. Handle Resolved Issues
      if (resolvedRes.status === "fulfilled" && resolvedRes.value.data) {
        let issuesData = resolvedRes.value.data.results || resolvedRes.value.data;
        if (!Array.isArray(issuesData)) issuesData = [issuesData];
        
        const mappedIssues: Issue[] = issuesData.map((issue: any) => ({
           id: issue.id,
           title: issue.title,
           desc: issue.description || issue.desc || "",
           location: issue.location,
           category: issue.category,
           status: issue.status,
           priority: issue.priority,
           timeText: issue.time_text || calculateTimeText(issue.created_at),
           author: issue.author_name || issue.author_email || "Unknown",
           image: issue.image_url_full || issue.image_url || "",
           upvotes: issue.upvotes || 0,
           timeline: issue.timeline || []
        }));
        setResolvedIssues(mappedIssues);
      }

      // 3. Handle Financial Data
      if (financialRes.status === "fulfilled" && financialRes.value.data) {
        const f = financialRes.value.data as FinancialAPIResponse;
        setFinancialData({
          totalDonated: f.total_funds_donated || 0,
          fundsUtilized: f.funds_utilized || 0,
          availableBalance: f.available_balance || 0
        });
      } else {
        console.warn("Financial data unavailable");
      }

      // 4. Handle Campaigns
      if (campaignsRes.status === "fulfilled" && campaignsRes.value.data) {
        let cData = campaignsRes.value.data.results || campaignsRes.value.data;
        if (!Array.isArray(cData)) cData = [cData];
        setActiveCampaigns(cData.slice(0, 4));
      }

    } catch (err) {
      console.error("Critical error in transparency load:", err);
      setError("Some data could not be loaded. Please try refreshing.");
    } finally {
      setIsLoading(false);
    }
  }, [calculateTimeText]);

  useEffect(() => {
    loadTransparencyData();
  }, [loadTransparencyData]);

  const featuredResolved = useMemo(() => resolvedIssues.slice(0, 4), [resolvedIssues]);

  const timelineEvents = useMemo(() => {
    return resolvedIssues
      .filter(issue => issue.status === "Resolved")
      .slice(0, 3)
      .map((issue, index) => {
        const resolvedDate = (issue as any).resolved_at || (issue as any).created_at;
        const date = resolvedDate ? new Date(resolvedDate).toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric' 
        }) : "Recently";
        
        return {
          title: issue.title,
          resolver: issue.author || "City Council",
          date: date,
          align: (index % 2 === 0 ? "left" : "right") as "left" | "right",
          icon: index === 0 ? Wrench : index === 1 ? Calendar : Check
        };
      });
  }, [resolvedIssues]);

  const handleOpenDetails = useCallback((issue: Issue) => {
    setSelectedIssue(issue);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedIssue(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-20">
      
      {/* HERO */}
      <header className="bg-slate-900 pt-12 pb-24 px-6 text-center relative overflow-hidden rounded-b-[3rem] shadow-2xl mb-12">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" aria-hidden="true" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/50 border border-blue-700/50 text-blue-200 text-xs font-bold mb-6 backdrop-blur-md">
            <ShieldCheck size={14} aria-hidden="true" /> Official Public Ledger
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Sudhaar <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Transparency</span> Dashboard
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Empowering the community through verifiable data. Every rupee donated and every issue resolved is tracked here in real-time.
          </p>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 mb-4">
          <ErrorAlert message={error} onRetry={loadTransparencyData} />
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 -mt-16 relative z-20">

        {/* 1. KEY STATS */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">Key Statistics</h2>
          {isLoading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={AlertCircle} title="Total Reported" value={stats.totalReported.toLocaleString()} color="slate" delay={0} />
              <StatCard icon={CheckCircle} title="Issues Resolved" value={stats.issuesResolved.toLocaleString()} color="emerald" delay={100} />
              <StatCard icon={Activity} title="Resolution Rate" value={`${stats.resolutionRate}%`} color="blue" delay={200} />
              <StatCard icon={TrendingUp} title="Active Issues" value={stats.activeIssues.toLocaleString()} color="amber" delay={300} />
            </div>
          )}
        </section>

        {/* 2. PROOF OF RESOLUTION GALLERY */}
        <section aria-labelledby="resolved-heading">
          <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
            <div>
              <h2 id="resolved-heading" className="text-3xl font-black text-slate-900">Proof of Resolution</h2>
              <p className="text-slate-500 mt-2">Visual evidence of completed civic works.</p>
            </div>
            <button 
              onClick={() => navigate('/archive')}
              className="flex items-center gap-2 text-blue-600 font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            >
              View All Archive <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
          {isLoading ? (
            <CardsSkeleton />
          ) : featuredResolved.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredResolved.map((issue) => (
                <ResolvedCard 
                  key={issue.id}
                  issue={issue}
                  onDetails={() => handleOpenDetails(issue)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p>No resolved issues to display yet.</p>
            </div>
          )}
        </section>

        {/* TRUST & VERIFICATION BANNER */}
        <section className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 md:p-12 text-center text-white" aria-labelledby="verification-heading">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/30 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-600/30 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2" aria-hidden="true" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-md shadow-lg">
              <Building2 size={14} aria-hidden="true" /> Authorized Partners
            </div>
            
            <h2 id="verification-heading" className="text-3xl md:text-4xl font-black mb-6 leading-tight">
              Verified NGOs & Municipal Departments
            </h2>
            
            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              The financial data displayed below reflects funds managed directly by our 
              <span className="text-white font-bold mx-1">Registered NGOs</span> and 
              <span className="text-white font-bold mx-1">Municipal Departments</span>. 
              Rest assured, 100% of your donations are securely routed to the specific campaigns run by these organizations.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold text-slate-400">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                <Landmark size={16} className="text-emerald-400" aria-hidden="true" /> Government Audited
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                <ShieldCheck size={16} className="text-blue-400" aria-hidden="true" /> Secure Routing
              </div>
            </div>
          </div>
        </section>

        {/* 3. FINANCE & FUNDING */}
        <section aria-labelledby="finance-heading">
          <h2 id="finance-heading" className="sr-only">Financial Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Active Projects List */}
            <div className="lg:col-span-3 bg-white rounded-3xl border-slate-100 shadow-lg p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Activity className="text-blue-600" aria-hidden="true" /> Active Project Funding
              </h3>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-slate-50 p-5 rounded-2xl animate-pulse">
                      <div className="h-4 bg-slate-200 rounded mb-2" />
                      <div className="h-2 bg-slate-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : activeCampaigns.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none">
                  {activeCampaigns.map((campaign) => (
                    <ProjectFundingItem 
                      key={campaign.id}
                      title={campaign.title} 
                      raised={safeParse(campaign.raised_amount || campaign.current_amount)} 
                      goal={safeParse(campaign.goal_amount || campaign.target_amount)} 
                    />
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p>No active campaigns at the moment.</p>
                </div>
              )}
              <p className="text-center text-xs text-slate-400 mt-8 flex items-center justify-center gap-1 border-t border-slate-100 pt-6">
                <ShieldCheck size={12} aria-hidden="true" /> All financial data is verified and audited regularly.
              </p>
            </div>
          </div>
        </section>

        {/* 4. TIMELINE */}
        <section className="pb-12" aria-labelledby="timeline-heading">
          <div className="text-center mb-12">
            <h2 id="timeline-heading" className="text-3xl font-black text-slate-900">Recent Milestones</h2>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -ml-[1px]" aria-hidden="true" />
            {isLoading ? (
              <div className="space-y-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm animate-pulse">
                    <div className="h-6 bg-slate-200 rounded mb-2" />
                    <div className="h-4 bg-slate-200 rounded mb-2" />
                    <div className="h-4 bg-slate-200 rounded w-24" />
                  </div>
                ))}
              </div>
            ) : timelineEvents.length > 0 ? (
              <div className="space-y-8">
                {timelineEvents.map((event, index) => (
                  <TimelineEvent 
                    key={index}
                    align={event.align}
                    title={event.title}
                    resolver={event.resolver}
                    date={event.date}
                    icon={event.icon}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p>No recent milestones to display.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* MODAL */}
      <TransparencyDetailModal issue={selectedIssue} onClose={handleCloseModal} />
    </div>
  );
}