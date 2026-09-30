import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Target, FileText, Image as ImageIcon,
  Loader2, CheckCircle, AlertCircle, Megaphone, Trash2
} from 'lucide-react';
import { apiService } from '../../../services/api';
import { API_ENDPOINTS } from '../../../config/api';
import { Link } from "react-router-dom";

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORY_OPTIONS = [
  { value: "Health", label: "Health" },
  { value: "Education", label: "Education" },
  { value: "Environment", label: "Environment" },
  { value: "Civic", label: "Civic" },
  { value: "Sanitation", label: "Sanitation" },
  { value: "Water", label: "Water" },
  { value: "Electricity", label: "Electricity" },
];

export default function CreateCampaignModal({ isOpen, onClose, onSuccess }: CreateCampaignModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    goal: "",
    description: "",
    category: "",
    zakat_eligible: false
  });

  // Cleanup preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please upload a campaign banner image.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 1. MATCH THE KEYS: Change 'goal_amount' to 'target_amount'
      const additionalData = {
        title: formData.title,
        description: formData.description,
        goal_amount: formData.goal, // MATCHED with Django Serializer
        category: formData.category,
        zakat_eligible: formData.zakat_eligible // Send as actual boolean
      };

      const response = await apiService.uploadFile<any>(
        API_ENDPOINTS.CAMPAIGNS,
        selectedFile,
        additionalData
      );

      // 2. CHECK STATUS: 201 means "Created"
      if (response.status === 201 || !response.error) {
        setShowSuccess(true);
        if (onSuccess) onSuccess();
      } else {
        // This catches the IndentationError or validation errors
        const errorMsg = typeof response.error === 'object'
          ? JSON.stringify(response.error)
          : response.error;
        setError(`Submission Failed: ${errorMsg}`);
      }
    } catch (err: any) {
      setError("Network error. Is the Django server running?");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
          className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Megaphone className="text-blue-600" size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Start New Campaign</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
            {!showSuccess ? (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Image Upload Area */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Campaign Banner Image</label>
                  <div className={`relative group border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center overflow-hidden
                    ${previewUrl ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-400'}`}>

                    {previewUrl ? (
                      <div className="relative w-full h-48">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                            className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full h-40 flex flex-col items-center justify-center cursor-pointer">
                        <ImageIcon className="text-slate-300 mb-2" size={40} />
                        <span className="text-sm font-bold text-blue-600">Click to upload banner</span>
                        <span className="text-[10px] text-slate-400 mt-1 uppercase font-black">JPG, PNG up to 10MB</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase">Campaign Title</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        required type="text" placeholder="e.g. Clean Water Initiative"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase">Category</label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium appearance-none cursor-pointer"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="">Select...</option>
                      {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>

                  {/* Goal */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase">Goal (PKR)</label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        required type="number" placeholder="50000"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        value={formData.goal} onChange={e => setFormData({ ...formData, goal: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase">Mission Description</label>
                  <textarea
                    required rows={4} placeholder="Describe how these funds will be used..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none"
                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Zakat Checkbox */}
                <label className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border-2 
                  ${formData.zakat_eligible ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                  <input
                    type="checkbox" className="w-5 h-5 text-emerald-600 rounded-lg border-slate-300 focus:ring-emerald-500"
                    checked={formData.zakat_eligible} onChange={e => setFormData({ ...formData, zakat_eligible: e.target.checked })}
                  />
                  <div>
                    <span className="block text-sm font-bold text-emerald-900">Zakat Eligible</span>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">Enable for faith-based giving</span>
                  </div>
                </label>

                {error && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 text-red-600 text-xs font-bold bg-red-50 p-4 rounded-2xl border border-red-100">
                    <AlertCircle size={18} /> {error}
                  </motion.div>
                )}

                <button
                  type="submit" disabled={isLoading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Launching Initiative...
                    </>
                  ) : "Publish Campaign"}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="p-12 text-center space-y-6"
              >
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle size={48} className="text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900">Campaign Launched!</h3>
                  <p className="text-slate-500 font-medium">Your initiative is being reviewed and will be live shortly.</p>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-colors shadow-xl shadow-slate-200"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}