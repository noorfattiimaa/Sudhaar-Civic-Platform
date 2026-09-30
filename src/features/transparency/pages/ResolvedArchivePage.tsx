import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Search, Filter, Calendar, 
  CheckCircle, MapPin, Tag, Loader2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- IMPORTS ---
import { ImageWithFallback } from "../../../components/ui/ImageWithFallback";
import TransparencyDetailModal from "../components/TransparencyDetailModal";
import { Issue } from "../../issues/types";
import { issuesService } from "../../../services/issues";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- SUB-COMPONENT: ARCHIVE CARD ---
const ArchiveCard = ({ issue, onClick }: { issue: Issue; onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1"
  >
    <div className="h-48 overflow-hidden relative">
      {/* Image with Grayscale effect that vanishes on hover */}
      <ImageWithFallback 
        src={issue.image || issue.image_url_full || issue.image_url || ""} 
        alt={issue.title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0" 
      />
      
      {/* Status Badge */}
      <div className="absolute top-3 right-3 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-200 shadow-sm flex items-center gap-1">
        <CheckCircle size={10} /> VERIFIED RESOLVED
      </div>
    </div>
    
    <div className="p-5">
      {/* Meta Tags */}
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wide">
           <Tag size={10} /> {issue.category}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wide">
           <Calendar size={10} /> {issue.timeText}
        </span>
      </div>

      <h3 className="font-bold text-slate-900 leading-tight mb-2 group-hover:text-emerald-700 transition-colors">
        {issue.title}
      </h3>
      
      <p className="text-xs text-slate-500 line-clamp-2 mb-4">
        {issue.desc || issue.description || ""}
      </p>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <MapPin size={12} /> {issue.location}
        </span>
        <span className="font-medium text-slate-600">
          By: {issue.author}
        </span>
      </div>
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---
export default function ResolvedArchivePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [archiveData, setArchiveData] = useState<Issue[]>([]);

  // Fetch resolved issues from API
  useEffect(() => {
    loadResolvedIssues();
  }, []);

  const loadResolvedIssues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await issuesService.getAll({ 
        resolved_only: true, 
        ordering: "-created_at" 
      });
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        let issuesData = response.data.results || response.data;
        if (!Array.isArray(issuesData)) {
          issuesData = [issuesData];
        }
        
        const mappedIssues = issuesData.map((issue: any) => {
          let timeText = issue.time_text || issue.timeText;
          if (!timeText && issue.created_at) {
            const created = new Date(issue.created_at);
            const now = new Date();
            const diffMs = now.getTime() - created.getTime();
            const diffDays = Math.floor(diffMs / 86400000);
            if (diffDays > 0) {
              timeText = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            } else {
              timeText = "Recently";
            }
          }
          
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
            image: issue.image_url_full || issue.image_url || issue.image || "",
            upvotes: issue.upvotes || 0,
            timeline: issue.timeline || []
          };
        });
        
        setArchiveData(mappedIssues);
      }
    } catch (err) {
      console.error("Error loading resolved issues:", err);
      setError("Failed to load resolved issues. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. CATEGORIES: Automatically find all unique categories in the resolved data
  const categories = useMemo(() => {
    const uniqueCats = Array.from(new Set(archiveData.map(i => i.category)));
    return ["All", ...uniqueCats];
  }, [archiveData]);

  // 3. FILTERING: Apply Search & Category logic
  const filteredData = useMemo(() => {
    return archiveData.filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            issue.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || issue.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, archiveData]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <button 
              onClick={() => navigate('/transparency')}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-700 font-bold text-sm mb-3 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Transparency
            </button>
            <h1 className="text-3xl font-black text-slate-900">Resolved Archive</h1>
            <p className="text-slate-500 mt-1">
              {isLoading ? (
                "Loading resolved issues..."
              ) : (
                `A permanent public record of ${archiveData.length} successfully resolved civic issues.`
              )}
            </p>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search by title or location..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 md:pb-0 no-scrollbar">
            <Filter size={16} className="text-slate-400 mr-2 shrink-0" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border capitalize",
                  selectedCategory === cat 
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md" 
                    : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-4">
            {error}
          </div>
        )}

        {/* CONTENT GRID */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse">
                <div className="h-48 bg-slate-200"></div>
                <div className="p-5">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded mb-4"></div>
                  <div className="h-3 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredData.map(issue => (
              <ArchiveCard 
                key={issue.id} 
                issue={issue} 
                onClick={() => setSelectedIssue(issue)}
              />
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No records found</h3>
            <p className="text-slate-500 text-sm">
              {searchTerm || selectedCategory !== "All" 
                ? "Try adjusting your search or filters." 
                : "No resolved issues in the archive yet."}
            </p>
            {(searchTerm || selectedCategory !== "All") && (
              <button 
                 onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}
                 className="mt-4 text-emerald-600 font-bold text-sm hover:underline"
              >
                 Clear Filters
              </button>
            )}
          </div>
        )}

      </div>

      {/* DETAIL MODAL (Read-Only) */}
      <TransparencyDetailModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
    </div>
  );
}