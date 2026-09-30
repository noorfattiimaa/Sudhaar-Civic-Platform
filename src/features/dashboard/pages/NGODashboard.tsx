import React, { useState, useEffect, useMemo } from "react";
import { 
  TrendingUp, 
  Users, 
  Heart, 
  PlusCircle, 
  ArrowUpRight,
  Megaphone,
  Clock,
  Loader2,
  AlertCircle,
  Sparkles,
  Target,
  RefreshCw
} from "lucide-react";
import CreateCampaignModal from "../../donations/pages/CreateCampaignModal";
import { CampaignCard } from '../../donations/pages/CampaignCard';
import { apiService } from '../../../services/api';
import { API_ENDPOINTS } from '../../../config/api';
import { Link } from 'react-router-dom';

interface NGOStats {
  totalRaised: string;
  activeCampaigns: number;
  totalDonors: number;
}

export default function NGODashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data
  useEffect(() => {
    const storedUser = localStorage.getItem('sudhaar_user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);
   
  const fetchMyCampaigns = async () => {
    setLoading(true);
    try {
      const response = await apiService.get<any>(API_ENDPOINTS.CAMPAIGNS);
      
      if (response.data) {
        const campaignsList = response.data.results || response.data;
        
        if (Array.isArray(campaignsList)) {
          setCampaigns(campaignsList);
        } else {
          setCampaigns([]);
        }
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setError("Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCampaigns();
  }, []);

  // --- DYNAMIC CALCULATIONS (Connecting Frontend to Backend Data) ---
  const calculatedStats = useMemo(() => {
    let raised = 0;
    let donors = 0;
    let active = 0;

    campaigns.forEach(camp => {
      // Sum up funds (handle strings or numbers)
      raised += parseFloat(String(camp.raised_amount || camp.raised || "0"));
      
      // Sum up donors (if available from backend, otherwise 0)
      donors += parseInt(String(camp.donor_count || camp.donors || "0"));

      // Count active
      if (camp.is_active) active++;
    });

    return { raised, donors, active };
  }, [campaigns]);

  const stats = [
    { 
      label: "Total Funds Raised", 
      // DYNAMIC VALUE
      value: `PKR ${calculatedStats.raised.toLocaleString()}`, 
      icon: Heart,
      change: "Lifetime total",
      bg: "bg-gradient-to-br from-pink-50 to-pink-100/50",
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      changeColor: "text-pink-600 bg-pink-50"
    },
    { 
      label: "Total Campaigns", 
      value: campaigns.length.toString(), 
      icon: Megaphone,
      // DYNAMIC CHANGE TEXT
      change: `${calculatedStats.active} active running`,
      bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      changeColor: "text-blue-600 bg-blue-50"
    },
    { 
      label: "Total Donors", 
      // DYNAMIC VALUE
      value: calculatedStats.donors.toLocaleString(), 
      icon: Users,
      change: "Across all campaigns",
      bg: "bg-gradient-to-br from-purple-50 to-purple-100/50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      changeColor: "text-purple-600 bg-purple-50"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-xs font-bold uppercase rounded-full tracking-wider border border-blue-200">
                <Sparkles className="h-3.5 w-3.5" />
                NGO Portal
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text">
              {userData?.organization_name || userData?.name || "Welcome Partner"}
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Manage your social impact campaigns and track community contributions.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={fetchMyCampaigns}
              disabled={loading}
              className="flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 px-5 py-4 rounded-2xl font-bold transition-all duration-200 shadow-sm disabled:opacity-50 group"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-2xl font-bold transition-all duration-200 shadow-xl shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/40 active:scale-95 group"
            >
              <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-200" />
              <span>Launch Campaign</span>
            </button>
          </div>
        </div>

        {/* Stats Quick Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className={`${stat.bg} p-6 rounded-3xl border-2 border-slate-200 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-xl group cursor-pointer animate-in fade-in slide-in-from-bottom`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-5">
                  <div className={`p-4 ${stat.iconBg} rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                    <Icon className={stat.iconColor} size={24} />
                  </div>
                  <span className={`text-[10px] font-bold ${stat.changeColor} px-3 py-1.5 rounded-full border border-current/20`}>
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-tight mb-1">{stat.label}</p>
                  <p className="text-4xl font-black text-slate-900">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100/50 border-2 border-red-200 text-red-700 px-4 py-4 rounded-2xl text-sm font-medium flex items-start gap-3 animate-in fade-in slide-in-from-top shadow-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800">Error Loading Campaigns</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Campaigns List - EXPANDED TO FULL WIDTH */}
          <div className="lg:col-span-3 bg-white rounded-3xl border-2 border-slate-200 shadow-lg overflow-hidden animate-in fade-in slide-in-from-left duration-700">
            <div className="px-6 py-5 border-b-2 border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">All Campaigns</h2>
                  <p className="text-xs text-slate-500 font-medium">Showing {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <Link 
                to="/dashboard/manage" 
                className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1.5 group transition-colors hover:text-blue-700"
              >
                Manage All
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            <div className="p-6">
              {loading ? (
                // Loading State
                <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in">
                  <div className="relative mb-6">
                    <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                    <div className="absolute inset-0 h-16 w-16 animate-ping text-blue-600 opacity-20">
                      <Loader2 className="h-16 w-16" />
                    </div>
                  </div>
                  <p className="text-slate-400 font-bold text-lg mb-2">Syncing with Server...</p>
                  <p className="text-slate-400 text-sm">Loading your campaigns</p>
                </div>
              ) : campaigns.length > 0 ? (
                // Campaigns Grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns.map((campaign, index) => (
                    <div 
                      key={campaign.id}
                      className="animate-in fade-in slide-in-from-bottom"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CampaignCard campaign={campaign} />
                    </div>
                  ))}
                </div>
              ) : (
                // Empty State
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 animate-in fade-in zoom-in">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Clock className="text-slate-400" size={40} />
                  </div>
                  <h3 className="text-slate-900 font-black text-xl mb-2">No Active Campaigns</h3>
                  <p className="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">
                    Launch your first campaign to start making a difference in your community and track donations in real-time.
                  </p>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-xl group"
                  >
                    <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-200" />
                    Create First Campaign
                  </button>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>

      {/* Create Campaign Modal */}
      {isCreateModalOpen && (
        <CreateCampaignModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchMyCampaigns}
        />
      )}
    </div>
  );
}