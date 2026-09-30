import { useEffect } from "react";
import { 
  X, CheckCircle2, MapPin, Calendar, 
  Building2, ArrowRight, Quote 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageWithFallback } from "../../../components/ui/ImageWithFallback";
import { Issue } from "../../issues/types";

interface TransparencyDetailModalProps {
  issue: Issue | null;
  onClose: () => void;
}

export default function TransparencyDetailModal({ issue, onClose }: TransparencyDetailModalProps) {
  
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (issue) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = "unset"; };
    }
  }, [issue]);

  if (!issue) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Card */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
               <h2 className="text-xl font-black text-slate-900 line-clamp-1">{issue.title}</h2>
               <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    <CheckCircle2 size={14} /> Resolved
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> {issue.timeText || issue.time_text || "Recently"}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {issue.location}
                  </span>
               </div>
            </div>
            <button
  onClick={onClose}
  aria-label="Close"
  className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
>
  <X size={20} />
</button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-6 lg:p-8 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* LEFT COLUMN: Visuals */}
              <div className="space-y-6">
                
                {/* Main Image (Completed Work) */}
                <div>
                  <h3 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wide">
                    Verification Evidence
                  </h3>
                  <div className="relative rounded-2xl overflow-hidden h-64 border border-slate-200 group shadow-sm">
                    <ImageWithFallback 
                      src={issue.image || issue.image_url_full || issue.image_url || ""} 
                      alt={issue.title} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                      COMPLETED WORK
                    </div>
                  </div>
                </div>

                {/* Feedback / Quote */}
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                  <Quote className="text-blue-300 mb-2" size={24} />
                  <p className="text-slate-700 italic text-sm leading-relaxed">
                    "This issue was verified as resolved by the municipal team. The community has confirmed the fix."
                  </p>
                  <p className="text-blue-600 font-bold text-xs mt-3">— Sudhaar Verification Team</p>
                </div>
              </div>

              {/* RIGHT COLUMN: Data & Story */}
              <div className="space-y-8">
                
                {/* 1. Resolution Story */}
                <div>
                  <h3 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wide">
                    Resolution Story
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {issue.desc || issue.description || "This issue has been successfully resolved."}
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Work began immediately after funding approval and was completed within the expected timeline.
                  </p>
                </div>

                {/* 2. Executed By */}
                <div>
                   <h3 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wide flex items-center gap-2">
                      <Building2 size={14} className="text-purple-600" /> Executed By
                   </h3>
                   <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-purple-600 border border-slate-100 shadow-sm text-lg">
                         {((issue.author || issue.author_name || "A") as string).charAt(0).toUpperCase()}
                      </div>
                      <div>
                         <p className="font-bold text-slate-900 text-sm">{issue.author || issue.author_name || "Municipal Dept"}</p>
                         <p className="text-xs text-slate-500">Verified Contractor / Department</p>
                      </div>
                      <div className="ml-auto text-slate-300">
                        <ArrowRight size={16} />
                      </div>
                   </div>
                </div>

              </div>

            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}