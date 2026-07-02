import { Phone, Check, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  return (
    <>
      {/* Top Notification Banner */}
      <div className="bg-brand-navy text-white text-center py-2 px-4 text-[11px] font-black tracking-widest uppercase flex items-center justify-center gap-4 flex-wrap">
        <span className="flex items-center gap-1"><Check size={12} className="text-brand-green" /> SERVING GENEVA, ST. CHARLES & BATAVIA — KANE COUNTY'S LOCAL FAVORITES</span>
        <span className="hidden sm:inline text-white/30">•</span>
        <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-brand-green" /> ECO-FRIENDLY & LICENSED TEAM</span>
      </div>

      {/* Main Navigation */}
      <nav className="sticky top-0 bg-white/95 backdrop-blur-md z-40 border-b border-brand-bg py-4 px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="bg-brand-navy text-white w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-lg shadow-md shadow-brand-navy/10 group-hover:bg-[#122744] transition">
              CD
            </div>
            <div>
              <span className="block font-black text-lg tracking-tighter text-brand-navy uppercase leading-none">
                COLLEGE DUDES
              </span>
              <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest leading-none">
                Power Cleaning Co.
              </span>
            </div>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#services" className="hover:text-brand-green transition">Services</a>
            <a href="#quote-calculator" className="hover:text-brand-green transition">Instant Quote</a>
            <a href="#reviews" className="hover:text-brand-green transition">Reviews</a>
            <a href="#blog" className="hover:text-brand-green transition">Advice Blog</a>
          </div>

          {/* Click-to-call CTA */}
          <a
            href="tel:7063331557"
            className="flex items-center gap-2 bg-brand-green hover:bg-[#256a47] text-white text-xs md:text-sm font-black px-4 md:px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition hover:scale-[1.02]"
          >
            <Phone size={14} className="fill-current" />
            <span className="hidden sm:inline">Call Us:</span> (706) 333-1557
          </a>
        </div>
      </nav>
    </>
  );
}
