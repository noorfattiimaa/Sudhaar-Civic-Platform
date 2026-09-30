import React, { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Zap, Globe } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  imageSrc?: string;
}

// Memoized background layers for better performance
const BackgroundLayers = memo(() => (
  <>
    {/* Primary Grid with Radial Mask */}
    <div 
      className="absolute inset-0 opacity-[0.2] [background-image:linear-gradient(#1e293b_1.5px,transparent_1.5px),linear-gradient(90deg,#1e293b_1.5px,transparent_1.5px)] [background-size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
      aria-hidden="true"
    />
    
    {/* Fine Detail Sub-grid */}
    <div 
      className="absolute inset-0 opacity-[0.1] [background-image:linear-gradient(#1e293b_1px,transparent_1px),linear-gradient(90deg,#1e293b_1px,transparent_1px)] [background-size:10px_10px]"
      aria-hidden="true"
    />

    {/* Noise Texture */}
    <div 
      className="absolute inset-0 opacity-[0.05] pointer-events-none brightness-150 contrast-150" 
      style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
      }}
      aria-hidden="true"
    />

    {/* Dynamic Glow Effects */}
    <div 
      className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[140px] animate-pulse transition-all duration-1000"
      aria-hidden="true"
    />
    <div 
      className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"
      aria-hidden="true"
    />
  </>
));

BackgroundLayers.displayName = "BackgroundLayers";

// Branding component
const BrandingSection = memo(() => (
  <div className="relative z-10">
    <div className="group inline-flex items-center gap-4">
      <div 
        className="w-16 h-16 bg-white/[0.03] backdrop-blur-2xl rounded-[22px] flex items-center justify-center border border-white/10 shadow-2xl transition-transform duration-500 group-hover:rotate-6"
        aria-hidden="true"
      >
        <Building2 
          className="text-blue-500 w-8 h-8 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
          aria-label="Sudhaar logo"
        />
      </div>
      <div>
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase">
          Sudhaar<span className="text-blue-600">.</span>
        </h1>
        <span className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">
          Narowal Civic Portal
        </span>
      </div>
    </div>
    <div 
      className="h-[2px] w-32 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent mt-8 rounded-full"
      aria-hidden="true"
    />
  </div>
));

BrandingSection.displayName = "BrandingSection";

// Feature showcase section
const FeatureShowcase = memo(() => {
  const avatarLetters = ['A', 'B', 'C'];
  
  return (
    <div className="relative z-10 space-y-12">
      {/* Tagline */}
      <div className="max-w-sm">
        <div className="flex items-center gap-2 mb-4 text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em]">
          <Zap size={14} fill="currentColor" aria-hidden="true" />
          <span>Live Updates</span>
        </div>
        <p className="text-3xl text-slate-100 font-bold leading-[1.15] tracking-tight">
          "Building a digital bridge between citizens and solution."
        </p>
      </div>

      {/* Community Stats */}
      <div 
        className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/[0.05] rounded-[28px] backdrop-blur-sm w-fit"
        role="region"
        aria-label="Community statistics"
      >
        <div className="flex -space-x-3" role="group" aria-label="Community members">
          {avatarLetters.map((letter, index) => (
            <div 
              key={`avatar-${letter}`}
              className="w-10 h-10 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shadow-lg"
              aria-label={`Community member ${index + 1}`}
            >
              {letter}
            </div>
          ))}
          <div 
            className="w-10 h-10 rounded-full border-2 border-[#020617] bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg"
            aria-label="Over 1000 additional members"
          >
            +1k
          </div>
        </div>
        <div className="text-xs">
          <span className="block text-white font-bold tracking-tight">
            Community Verified
          </span>
          <span className="text-slate-500 font-medium">
            Join 1,240+ active users
          </span>
        </div>
      </div>
    </div>
  );
});

FeatureShowcase.displayName = "FeatureShowcase";

// Main component
const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle 
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-blue-600 selection:text-white">
      
      {/* LEFT: DECORATIVE PANEL - FIXED */}
      <aside 
        className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-1/2 overflow-hidden bg-[#020617] flex-col justify-between p-20"
        aria-label="Decorative branding panel"
      >
        <BackgroundLayers />
        <BrandingSection />
        <FeatureShowcase />
      </aside>

      {/* RIGHT: FORM CONTAINER - WITH LEFT MARGIN TO OFFSET FIXED PANEL */}
      <main className="w-full lg:w-1/2 lg:ml-[50%] flex flex-col justify-center px-10 sm:px-20 md:px-32 py-16 relative min-h-screen">
        
        {/* Back Navigation - IMPROVED STYLING */}
        <Link 
          to="/" 
          className="group absolute top-8 left-10 md:left-32 inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-all no-underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow"
          aria-label="Go back to hub"
        >
          <ArrowLeft 
            className="w-4 h-4 transition-transform group-hover:-translate-x-1" 
            aria-hidden="true"
          />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Back to Hub
          </span>
        </Link>

        {/* Form Content */}
        <div className="max-w-md w-full mx-auto">
          <header className="mb-12">
            {/* District Badge - IMPROVED STYLING */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm"
              role="status"
            >
              <Globe size={14} className="text-blue-500" aria-hidden="true" />
              <span>Narowal District</span>
            </div>
            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-[0.95]">
              {title}
            </h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              {subtitle}
            </p>
          </header>

          <section className="relative">
            {children}
          </section>
          
          <footer className="mt-12 pt-8 border-t border-slate-50 text-center lg:text-left">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              &copy; {currentYear} Sudhaar Project Narowal • Secure 256-bit SSL
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

// Export memoized component for performance
export default memo(AuthLayout);