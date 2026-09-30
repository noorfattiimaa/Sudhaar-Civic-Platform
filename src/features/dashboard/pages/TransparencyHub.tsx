import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiService } from '../../../services/api';
import { API_ENDPOINTS } from '../../../config/api';

export default function TransparencyHub() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [amountSpent, setAmountSpent] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    // Load campaigns so the NGO can pick which one they are reporting for
    const fetchCampaigns = async () => {
      try {
        const res = await apiService.get<any>(API_ENDPOINTS.CAMPAIGNS);
        setCampaigns(res.data.results || []);
      } catch (err) {
        console.error("Error loading campaigns", err);
      }
    };
    fetchCampaigns();
  }, []);

 // Inside TransparencyHub.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const formData = new FormData();
  formData.append('campaign', selectedCampaign); // This is the ID
  formData.append('amount_spent', amountSpent);
  formData.append('description', description);
  if (file) formData.append('receipt_image', file);

  try {
    // Check your urls.py - it's likely /api/transparency-reports/
    // Try this simpler call
await apiService.post(
  '/api/transparency-reports/', 
  formData
  // Removed the { headers: ... } object that was causing the error
);
    setSuccess(true);
  } catch (err) {
    console.error(err);
    alert("Error uploading report. Ensure you are the owner of this campaign.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Transparency Hub</h1>
        <p className="text-slate-500 font-medium">Build trust by showing exactly how donations are spent.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        {success ? (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Report Submitted!</h2>
            <p className="text-slate-500 mb-6">Your transparency report is now attached to the campaign.</p>
            <button onClick={() => setSuccess(false)} className="text-blue-600 font-bold hover:underline">
              Submit another report
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campaign Selection */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Select Campaign</label>
                <select
  required
  aria-label="Select campaign"
  value={selectedCampaign}
  onChange={(e) => setSelectedCampaign(e.target.value)}
  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
>

                  <option value="">Choose a campaign...</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              {/* Amount Spent */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Amount Spent (PKR)</label>
                <input 
                  type="number" 
                  required
                  placeholder="e.g. 5000"
                  value={amountSpent}
                  onChange={(e) => setAmountSpent(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Description of Expense</label>
              <textarea 
                required
                rows={3}
                placeholder="What was this money used for? (e.g. Bought 20 blankets)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Upload Receipt / Proof Image</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors">
                <input 
                  type="file" 
                  id="file-upload"
                  className="hidden" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                  <p className="text-sm text-slate-500">
                    {file ? <span className="text-blue-600 font-bold">{file.name}</span> : "Click to upload receipt photo"}
                  </p>
                </label>
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-4 bg-[#0F2854] text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <FileText size={20} />}
              {loading ? "Uploading..." : "Submit Transparency Report"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}