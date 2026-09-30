import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Building2, Users, ArrowRight, 
  Loader2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageWithFallback } from '../../../components/ui/ImageWithFallback';
import CampaignModal from "./CampaignModal";
import { campaignsService } from '../../../services/campaigns';

// --- INTERFACE FOR DONATION VIEW ---
interface FormattedCampaign {
  id: string;
  title: string;
  ngo: string;
  image: string;
  raised: number;
  goal: number;
  donors: number;
  desc: string;
  category: string;
  is_verified: boolean;
  zakatEligible: boolean;
  daysLeft: number;
  budget: any[];
  // Dynamic Payment Details
  paymentInfo: {
    bankName: string;
    accountTitle: string;
    iban: string;
    mobileWallet?: {
      provider: string;
      number: string;
      title: string;
    };
    contactEmail: string;
    contactPhone: string;
  };
}

export default function DonationPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<FormattedCampaign | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<FormattedCampaign[]>([]);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await campaignsService.getAll({ is_active: true });
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        let rawData = response.data.results || response.data;
        if (!Array.isArray(rawData)) rawData = [rawData];

        // Map Backend Data to Frontend Donation Format
        const formattedData: FormattedCampaign[] = rawData.map((c: any, index: number) => {
          // Days Left Calculation
          const created = new Date(c.created_at);
          const end = new Date(created);
          end.setDate(created.getDate() + 30);
          const now = new Date();
          const diffTime = Math.max(0, end.getTime() - now.getTime());
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Mock Dynamic Bank Details (Replace with c.bank_details later)
          const ngoName = c.ngo_name || "Community NGO";
          const dynamicPaymentInfo = {
            bankName: c.bank_name || (index % 2 === 0 ? "Meezan Bank" : "HBL"),
            accountTitle: c.account_title || ngoName + " Trust",
            iban: c.iban || `PK${36 + index}MEZN00${1234567890 + index}`,
            mobileWallet: {
              provider: index % 2 === 0 ? "JazzCash" : "EasyPaisa",
              number: c.wallet_number || `030${index}-${1234567}`,
              title: c.wallet_title || `${ngoName} Admin`
            },
            contactEmail: c.contact_email || `finance@${ngoName.replace(/\s/g, '').toLowerCase()}.org`,
            contactPhone: c.contact_phone || `030${index}-1234567`
          };

          return {
            id: String(c.id),
            title: c.title,
            ngo: ngoName,
            image: c.image_url_full || c.image_url || c.image || "",
            raised: parseFloat(c.raised_amount || "0"),
            goal: parseFloat(c.goal_amount || c.target_amount || "0"),
            donors: c.donor_count || 0,
            desc: c.description || "",
            category: c.category || "General",
            is_verified: c.is_verified || false,
            zakatEligible: c.zakat_eligible || false,
            daysLeft: daysLeft,
            budget: c.budget_items?.map((b: any) => ({
              item: b.item_name,
              cost: parseFloat(b.total_cost || "0"),
              funded: parseFloat(b.funded_amount || "0")
            })) || [],
            paymentInfo: dynamicPaymentInfo
          };
        });

        setCampaigns(formattedData);
      }
    } catch (err) {
      console.error("Error loading campaigns:", err);
      setError("Failed to load campaigns.");
    } finally {
      setIsLoading(false);
    }
  };

  const categories = useMemo(() => {
    const uniqueCats = Array.from(new Set(campaigns.map(c => c.category)));
    return ["All", ...uniqueCats];
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchesCat = selectedCategory === "All" || c.category === selectedCategory;
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.ngo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery, campaigns]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* --- HERO HEADER (DONOR FOCUSED) --- */}
      <div className="bg-slate-900 pt-16 pb-24 px-6 text-center rounded-b-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
             <Building2 size={14} /> Partnered NGOs
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Fund Real Change. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
              Directly & Transparently.
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Browse verified campaigns from trusted NGOs. 
            Funds go directly to their official bank accounts.
          </p>
        </div>
      </div>

      {/* --- FILTERS & CONTENT --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        
        {/* Search Bar */}
        <div className="bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-2 mb-8 border border-slate-100">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Search causes or NGOs..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar p-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                  ? "bg-slate-900 text-white shadow-lg" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-4 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Campaign Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse h-96" />
            ))}
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredCampaigns.map((camp) => {
                const percent = camp.goal > 0 ? Math.round((camp.raised / camp.goal) * 100) : 0;
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={camp.id}
                    onClick={() => setSelectedCampaign(camp)}
                    className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                  >
                    <div className="h-48 overflow-hidden relative">
                      <ImageWithFallback 
                        src={camp.image} 
                        alt={camp.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1">
                        {camp.is_verified && <Building2 size={12} className="text-blue-500" />} 
                        {camp.ngo}
                      </div>
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        {camp.category}
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-emerald-600 transition-colors">
                        {camp.title}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1">
                        {camp.desc}
                      </p>

                      <div className="mb-4">
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                          <span>{percent}% Funded</span>
                          <span>PKR {camp.goal.toLocaleString()}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(percent, 100)}%` }}></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                          <Users size={14} />
                          {camp.donors} Donors
                        </div>
                        <button className="flex items-center gap-2 text-emerald-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                          Donate Now <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-300" size={24} />
            </div>
            <p className="text-slate-500 font-medium">No campaigns found.</p>
          </div>
        )}

      </div>

      <CampaignModal 
        isOpen={!!selectedCampaign} 
        onClose={() => setSelectedCampaign(null)} 
        campaign={selectedCampaign}
      />

    </div>
  );
}