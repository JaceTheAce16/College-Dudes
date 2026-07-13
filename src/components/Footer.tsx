import { Phone, Heart, CheckCircle2 } from 'lucide-react';

const LOCAL_AREAS = [
  "Mill Creek",
  "Eagle Brook",
  "Pepper Valley",
  "Fox Run",
  "Sunset Prairie",
  "Geneva East",
  "Harrison Street District",
  "Randall Road Corridor"
];

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-slate-300 py-16 px-6 relative border-t border-white/5">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* About Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-brand-green text-white w-8 h-8 rounded-lg flex items-center justify-center font-black italic text-base">
              CD
            </div>
            <span className="font-black text-white text-base tracking-tight uppercase">
              COLLEGE DUDES
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            Founded by hard-working local college students. We bring professional-grade soft washing and pressure cleaning to Geneva neighborhoods to support our university tuition.
          </p>
          <div className="text-xs font-semibold text-slate-500">
            © {new Date().getFullYear()} College Dudes Power Cleaning. <br />All rights reserved.
          </div>
        </div>

        {/* Neighborhoods Served Column */}
        <div className="space-y-4">
          <h4 className="font-black text-sm text-white uppercase tracking-wider">
            Geneva Neighborhoods Served
          </h4>
          <ul className="grid grid-cols-2 gap-2 text-xs">
            {LOCAL_AREAS.map((area, idx) => (
              <li key={idx} className="flex items-center gap-1.5 text-slate-400">
                <CheckCircle2 size={10} className="text-brand-green shrink-0" />
                {area}
              </li>
            ))}
          </ul>
        </div>

        {/* Core Services Column */}
        <div className="space-y-4">
          <h4 className="font-black text-sm text-white uppercase tracking-wider">
            Our Cleaning Services
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><a href="#services" className="hover:text-white transition">Exterior House & Siding Soft Wash</a></li>
            <li><a href="#services" className="hover:text-white transition">Trash Can Sanitization Combo</a></li>
            <li><a href="#services" className="hover:text-white transition">High-Efficiency Driveway Pressure Wash</a></li>
            <li><a href="#services" className="hover:text-white transition">Eco-Friendly Soap Sidewalk Clean</a></li>
          </ul>
        </div>

        {/* Contact/Action Column */}
        <div className="space-y-4">
          <h4 className="font-black text-sm text-white uppercase tracking-wider">
            Get In Touch
          </h4>
          <div className="space-y-3 text-xs">
            <a 
              href="tel:7063331557" 
              className="flex items-center gap-2 text-brand-yellow hover:text-[#ebd34b] transition font-black text-sm"
            >
              <Phone size={14} className="fill-current" /> (706) 333-1557
            </a>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Have specific cleaning questions? Give us a call or estimate your flat rate with our instant calculator above.
            </p>
          </div>
        </div>
      </div>

      {/* Love Badge */}
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          Made with <Heart size={10} className="text-[#e06c75] fill-[#e06c75] animate-pulse" /> supporting local students in Kane County, IL.
        </div>
        <div className="flex gap-4">
          <a href="#privacy" className="hover:text-slate-400 transition">Privacy Policy</a>
          <span>•</span>
          <a href="#terms" className="hover:text-slate-400 transition">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
