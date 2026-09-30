import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        
        {/* Contact Info */}
        <div className="bg-blue-600 p-8 md:p-12 rounded-3xl text-white shadow-lg shadow-blue-600/20">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-8 font-bold text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-3xl font-black mb-6">Get in touch</h1>
          <p className="text-blue-100 mb-12 text-lg">Have a suggestion or need help? We'd love to hear from you.</p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/30 rounded-xl"><Mail className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-blue-200 uppercase font-bold tracking-wider">Email</p>
                <p className="font-medium">support@sudhaar.pk</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/30 rounded-xl"><Phone className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-blue-200 uppercase font-bold tracking-wider">Phone</p>
                <p className="font-medium">+92 300 1234567</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/30 rounded-xl"><MapPin className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-blue-200 uppercase font-bold tracking-wider">Office</p>
                <p className="font-medium">Technology Park, Lahore, Pakistan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
              <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Your Name" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <input type="email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
              <textarea rows={4} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" placeholder="How can we help?"></textarea>
            </div>
            <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}