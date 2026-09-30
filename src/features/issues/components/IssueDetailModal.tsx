import { useState, useEffect } from "react";
import { CheckCircle2, Heart, X, Send, Share2, Loader2, Trash2, BadgeCheck } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Issue } from "../types";
import { ImageWithFallback } from "../../../components/ui/ImageWithFallback";
import { issuesService, Comment as BackendComment } from "../../../services/issues";
import { formatTimeAgo, formatDisplayDate } from "../../../utils/date";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export default function IssueDetailModal({ issue, onClose }: { issue: Issue | null; onClose: () => void }) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<BackendComment[]>([]);
  // FIX: Explicit typing
  const [votes, setVotes] = useState<number>(0);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  useEffect(() => {
    if (issue) {
      document.body.style.overflow = "hidden";
      // FIX: Removed 'issue.votes'. Only use 'upvotes'.
      setVotes(issue.upvotes || 0);
      setIsUpvoted(issue.user_has_upvoted || false);
      fetchComments();
      return () => { document.body.style.overflow = "unset"; };
    }
  }, [issue]);

  const fetchComments = async () => {
    if (!issue) return;
    setIsLoadingComments(true);
    try {
      const response = await issuesService.getComments(issue.id);
      if (response.data) {
        setComments(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  if (!issue) return null;

  const handleVote = async () => {
    if (isVoting) return;

    setIsVoting(true);
    const wasUpvoted = isUpvoted;

    setIsUpvoted(!wasUpvoted);
    // FIX: Typed the previous state variable 'prev'
    setVotes((prev: number) => wasUpvoted ? prev - 1 : prev + 1);

    try {
      const response = wasUpvoted
        ? await issuesService.removeUpvote(issue.id)
        : await issuesService.upvote(issue.id);

      if (response.error) {
        setIsUpvoted(wasUpvoted);
        setVotes((prev: number) => wasUpvoted ? prev + 1 : prev - 1);
      }
    } catch (err) {
      setIsUpvoted(wasUpvoted);
      setVotes((prev: number) => wasUpvoted ? prev + 1 : prev - 1);
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/issue/${issue.id}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    const textToPost = commentText;
    setCommentText("");

    try {
      const response = await issuesService.createComment(issue.id, textToPost);
      if (response.data) {
        setComments(prev => [response.data as BackendComment, ...prev]);
      } else {
        setCommentText(textToPost);
        alert("Failed to post comment");
      }
    } catch (err) {
      setCommentText(textToPost);
    }
  };

  const handleDeleteComment = async (commentId: string | number) => {
    if (!issue || !window.confirm("Delete this comment?")) return;
    try {
      const response = await issuesService.deleteComment(issue.id, commentId);
      if (!response.error) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const statusConfig: Record<string, string> = { "Verified": "bg-emerald-500", "In Progress": "bg-blue-500", "Pending": "bg-amber-500", "Resolved": "bg-slate-500", "Critical": "bg-red-600 animate-pulse" };
  const displayDesc = issue.description || (issue as any).desc || "No description provided.";
  const displayAuthor = (issue as any).author_name || issue.author || "Anonymous";
  const displayLocation = issue.location || "Narowal";
  const displayImage = issue.image || (issue as any).image_url_full || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-4 sm:px-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh]">
        <button onClick={onClose} title="Close" className="absolute top-4 right-4 z-10 p-2 bg-black/20 text-white rounded-full lg:hidden"><X className="h-5 w-5" /></button>

        <div className="relative w-full lg:w-[55%] bg-slate-100 flex flex-col">
          <div className="h-[300px] lg:h-full relative">
            <ImageWithFallback src={displayImage} alt={issue.title} className="h-full w-full object-cover" />
            <div className="absolute top-4 left-4">
              <span className={cn("px-4 py-1.5 rounded-full text-xs font-bold text-white flex gap-2 items-center", statusConfig[issue.status] || "bg-slate-500")}>
                <CheckCircle2 className="h-3.5 w-3.5" /> {issue.status}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[45%] flex flex-col bg-white h-full max-h-[60vh] lg:max-h-[90vh]">
          <div className="p-6 border-b border-slate-100 shrink-0 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">{displayAuthor.charAt(0)}</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{displayAuthor}</h4>
                  <p className="text-xs text-slate-400">{displayLocation} • {formatDisplayDate(issue.created_at)}</p>
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">{issue.title}</h2>
            </div>
            <button onClick={onClose} title="Close" className="hidden lg:flex p-2 hover:bg-slate-100 rounded-full"><X className="h-6 w-6" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <p className="text-slate-600 leading-relaxed">{displayDesc}</p>

            <div className="flex gap-4 border-y border-slate-50 py-4">
              <button
                onClick={handleVote}
                disabled={isVoting}
                className={cn(
                  "flex-1 flex justify-center items-center gap-2 font-bold text-sm py-2.5 rounded-xl transition-all",
                  isUpvoted ? "bg-blue-600 text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                )}
              >
                {isVoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={cn("h-4 w-4", isUpvoted && "fill-current")} />}
                {votes} {votes === 1 ? 'Vote' : 'Votes'}
              </button>

              <button onClick={handleShare} className="flex-1 flex justify-center gap-2 font-bold text-sm bg-slate-50 hover:bg-slate-100 py-2.5 rounded-xl text-slate-600">
                <Share2 className="h-4 w-4" />
                {isCopied ? "Copied!" : "Share"}
              </button>
            </div>

            <div className="space-y-4">
              {isLoadingComments ? (
                <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
              ) : comments.length > 0 ? (
                comments.map(c => {
                  const isOfficial = (c as any).is_official || (c as any).role === 'official';
                  
                  return (
                    <div key={c.id} className="flex gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        isOfficial ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-slate-900 text-white"
                      )}>
                        {isOfficial ? <BadgeCheck size={16} /> : c.user_avatar}
                      </div>
                      <div className={cn(
                        "p-3 rounded-xl text-sm flex-1",
                        isOfficial ? "bg-blue-50 border border-blue-100" : "bg-slate-50"
                      )}>
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className={cn("font-bold block text-xs", isOfficial ? "text-blue-700" : "text-slate-900")}>
                              {c.user_name}
                            </span>
                            {isOfficial && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-md font-bold uppercase tracking-wide flex items-center gap-1">
                                Official
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">• {formatTimeAgo(c.created_at)}</span>
                          </div>
                          {c.is_own_comment && (
                            <button onClick={() => handleDeleteComment(c.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1"><Trash2 className="h-3 w-3" /></button>
                          )}
                        </div>
                        <p className={isOfficial ? "text-slate-800" : "text-slate-600"}>{c.text}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-slate-400 text-sm py-4">No comments yet. Start the conversation!</p>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-white shrink-0 relative">
            <input
              type="text"
              placeholder="Write a comment..."
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
            />
            <button onClick={handlePostComment} className="absolute right-6 top-6 text-blue-600 hover:text-blue-700">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}