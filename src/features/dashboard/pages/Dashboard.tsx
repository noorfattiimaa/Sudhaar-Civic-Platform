import { useState, useEffect, useCallback, useMemo } from "react";
import { Camera, Loader2, ChevronDown, TrendingUp, Clock, Filter, Users, Heart, Zap, Award, CheckCircle, Target, Sparkles, Activity } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- PROJECT IMPORTS ---
import ReportModal from "../../issues/components/ReportModal";
import { IssueCard } from "../../issues/components/IssueCard";
import IssueDetailModal from "../../issues/components/IssueDetailModal";
import { Issue } from "../../issues/types";
import { issuesService } from "../../../services/issues";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState("Trending");
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  
  // FIX: Store ID instead of the whole object to prevent stale data
  const [selectedIssueId, setSelectedIssueId] = useState<number | string | null>(null);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Motivational quotes
  const motivationalQuotes = [
    { text: "Every report makes Narowal better", icon: Heart, gradient: "from-pink-500 to-rose-500" },
    { text: "Your voice drives real change", icon: Sparkles, gradient: "from-blue-500 to-cyan-500" },
    { text: "Together, we build transparency", icon: Users, gradient: "from-purple-500 to-indigo-500" },
    { text: "Small actions, big impact", icon: Zap, gradient: "from-yellow-500 to-orange-500" }
  ];

  // Logic: Reset view count when filter changes
  useEffect(() => {
    setVisibleCount(6);
    loadIssues();
  }, [activeFilter]);

  // Logic: Quote Rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Logic: Data Fetching
  const loadIssues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ordering = activeFilter === "Newest" ? "-created_at" : "-upvotes";
      const response = await issuesService.getAll({
        ordering,
        exclude_resolved: true
      });

      if (response.data) {
        let issuesData: any[] = [];
        if ('results' in response.data && Array.isArray(response.data.results)) {
          issuesData = response.data.results;
        } else if (Array.isArray(response.data)) {
          issuesData = response.data;
        } else {
          issuesData = [response.data];
        }

        const mappedIssues = issuesData.map((issue: any) => {
          // Time Text Calculation
          let timeText = issue.time_text || issue.timeText;
          if (!timeText && issue.created_at) {
            const created = new Date(issue.created_at);
            const now = new Date();
            const diffMs = now.getTime() - created.getTime();
            const diffDays = Math.floor(diffMs / 86400000);
            if (diffDays > 0) timeText = `${diffDays}d ago`;
            else timeText = "Today";
          }

          // FIX: Handle both 'votes' and 'upvotes'
          const voteCount = issue.upvotes || issue.votes || 0;

          return {
            id: issue.id,
            title: issue.title,
            desc: issue.description || issue.desc || "",
            location: issue.location,
            category: issue.category,
            status: issue.status,
            priority: issue.priority,
            timeText: timeText || "Recently",
            author: issue.author_name || issue.author_email || issue.author || "Unknown",
            image: issue.image_url_full || issue.image_url || "",
            
            // CRITICAL FIX: Persist Red Heart
            user_has_upvoted: issue.user_has_upvoted || false,
            upvotes: voteCount,
            votes: voteCount,
            
            timeline: issue.timeline || [],
            created_at: issue.created_at
          };
        });
        setIssues(mappedIssues);
      }
    } catch (err) {
      setError("Sync failed. Check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const visibleIssues = issues.slice(0, visibleCount);

  // --- CRITICAL SYNC FIX START ---
  
  // 1. Instant Local Update Handler (Passed to IssueCard)
  const handleLocalUpdate = useCallback((id: number | string, newVotes: number, newHasUpvoted: boolean) => {
    setIssues(prevIssues => 
      prevIssues.map(issue => 
        issue.id === id 
          ? { ...issue, upvotes: newVotes, votes: newVotes, user_has_upvoted: newHasUpvoted } 
          : issue
      )
    );
  }, []);

  // 2. Live Issue Lookup (Ensures Modal gets latest data)
  const liveSelectedIssue = useMemo(() => {
    return issues.find(i => i.id === selectedIssueId) || null;
  }, [issues, selectedIssueId]);

  // --- CRITICAL SYNC FIX END ---

  // Sync Handler
  const handleIssueCreated = () => {
    loadIssues();
  };

  const handleDetailClose = () => {
    setSelectedIssueId(null);
    loadIssues(); 
  };

  // REMOVED "Near Me" from filter icons
  const filterIcons = {
    "Trending": TrendingUp,
    "Newest": Clock
  };

  const totalIssues = issues.length;
  const avgUpvotes = issues.length > 0 ? Math.round(issues.reduce((acc, i) => acc + (i.upvotes || 0), 0) / issues.length) : 0;
  
  const currentQuote = motivationalQuotes[currentQuoteIndex];
  const QuoteIcon = currentQuote.icon;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">

      {/* --- COMPACT HERO SECTION --- */}
      <div className="relative bg-[#0B1121] pt-12 pb-16 px-4 overflow-hidden rounded-b-[2.5rem] shadow-2xl z-0">
        
        {/* Spotlight Effect */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-slate-900/0 to-transparent blur-3xl pointer-events-none translate-x-1/4 -translate-y-1/4" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-soft-light"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
            
            {/* LEFT: Typography */}
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-300 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Live System Active
              </div>

              <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-[1]">
                Sudhaar <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  Narowal.
                </span>
              </h1>
              <p className="text-slate-400 text-base lg:text-lg font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                The official civic engagement portal. Report issues, track municipal progress, and build a better district together.
              </p>
            </div>

            {/* RIGHT: Control Panel (Compact) */}
            <div className="w-full max-w-sm">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Action Button */}
                <button 
                  onClick={() => setIsReportModalOpen(true)}
                  className="relative w-full bg-white hover:bg-blue-50 text-slate-900 py-3.5 rounded-xl font-black text-base shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 mb-5"
                >
                  <Camera className="text-blue-600" size={20} />
                  Report New Issue
                </button>

                {/* Live Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 text-center">
                    <Activity className="text-emerald-400 mx-auto mb-1.5" size={18} />
                    <div className="text-xl font-black text-white">{totalIssues}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Cases</div>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 text-center">
                    <Users className="text-blue-400 mx-auto mb-1.5" size={18} />
                    <div className="text-xl font-black text-white">{avgUpvotes}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Avg Votes</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">

        {/* Quote Banner */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/40">
           <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${currentQuote.gradient}`} />
           <div className="p-5 flex items-center gap-5">
              <div className="p-3 bg-slate-50 rounded-xl">
                 <QuoteIcon className="text-slate-700" size={24} />
              </div>
              <div>
                 <p className="text-lg font-bold text-slate-800">"{currentQuote.text}"</p>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Community Update</p>
              </div>
           </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
           <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
             {["Trending", "Newest"].map(filter => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300",
                      isActive ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    {filter}
                  </button>
                )
             })}
           </div>
           
           <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <Filter size={14} /> Showing {issues.length} Reports
           </div>
        </div>

        {/* Grid Content */}
        {isLoading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-400 py-12">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <p className="font-bold text-slate-600">Syncing Data...</p>
          </div>
        ) : visibleIssues.length === 0 ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12">
            <Camera className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-xl font-black text-slate-800">No Reports Yet</h3>
            <p className="text-slate-500 mt-2 mb-6">Be the first to report an issue in this category.</p>
            <button onClick={() => setIsReportModalOpen(true)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Report Now</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleIssues.map((issue, index) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onClick={() => setSelectedIssueId(issue.id)} // Store ID only
                priority={index < 4}
                onVoteChange={handleLocalUpdate} // Pass the instant update handler
              />
            ))}
          </div>
        )}

        {/* Impact Card */}
        {visibleIssues.length >= 6 && (
          <div className="mb-8 mt-4 animate-fade-in-stagger">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-2xl">
                   <Award className="text-white" size={40} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-black text-white mb-2">Community Impact</h3>
                  <p className="text-slate-300 mb-4">Your reports are directly contributing to a cleaner Narowal.</p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                       <CheckCircle className="text-green-400" size={16} />
                       <span className="text-sm font-bold text-white">Action Taken</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                       <Target className="text-yellow-400" size={16} />
                       <span className="text-sm font-bold text-white">Verified</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsReportModalOpen(true)} className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 shadow-xl">
                  Join the Movement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {visibleIssues.length < totalIssues && (
           <div className="mt-8 text-center pb-12">
              <button 
                onClick={() => setVisibleCount(p => p + 6)}
                className="bg-white border border-slate-200 text-slate-600 px-8 py-3 rounded-full font-bold hover:bg-slate-50 shadow-sm transition-all hover:scale-105"
              >
                 Load More Issues
              </button>
           </div>
        )}
      </main>

      {/* MODAL SYNC: Uses liveSelectedIssue to ensure it sees the latest updates */}
      <IssueDetailModal issue={liveSelectedIssue} onClose={handleDetailClose} />
      
      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} onSuccess={handleIssueCreated} />

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 10s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animate-fade-in-stagger { animation: fade-in-stagger 0.5s ease-out forwards; opacity: 0; }
        .animate-fade-in-quote { animation: fade-in-quote 0.8s ease-out; }
        .animate-gradient { background-size: 200% 200%; animation: gradient 3s ease infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-stagger { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in-quote { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes gradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
      `}</style>
    </div>
  );
}