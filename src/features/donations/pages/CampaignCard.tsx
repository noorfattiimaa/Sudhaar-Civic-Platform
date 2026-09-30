import React from 'react';
import { Target, Users, TrendingUp, CheckCircle, Clock } from 'lucide-react';

interface CampaignCardProps {
  campaign: {
    id: number;
    title: string;
    description: string;
    goal_amount: number;
    raised_amount: number;
    donor_count: number;
    image_url_full?: string;
    category: string;
    progress_percentage: number;
    is_verified: boolean;
  };
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      
      {/* 1. Image Container (Must be relative for badges to show) */}
      <div className="h-40 w-full bg-slate-200 relative">
        {campaign.image_url_full ? (
          <img 
            src={campaign.image_url_full} 
            alt={campaign.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs italic">
            No Image Available
          </div>
        )}

        {/* Category Badge (Top Left) */}
        <span className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10">
          {campaign.category}
        </span>

        {/* Verification Status Badge (Top Right) */}
        <div className="absolute top-3 right-3 z-10">
          {campaign.is_verified ? (
            <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-white/20">
              <CheckCircle size={10} /> Verified
            </span>
          ) : (
            <span className="bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-white/20">
              <Clock size={10} /> Pending
            </span>
          )}
        </div>
      </div>

      {/* 2. Content Section */}
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 truncate">{campaign.title}</h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1">{campaign.description}</p>
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-blue-600 font-bold">Rs. {campaign.raised_amount.toLocaleString()}</span>
            <span className="text-slate-400">{Math.round(campaign.progress_percentage)}%</span>
          </div>
          
          {/* Fixed Progress Bar (No Linting Errors) */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-700 ease-out" 
              style={{ inlineSize: `${Math.min(campaign.progress_percentage, 100)}%` } as React.CSSProperties}
            />
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
            <Target size={12} />
            <span>Goal: Rs. {campaign.goal_amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer Section */}
        <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
            <Users size={14} className="text-slate-400" />
            <span>{campaign.donor_count} Donors</span>
          </div>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 group">
            Details 
            <TrendingUp size={12} className="group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};