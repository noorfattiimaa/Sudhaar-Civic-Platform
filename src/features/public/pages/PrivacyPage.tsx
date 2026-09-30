import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Privacy Policy</h1>
        </div>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <p><strong>Last Updated:</strong> December 2025</p>
          <p>At Sudhaar, we take your privacy seriously. This policy describes how we collect and use your data.</p>
          
          <h3 className="text-xl font-bold text-slate-800 mt-8">1. Data We Collect</h3>
          <p>We collect information you provide directly to us, such as when you create an account, report an issue, or communicate with us. This includes your name, email, and geolocation data for issue reporting.</p>
          
          <h3 className="text-xl font-bold text-slate-800 mt-8">2. How We Use Your Data</h3>
          <p>We use your data to facilitate civic engagement, including verifying issue reports, coordinating with municipal authorities, and providing you with updates on your reported issues.</p>
          
          <h3 className="text-xl font-bold text-slate-800 mt-8">3. Data Security</h3>
          <p>We implement appropriate technical measures to protect your personal data against unauthorized access or disclosure.</p>
        </div>
      </div>
    </div>
  );
}