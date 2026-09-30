import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShieldCheck, TrendingUp, Building2, 
  CheckCircle2, Copy, Leaf, AlertCircle, Landmark, Smartphone, ExternalLink
} from 'lucide-react';
import { ImageWithFallback } from '../../../components/ui/ImageWithFallback';

// Match the interface from NGOPage
interface Campaign {
  id: string;
  title: string;
  ngo: string;
  image: string;
  raised: number;
  goal: number;
  donors: number;
  desc: string;
  category: string;
  zakatEligible?: boolean;
  budget: { item: string; cost: number; funded: number }[];
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

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onDonationSuccess?: () => void;
}

export default function CampaignModal({ isOpen, onClose, campaign }: CampaignModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bank' | 'mobile'>('bank');

  // Live Data State
  const [currentRaised, setCurrentRaised] = useState(0);
  const [currentDonors, setCurrentDonors] = useState(0);

  useEffect(() => {
    if (campaign) {
      setCurrentRaised(campaign.raised);
      setCurrentDonors(campaign.donors);
    }
  }, [campaign, isOpen]);

  if (!isOpen || !campaign) return null;

  const percent = Math.min(100, Math.round((currentRaised / campaign.goal) * 100));

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
          onClick={onClose} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" 
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
            <div>
              <h2 className="text-lg font-black text-slate-900 line-clamp-1">{campaign.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                 <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck size={10} /> Verified NGO
                 </span>
                 {campaign.zakatEligible && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                        <Leaf size={10} /> Zakat Eligible
                    </span>
                 )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors group">
              <X size={20} className="text-slate-400 group-hover:text-slate-900" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 bg-slate-50/50 custom-scrollbar">
            <div className="flex flex-col lg:flex-row h-full">
              
              {/* LEFT: Content Details */}
              <div className="flex-1 p-6 lg:p-8 space-y-6">
                <div className="rounded-2xl overflow-hidden shadow-sm h-56 relative group">
                  <ImageWithFallback 
                    src={campaign.image} 
                    alt={campaign.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-bold text-lg flex items-center gap-2">
                      <Building2 size={18} className="text-emerald-400" /> {campaign.ngo}
                    </p>
                    <p className="text-xs text-slate-300 ml-6">Registered Non-Profit • Reg #4421-B</p>
                  </div>
                </div>

                <div className="prose prose-sm prose-slate max-w-none">
                    <h3 className="text-slate-900 font-bold text-lg mb-2">About this campaign</h3>
                    <p className="text-slate-600 leading-relaxed">{campaign.desc}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <TrendingUp size={16} className="text-blue-600" /> Budget Transparency
                  </h4>
                  <div className="space-y-4">
                    {campaign.budget.length > 0 ? campaign.budget.map((b, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                          <span>{b.item}</span>
                          <span>PKR {b.cost.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${Math.min((b.funded/b.cost)*100, 100)}%` }} 
                          />
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-400 italic">Budget details available upon request.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: Dynamic Bank Details */}
              <div className="w-full lg:w-[420px] bg-white border-l border-slate-100 p-6 lg:p-8 flex flex-col shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)]">
                  
                 {/* Live Stats */}
                 <div className="mb-8 text-center bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Raised</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">
                      PKR {currentRaised.toLocaleString()}
                    </p>
                    
                    <div className="relative h-2.5 w-full bg-slate-200 rounded-full overflow-hidden my-4">
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-blue-500" 
                          style={{ width: `${percent}%` }} 
                        />
                    </div>
                    
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>{percent}% funded</span>
                      <span>{currentDonors} Donors</span>
                    </div>
                 </div>

                 {/* Donation Methods Tabs */}
                 <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                   <button 
                     onClick={() => setActiveTab('bank')}
                     className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'bank' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     <Landmark size={16} /> Bank Transfer
                   </button>
                   <button 
                     onClick={() => setActiveTab('mobile')}
                     className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     <Smartphone size={16} /> Mobile Wallet
                   </button>
                 </div>

                 <div className="space-y-6 flex-1">
                    
                    {activeTab === 'bank' ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                         <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                            {/* DYNAMIC BANK NAME */}
                            <h3 className="font-bold text-blue-900 text-sm mb-3">{campaign.paymentInfo.bankName}</h3>
                            
                            <div className="space-y-3">
                               <div className="bg-white p-3 rounded-lg border border-blue-100/50 group cursor-pointer hover:border-blue-300 transition-colors" onClick={() => handleCopy(campaign.paymentInfo.accountTitle, "title")}>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Account Title</p>
                                  <div className="flex justify-between items-center">
                                    {/* DYNAMIC TITLE */}
                                    <p className="font-bold text-slate-800">{campaign.paymentInfo.accountTitle}</p>
                                    {copiedField === "title" ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} className="text-slate-300 group-hover:text-blue-500" />}
                                  </div>
                               </div>

                               <div className="bg-white p-3 rounded-lg border border-blue-100/50 group cursor-pointer hover:border-blue-300 transition-colors" onClick={() => handleCopy(campaign.paymentInfo.iban, "iban")}>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">IBAN Number</p>
                                  <div className="flex justify-between items-center">
                                    {/* DYNAMIC IBAN */}
                                    <p className="font-mono font-bold text-slate-800 text-sm tracking-tight">{campaign.paymentInfo.iban}</p>
                                    {copiedField === "iban" ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} className="text-slate-300 group-hover:text-blue-500" />}
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                         <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                            {/* DYNAMIC PROVIDER */}
                            <h3 className="font-bold text-emerald-900 text-sm mb-3">{campaign.paymentInfo.mobileWallet?.provider || "Mobile Wallet"}</h3>
                            
                            <div className="bg-white p-3 rounded-lg border border-emerald-100/50 group cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => handleCopy(campaign.paymentInfo.mobileWallet?.number || "", "mobile")}>
                                <div className="flex justify-between items-start mb-1">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Merchant Mobile Number</p>
                                  {copiedField === "mobile" ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} className="text-slate-300 group-hover:text-emerald-500" />}
                                </div>
                                {/* DYNAMIC NUMBER */}
                                <p className="font-mono font-bold text-slate-800 text-xl tracking-wider">{campaign.paymentInfo.mobileWallet?.number || "N/A"}</p>
                                {/* DYNAMIC TITLE */}
                                <p className="text-xs text-slate-500 mt-1">Title: {campaign.paymentInfo.mobileWallet?.title || "N/A"}</p>
                            </div>
                         </div>
                      </div>
                    )}

                    {/* Verification Notice - Updated with dynamic contact info */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <div className="flex items-start gap-3">
                          <AlertCircle size={18} className="text-slate-400 shrink-0 mt-0.5" />
                          <div className="text-xs text-slate-500 leading-relaxed">
                             <p className="mb-2">After transferring, please send a screenshot of the receipt for verification.</p>
                             <div className="flex flex-wrap gap-2">
                               <a 
                                 href={`mailto:${campaign.paymentInfo.contactEmail}`} 
                                 className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-blue-600 bg-white border border-slate-200 px-2 py-1 rounded-md transition-colors"
                               >
                                 Email Receipt
                               </a>
                               <a 
                                 href={`https://wa.me/${campaign.paymentInfo.contactPhone.replace(/[- ]/g, '')}`} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-emerald-600 bg-white border border-slate-200 px-2 py-1 rounded-md transition-colors"
                               >
                                 WhatsApp Receipt <ExternalLink size={10} />
                               </a>
                             </div>
                          </div>
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