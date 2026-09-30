import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import AuthLayout from "../../../components/layout/AuthLayout";
import { authService } from "../../../services/auth";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigate = useNavigate();
  
  // --- CORRECTED LOGIC HERE ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login({ email, password });
      
      // Check if we have data and the specific user object
      if (response.data && response.data.user) {
        const user = response.data.user;
        
        // 1. Store tokens & user object
        localStorage.setItem("accessToken", response.data.access);
        localStorage.setItem("refreshToken", response.data.refresh);
        localStorage.setItem("sudhaar_user", JSON.stringify(user));
        
        // 2. Standardize role check (Robust lowercase comparison)
        const userRole = (user.role || "").toLowerCase().trim();

        console.log("LOGIN SUCCESS:", { userRole }); // Debug log

        if (userRole === "ngo") {
          navigate("/dashboard/ngo"); // Must match your App.tsx route
        } else if (userRole === "citizen") {
          navigate("/dashboard");
        } else {
          navigate("/"); 
        }
      } else if (response.error) {
        // 3. Handle specific backend errors
        setError(response.error);
      }
    } catch (err) {
      console.error("Critical Login Error:", err);
      setError("Connection lost. Please check if the server is running.");
    } finally {
      setIsLoading(false);
    }
  };
  // ----------------------------

  // Email validation logic (Unchanged)
  const isEmailValid = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Please enter your details to sign in."
    >
      <form onSubmit={handleLogin} className="space-y-6 max-w-md w-full">
        
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            Email Address
            {email.length > 0 && (
              isEmailValid ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 animate-in fade-in zoom-in duration-200" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500 animate-in fade-in zoom-in duration-200" />
              )
            )}
          </label>
          <div className="relative group">
            <Mail 
              className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-all duration-200 ${
                emailFocused 
                  ? "text-blue-600 scale-110" 
                  : email.length > 0 
                    ? "text-slate-600" 
                    : "text-slate-400"
              }`} 
            />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              placeholder="you@example.com"
              className={`w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-xl focus:outline-none transition-all duration-200 font-medium text-slate-900 placeholder:text-slate-400 ${
                emailFocused
                  ? "border-blue-600 shadow-lg shadow-blue-600/10 scale-[1.01]"
                  : email.length > 0 && !isEmailValid
                    ? "border-amber-300 bg-amber-50/30"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
            />
            {email.length > 0 && isEmailValid && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 animate-in fade-in zoom-in duration-200" />
              </div>
            )}
          </div>
          {email.length > 0 && !isEmailValid && (
            <p className="text-xs text-amber-600 font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="h-3.5 w-3.5" />
              Please enter a valid email address
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              Password
              {password.length > 0 && (
                isPasswordValid ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 animate-in fade-in zoom-in duration-200" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 animate-in fade-in zoom-in duration-200" />
                )
              )}
            </label>
          </div>
          <div className="relative group">
            <Lock 
              className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-all duration-200 ${
                passwordFocused 
                  ? "text-blue-600 scale-110" 
                  : password.length > 0 
                    ? "text-slate-600" 
                    : "text-slate-400"
              }`} 
            />
            <input 
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              placeholder="Enter your password"
              className={`w-full pl-12 pr-12 py-3.5 bg-white border-2 rounded-xl focus:outline-none transition-all duration-200 font-medium text-slate-900 placeholder:text-slate-400 ${
                passwordFocused
                  ? "border-blue-600 shadow-lg shadow-blue-600/10 scale-[1.01]"
                  : password.length > 0 && !isPasswordValid
                    ? "border-amber-300 bg-amber-50/30"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {password.length > 0 && !isPasswordValid && (
            <p className="text-xs text-amber-600 font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="h-3.5 w-3.5" />
              Password must be at least 6 characters
            </p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all cursor-pointer checked:scale-110"
            />
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors select-none">
              Remember me for 30 days
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-50/50 border-2 border-red-200 text-red-700 px-4 py-3.5 rounded-xl text-sm font-medium flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
            <div className="flex-1">
              <p className="font-bold text-red-800">Login Failed</p>
              <p className="text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isLoading || !isEmailValid || !isPasswordValid}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-xl group relative overflow-hidden active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="relative flex items-center gap-2.5">
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </>
            )}
          </div>
        </button>

        {/* Footer Link */}
        <div className="pt-6 border-t border-slate-200">
          <p className="text-center text-slate-500 font-medium">
            Don't have an account?{" "}
            <Link 
              to="/register" 
              className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors inline-flex items-center gap-1"
            >
              Sign up for free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
            <Shield className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-medium">Secure & Encrypted Login</span>
          </div>
        </div>

      </form>
    </AuthLayout>
  );
}