import React, { useState, useEffect } from "react";
import { MapPin, Heart, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Issue } from "../types";
import { ImageWithFallback } from "../../../components/ui/ImageWithFallback";
import { formatDisplayDate } from "../../../utils/date";
import { issuesService } from "../../../services/issues";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface IssueCardProps {
  issue: Issue;
  onClick: () => void;
  priority?: boolean;
  onVoteChange?: (id: number | string, newVotes: number, newHasUpvoted: boolean) => void;
}

export const IssueCard = React.memo(({ issue, onClick, priority = false, onVoteChange }: IssueCardProps) => {
  // FIX: Explicitly type the state as number
  const [votes, setVotes] = useState<number>(issue.upvotes || 0);
  const [isUpvoted, setIsUpvoted] = useState(issue.user_has_upvoted || false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    // FIX: Removed 'issue.votes' to satisfy TypeScript. We use 'upvotes' consistently.
    setVotes(issue.upvotes || 0);
    setIsUpvoted(issue.user_has_upvoted || false);
  }, [issue]); 

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVoting) return;

    setIsVoting(true);
    const wasUpvoted = isUpvoted;
    
    // Calculate new values
    const newUpvotedState = !wasUpvoted;
    const newVoteCount = wasUpvoted ? votes - 1 : votes + 1;

    // 1. Optimistic Local Update
    setIsUpvoted(newUpvotedState);
    setVotes(newVoteCount);

    // 2. Notify Parent
    if (onVoteChange) {
      onVoteChange(issue.id, newVoteCount, newUpvotedState);
    }

    try {
      const response = wasUpvoted
        ? await issuesService.removeUpvote(issue.id)
        : await issuesService.upvote(issue.id);

      if (response.error) {
        // Rollback
        setIsUpvoted(wasUpvoted);
        // FIX: Explicitly type 'v' as number to fix "implicitly has an 'any' type"
        setVotes((v: number) => votes); 
        if (onVoteChange) onVoteChange(issue.id, votes, wasUpvoted); 
      }
    } catch (err) {
      // Rollback
      setIsUpvoted(wasUpvoted);
      // FIX: Explicitly type 'v'
      setVotes((v: number) => votes);
      if (onVoteChange) onVoteChange(issue.id, votes, wasUpvoted);
    } finally {
      setIsVoting(false);
    }
  };

  const statusColor = issue.status === "Verified" ? "bg-emerald-500" : issue.status === "Critical" ? "bg-red-600 animate-pulse" : "bg-amber-500";

  return (
    <article onClick={onClick} className="group cursor-pointer flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden">
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <ImageWithFallback
          src={issue.image || issue.image_url_full || issue.image_url || ""}
          alt={issue.title}
          className="h-full w-full group-hover:scale-105 transition-transform"
          priority={priority}
        />
        <div className="absolute top-3 left-3"><span className={cn("px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm backdrop-blur-md", statusColor)}>{issue.status}</span></div>
      </div>
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
            {((issue.author || issue.author_name || "U") as string).charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-bold text-slate-700">{issue.author || issue.author_name || "Unknown"}</span>
          <span className="text-xs text-slate-400">• {formatDisplayDate(issue.created_at)}</span>
        </div>
        <h3 className="font-bold text-lg leading-tight text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{issue.title}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{issue.desc || issue.description || ""}</p>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><MapPin className="h-3 w-3" /> {issue.location}</span>
          <button
            onClick={handleVote}
            disabled={isVoting}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50",
              isUpvoted ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            )}
          >
            {isVoting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Heart className={cn("h-3.5 w-3.5", isUpvoted && "fill-current")} />
            )}
            {votes}
          </button>
        </div>
      </div>
    </article>
  );
});