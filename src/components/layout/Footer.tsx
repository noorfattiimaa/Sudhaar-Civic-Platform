import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Twitter, Facebook, Instagram } from "lucide-react";
import logoImg from "@/assets/sudhaar_logo.png"; 

export default function Footer() {
  const currentYear = new Date().getFullYear();
  

  const links = [
    { title: "Quick Links", items: [
      { name: "Report Issue", path: "/dashboard" },
      { name: "Explore Map", path: "/map" },
      { name: "My Reports", path: "/reports" }, 
      { name: "NGO", path: "/donate" }, // <--- RENAMED TO NGO
    ]},
    { title: "Company", items: [
      { name: "About Us", path: "/about" },
      { name: "Our Mission", path: "/mission" },
      { name: "Contact", path: "/contact" },
      { name: "Terms & Privacy", path: "/legal" },
    ]},
  ];



  
const socialIcons = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com", color: "text-blue-500" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com", color: "text-blue-400" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com", color: "text-pink-500" },
];

  return (
    <footer className="w-full bg-slate-900 text-white pt-12 pb-6 mt-10 border-t-8 border-blue-600 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Logo, Links, and Contact */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-slate-700 pb-10">
          
          {/* Logo and Tagline (Col 1-2 on mobile, Col 1 on desktop) */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src={logoImg} 
                alt="Sudhaar Logo" 
                className="h-10 w-auto object-contain brightness-200 invert" 
                onError={(e) => e.currentTarget.style.display = 'none'} 
              />
              <span className="text-xl font-black tracking-tight text-white">SUDHAAR</span>
            </Link>
            <p className="text-slate-400 text-sm max-w-xs">
              Fix Your City. In One Click. Building transparent civic engagement.
            </p>
          </div>
          
          {/* Link Sections (Cols 3 & 4) */}
          {links.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-lg font-bold text-blue-300">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <Link to={item.path} className="text-slate-400 hover:text-white transition-colors text-sm">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Information (Col 5) */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h3 className="text-lg font-bold text-blue-300">Get In Touch</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" /> support@sudhaar.pk
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" /> +92 (300) 1234567
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0" /> Lahore, Pakistan
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section: Copyright and Social */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-6">
          <p className="text-slate-500 text-xs order-2 md:order-1 mt-4 md:mt-0">
            &copy; {currentYear} SUDHAAR. All rights reserved.
          </p>
          <div className="flex space-x-6 order-1 md:order-2">
            {socialIcons.map((social, index) => (
    <a 
  key={index} 
  href={social.href} 
  target="_blank" 
  rel="noopener noreferrer" 
  className="p-2 rounded-full bg-slate-800 hover:bg-blue-600 transition-colors"
  aria-label={social.name}   // ✅ string
>
  <social.icon className={`h-5 w-5 ${social.color} hover:text-white transition-colors`} />
</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}