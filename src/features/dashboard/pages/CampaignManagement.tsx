import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../services/api';
import { API_ENDPOINTS, API_BASE_URL } from '../../../config/api';
import {
  Plus, Search, Trash2, Loader2, AlertCircle, Target
} from 'lucide-react';

interface Campaign {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  goal_amount: string;
  raised_amount: string;
  progress_percentage: number;
  is_verified: boolean;
  donor_count: number;
}

export default function CampaignManagement() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get<any>(API_ENDPOINTS.CAMPAIGNS);

      if (response && response.data) {
        const dataList = response.data.results || response.data;
        setCampaigns(Array.isArray(dataList) ? dataList : []);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to load campaigns");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) {
      return;
    }

    setDeleteLoading(id);
    try {
      const url = `${API_ENDPOINTS.CAMPAIGNS}${id}/`;
      const response = await apiService.delete(url);

      if (!response.error) {
        setCampaigns(prev => prev.filter(c => c.id !== id));
      } else {
        alert(`Error: ${response.error}`);
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Network error occurred while deleting.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredCampaigns = campaigns.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getImageUrl = (path: string) => {
    if (!path) return '/placeholder-campaign.jpg';
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900">Campaign Manager</h1>
          <p className="text-slate-500 font-medium">Manage your fundraising campaigns</p>
        </div>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl transition-all"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search campaigns..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Campaigns Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase">Campaign</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase">Status</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase">Progress</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCampaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  onClick={() => navigate(`/dashboard/manage/${campaign.id}`)}
                  className="hover:bg-blue-50/30 transition-all cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                        <img
                          src={getImageUrl(campaign.image)}
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-lg">{campaign.title}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">{campaign.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {campaign.is_verified ? (
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black uppercase">
                        <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" /> Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-black uppercase">
                        <div className="w-2 h-2 rounded-full bg-amber-600" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-48 space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-lg font-black text-slate-900">
                          {Math.round(campaign.progress_percentage || 0)}%
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          Rs {Number(campaign.raised_amount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full transition-all"
                          style={{ width: `${Math.min(campaign.progress_percentage || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => handleDelete(campaign.id)}
                      disabled={deleteLoading === campaign.id}
                      className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-2xl transition-all disabled:opacity-50"
                      title="Delete Campaign"
                    >
                      {deleteLoading === campaign.id ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-24 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
            <p className="text-slate-900 font-black text-lg">Loading campaigns...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCampaigns.length === 0 && (
          <div className="p-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="text-slate-300" size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">No campaigns found</h3>
            <p className="text-slate-400 font-medium">
              {searchTerm ? `No results for "${searchTerm}"` : "Create your first campaign to get started"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}