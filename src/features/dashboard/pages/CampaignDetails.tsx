import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../../services/api';
import { API_ENDPOINTS, API_BASE_URL } from '../../../config/api';
import {
    ArrowLeft, Users, Target, Calendar, Loader2, AlertCircle, Heart
} from 'lucide-react';

interface Donation {
    id: number;
    donor_name: string;
    donor_email: string;
    amount: string;
    is_anonymous: boolean;
    payment_method: string;
    created_at: string;
}

interface Campaign {
    id: number;
    title: string;
    description: string;
    category: string;
    image: string;
    goal_amount: string;
    raised_amount: string;
    progress_percentage: number;
    donor_count: number;
    is_verified: boolean;
    created_at: string;
}

export default function CampaignDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchCampaignDetails();
        }
    }, [id]);

    const fetchCampaignDetails = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch campaign details
            const campaignResponse = await apiService.get<Campaign>(`${API_ENDPOINTS.CAMPAIGNS}${id}/`);

            if (campaignResponse.data) {
                setCampaign(campaignResponse.data);
            }

            // Fetch donations for this campaign
            const donationsResponse = await apiService.get<Donation[]>(`${API_ENDPOINTS.CAMPAIGNS}${id}/donations/`);

            if (donationsResponse.data) {
                setDonations(Array.isArray(donationsResponse.data) ? donationsResponse.data : []);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setError("Failed to load campaign details");
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path: string) => {
        if (!path) return '/placeholder-campaign.jpg';
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}${path}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading campaign details...</p>
                </div>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
                <div className="bg-white rounded-3xl p-12 max-w-md text-center shadow-xl">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Error Loading Campaign</h2>
                    <p className="text-slate-600 mb-6">{error || "Campaign not found"}</p>
                    <button
                        onClick={() => navigate('/dashboard/manage')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
                    >
                        Back to Campaigns
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard/manage')}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Campaigns
                </button>

                {/* Campaign Header */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Campaign Image */}
                        <div className="h-96 bg-slate-100">
                            <img
                                src={getImageUrl(campaign.image)}
                                alt={campaign.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Campaign Info */}
                        <div className="p-8 space-y-6">
                            <div>
                                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-black uppercase rounded-full mb-3">
                                    {campaign.category}
                                </div>
                                <h1 className="text-4xl font-black text-slate-900 mb-4">{campaign.title}</h1>
                                <p className="text-slate-600 leading-relaxed">{campaign.description}</p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-emerald-50 p-4 rounded-2xl">
                                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                        <Target size={20} />
                                        <span className="text-xs font-black uppercase">Goal</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900">Rs {Number(campaign.goal_amount).toLocaleString()}</p>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-2xl">
                                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                                        <Heart size={20} />
                                        <span className="text-xs font-black uppercase">Raised</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900">Rs {Number(campaign.raised_amount).toLocaleString()}</p>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-2xl">
                                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                                        <Users size={20} />
                                        <span className="text-xs font-black uppercase">Donors</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900">{campaign.donor_count}</p>
                                </div>

                                <div className="bg-amber-50 p-4 rounded-2xl">
                                    <div className="flex items-center gap-2 text-amber-600 mb-2">
                                        <Calendar size={20} />
                                        <span className="text-xs font-black uppercase">Created</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">{formatDate(campaign.created_at)}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-slate-600">Progress</span>
                                    <span className="text-2xl font-black text-blue-600">{Math.round(campaign.progress_percentage)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full transition-all"
                                        style={{ width: `${Math.min(campaign.progress_percentage, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Donations List */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100">
                        <h2 className="text-2xl font-black text-slate-900">Donations ({donations.length})</h2>
                        <p className="text-slate-500 font-medium">Recent contributions to this campaign</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase">Donor</th>
                                    <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase">Amount</th>
                                    <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase">Date</th>
                                    <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase">Method</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {donations.length > 0 ? (
                                    donations.map((donation) => (
                                        <tr key={donation.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-4">
                                                <div>
                                                    <div className="font-bold text-slate-900">{donation.donor_name}</div>
                                                    {!donation.is_anonymous && (
                                                        <div className="text-sm text-slate-500">{donation.donor_email}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="text-lg font-black text-emerald-600">
                                                    Rs {Number(donation.amount).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="text-sm text-slate-600">{formatDate(donation.created_at)}</span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full uppercase">
                                                    {donation.payment_method || 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-12 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Users className="h-16 w-16 text-slate-300" />
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900 mb-1">No donations yet</h3>
                                                    <p className="text-slate-500">Be the first to support this campaign!</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
