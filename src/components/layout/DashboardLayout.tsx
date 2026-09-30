import { useState, useEffect } from "react";
import { Outlet, NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, X, ChevronDown } from "lucide-react";
import Footer from "@/components/layout/Footer"; 
import logoImg from "@/assets/logo.png";
import { authService } from "@/services/auth";

// Types
interface NavItem {
  label: string;
  path: string;
  roles: string[]; // Added roles for filtering
}

interface UserData {
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  organization_name?: string;
}

// Helper functions (kept your existing ones)
const getInitials = (firstName?: string, lastName?: string, username?: string, email?: string): string => {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.substring(0, 2).toUpperCase();
  if (username) return username.substring(0, 2).toUpperCase();
  if (email) return email.substring(0, 2).toUpperCase();
  return "U";
};

const getDisplayName = (user: UserData): string => {
  if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
  if (user.first_name) return user.first_name;
  if (user.username) return user.username;
  return user.email.split('@')[0];
};

const getRoleDisplay = (role?: string): string => {
  if (!role) return "Citizen";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

// Top Navbar Component
const TopNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Define Navigation Items with Role Access
  const allNavItems: NavItem[] = [
    { label: "Dashboard", path: "/dashboard", roles: ["citizen", "ngo", "official", "government official"] },
    { label: "Transparency", path: "/transparency", roles: ["citizen", "ngo", "official", "government official"] },
    { 
      label: userData?.role?.toLowerCase() === "ngo" ? "My Campaigns" : "NGO", 
      path: "/donate", 
      roles: ["citizen", "ngo"] 
    },
    { label: "My Reports", path: "/reports", roles: ["citizen"] },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('sudhaar_user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUserData(null);
    navigate('/login');
  };

  // 2. Filter Navigation based on role
  const currentUserRole = userData?.role?.toLowerCase() || "citizen";
  const navItems = allNavItems.filter(item => item.roles.includes(currentUserRole));

  const displayName = userData ? getDisplayName(userData) : "User";
  const userInitials = userData ? getInitials(userData.first_name, userData.last_name, userData.username, userData.email) : "U";
  const roleDisplay = getRoleDisplay(userData?.role);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300 ${isScrolled ? "bg-white/95 shadow-lg h-14" : "bg-white/90 shadow-md h-16"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <img src={logoImg} alt="Logo" className={`w-auto transition-all ${isScrolled ? "h-8" : "h-10"}`} />
            <span className="text-xl font-black text-[#0F2854]">SUDHAAR</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `relative px-4 py-2 text-sm font-bold transition-all ${isActive ? "text-[#0F2854]" : "text-slate-500 hover:text-[#0F2854]"}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200 relative" data-profile-menu>
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 hover:bg-[#0F2854]/5 rounded-xl px-3 py-2 transition-all">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-700">{displayName}</span>
                  <span className="text-xs text-slate-500">{roleDisplay}</span>
                </div>
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-blue-200">
                  {userInitials}
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2">
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-600">
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-xl">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700">
                {item.label}
              </NavLink>
            ))}
            <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-600 font-medium">Sign Out</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col"> 
      <TopNavbar />
      <main className="pt-16 flex-grow"> 
        <Outlet />
      </main>
      <Footer /> 
    </div>
  );
}