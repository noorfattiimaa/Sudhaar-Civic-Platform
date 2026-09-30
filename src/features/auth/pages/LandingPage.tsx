import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, ShieldCheck, Activity, Users,
  BarChart3, CheckCircle2, DollarSign, MapPin, 
  Heart, Menu, X 
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// --- ASSETS & SERVICES ---
import SudhaarLogo from "../../../assets/logo.png";
import { issuesService } from "../../../services/issues";

const HERO_IMAGE = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2613&auto=format&fit=crop";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // --- LIVE DATA STATE ---
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    active_citizens: 0,
    total_ngos: 0,
    success_rate: 0,
  });

  // --- OPTIMIZED SCROLL LISTENER ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- FETCH LIVE STATS ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await issuesService.getStats();
        if (response.data) {
          const apiStats = response.data as any;
          setStats({
            total: apiStats.total_reported || 0,
            resolved: apiStats.issues_resolved || 0,
            active_citizens: apiStats.total_users || 0,
            total_ngos: apiStats.total_ngos || 0,
            success_rate: apiStats.resolution_rate || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch landing stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-slate-50 font-sans overflow-x-hidden selection:bg-blue-200">
      
      {/* --- 1. SMART NAVBAR --- */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled || mobileMenuOpen
            ? "bg-white/95 backdrop-blur-md shadow-sm py-4" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* LOGO */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <img src={SudhaarLogo} alt="Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
            <span className={`text-2xl font-black tracking-tighter transition-colors ${
              isScrolled || mobileMenuOpen ? "text-slate-900" : "text-white"
            }`}>
              SUDHAAR.
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 items-center">
            {["Impact", "Features", "About"].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className={`text-sm font-bold transition-colors ${
                  isScrolled ? "text-slate-600 hover:text-blue-600" : "text-white/90 hover:text-white"
                }`}
              >
                {item}
              </a>
            ))}
            <div className="flex gap-4 ml-4">
              <Link to="/login" className={`px-5 py-2 font-bold transition-colors ${
                  isScrolled ? "text-slate-700 hover:text-blue-600" : "text-white hover:text-blue-200"
              }`}>
                Log In
              </Link>
              <Link 
                to="/register" 
                className={`px-6 py-2 font-bold rounded-xl transition-all shadow-lg active:scale-95 ${
                    isScrolled 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "bg-white text-blue-900 hover:bg-blue-50"
                }`}
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen 
              ? <X className="text-slate-900" /> 
              : <Menu className={isScrolled ? "text-slate-900" : "text-white"} />
            }
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-100 px-6 py-4 overflow-hidden"
            >
              <div className="flex flex-col gap-4">
                {["Impact", "Features", "About"].map((item) => (
                  <a key={item} href={`#${item.toLowerCase()}`} className="text-slate-600 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                    {item}
                  </a>
                ))}
                <div className="h-px bg-slate-100 my-2"></div>
                <Link to="/login" className="text-slate-900 font-bold py-2">Log In</Link>
                <Link to="/register" className="bg-blue-600 text-white font-bold py-3 rounded-xl text-center shadow-lg">
                  Sign Up
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- 2. HERO SECTION --- */}
      <div className="relative w-full h-[100dvh] min-h-[600px] flex flex-col justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img src={HERO_IMAGE} alt="City" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/20"></div>
        </div>

        <div className="relative z-10 w-full px-6">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20 backdrop-blur-sm w-fit">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-blue-200 text-xs font-bold tracking-widest uppercase">
                  Live in Narowal District
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
                Your Voice. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  Your City.
                </span>
              </h1>
              
              <p className="text-xl text-slate-300 max-w-lg leading-relaxed font-medium">
                Sudhaar empowers citizens to report civic issues, track real-time resolution, and hold authorities accountable with complete transparency.
              </p>
              
              <div className="pt-4 flex flex-wrap gap-4">
                <Link to="/register" className="group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg shadow-lg hover:bg-blue-500 transition-all hover:-translate-y-1">
                  Get Started
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="pt-8 flex items-center gap-8 border-t border-white/10 text-slate-400">
                 <div className="flex items-center gap-2">
                    <ShieldCheck className="text-emerald-400 h-5 w-5" />
                    <span className="text-sm font-semibold">Verified by Authorities</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Activity className="text-blue-400 h-5 w-5" />
                    <span className="text-sm font-semibold">Live Tracking</span>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* --- 3. STATS SECTION (LIVE DATA CONNECTED) --- */}
      <section id="impact" className="bg-white py-12 border-b border-slate-100 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
           <StatItem number={stats.total.toLocaleString()} label="Issues Reported" icon={BarChart3} color="text-blue-600" />
           <StatItem number={stats.resolved.toLocaleString()} label="Issues Resolved" icon={CheckCircle2} color="text-emerald-600" />
           <StatItem number={`${stats.active_citizens.toLocaleString()}+`} label="Active Citizens" icon={Users} color="text-amber-500" />
           <StatItem number={`${stats.success_rate}%`} label="Success Rate" icon={Activity} color="text-purple-600" />
        </div>
      </section>

      {/* --- 4. FEATURES SECTION --- */}
      <section id="features" className="pt-24 pb-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Core Features</h2>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">Empowering Citizens,<br/>Enabling Authorities.</h3>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Sudhaar bridges the gap between the public and the government with a suite of transparency and management tools.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
           <FeatureCard 
             icon={MapPin}
             title="Geolocated Reporting"
             desc="Pinpoint issues on an interactive map. Authorities see exactly where the problem is, reducing response time."
           />
           <FeatureCard 
             icon={CheckCircle2}
             title="Transparent Tracking"
             desc="Watch your report go from 'Pending' to 'Resolved'. Receive notifications at every step of the lifecycle."
           />
           <FeatureCard 
             icon={Heart}
             title="NGO Collaboration"
             desc="Directly fund projects verified by municipal authorities. See exactly how funds are utilized with our audit dashboard."
           />
        </div>
      </section>

      {/* --- 5. ABOUT SECTION --- */}
      <section id="about" className="py-24 px-6 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 mb-6">
              <span className="text-blue-700 text-xs font-bold tracking-wide uppercase">Our Mission</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
              Building a Better <br/>
              <span className="text-blue-600">Future, Together.</span>
            </h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              By connecting citizens directly with the Municipal Corporation and local NGOs, we turn complaints into data, and data into action. 
            </p>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Every report you file creates a transparent digital trail that ensures accountability and rapid response for the Narowal community.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1600&auto=format&fit=crop" 
                alt="Community" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- 6. CTA SECTION --- */}
      <section className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden text-center">
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-8">Ready to make a difference?</h2>
          <p className="text-slate-300 text-xl mb-10">
            Join the platform where voices become change. It takes less than 2 minutes to create an account and file your first report.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-10 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-blue-50 transition-all text-lg">
              Get Started Now
            </Link>
            <a href="#about" className="px-10 py-4 border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-lg">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center opacity-60 text-sm">
          <p>© 2025 Sudhaar Civic Management. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const StatItem: React.FC<any> = ({ number, label, icon: Icon, color }) => (
  <div className="text-center group">
    <div className={`mx-auto w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="text-3xl font-black text-slate-900 mb-1">{number}</div>
    <div className="text-slate-500 font-medium text-sm uppercase tracking-wider">{label}</div>
  </div>
);

const FeatureCard: React.FC<any> = ({ icon: Icon, title, desc }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="w-14 h-14 bg-blue-50 rounded-2xl text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
      <Icon className="w-7 h-7" />
    </div>
    <h4 className="text-xl font-bold text-slate-900 mb-3">{title}</h4>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);