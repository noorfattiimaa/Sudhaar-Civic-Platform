import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 rounded-xl">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Terms of Service</h1>
        </div>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <h3 className="text-xl font-bold text-slate-800 mt-8">1. Acceptance of Terms</h3>
          <p>By accessing or using Sudhaar, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>
          
          <h3 className="text-xl font-bold text-slate-800 mt-8">2. User Conduct</h3>
          <p>You agree to use the platform only for lawful purposes. You are prohibited from posting false reports, spam, or abusive content.</p>
          
          <h3 className="text-xl font-bold text-slate-800 mt-8">3. Termination</h3>
          <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
        </div>
      </div>
    </div>
  );
}