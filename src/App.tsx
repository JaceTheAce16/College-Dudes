import Navbar from './components/Navbar';
import QuoteCalculator from './components/QuoteCalculator';
import ReviewsSection from './components/ReviewsSection';
import BlogSection from './components/BlogSection';
import OwnerDashboard from './components/OwnerDashboard';
import Footer from './components/Footer';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  Clock, 
  MapPin, 
  Droplets, 
  Star,
  Users,
  GraduationCap,
  CalendarCheck,
  Check
} from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-brand-bg font-sans text-brand-navy scroll-smooth">
      {/* Navbar & Banners */}
      <Navbar />

      {/* Hero Section & Quote Bento */}
      <header className="relative bg-gradient-to-b from-brand-bg via-brand-bg to-white pt-10 pb-20 px-6 overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-brand-navy/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Context Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#f0f9f4] border border-brand-green/20 text-brand-green font-black px-3.5 py-1.5 rounded-full text-xs uppercase tracking-widest">
              <Sparkles size={14} className="animate-pulse" /> Support Geneva College Students!
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-brand-navy font-display leading-[0.95] tracking-tighter">
              Geneva's Hardest <br />
              <span className="text-brand-green">Working</span> College Dudes.
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-lg">
              Professional-grade pressure washing that's completely eco-friendly and mess-free. We treat your home exactly like our own mom's house.
            </p>

            {/* Quick Benefits Checklist */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 font-bold text-slate-700 text-sm">
                <CheckCircle2 size={18} className="text-brand-green shrink-0" />
                <span>Zero-Mess Guarantee: Hand-sweeped & sparkling clean</span>
              </div>
              <div className="flex items-center gap-2.5 font-bold text-slate-700 text-sm">
                <CheckCircle2 size={18} className="text-brand-green shrink-0" />
                <span>100% Eco-Friendly: Safe for Kane County lawns & pets</span>
              </div>
              <div className="flex items-center gap-2.5 font-bold text-slate-700 text-sm">
                <CheckCircle2 size={18} className="text-brand-green shrink-0" />
                <span>Tuition-Backed: Every cleaning supports our college semesters</span>
              </div>
            </div>

            {/* Local Proof Badges */}
            <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-brand-navy text-white font-black flex items-center justify-center text-xs border-2 border-white">JJ</div>
                <div className="w-10 h-10 rounded-full bg-brand-green text-white font-black flex items-center justify-center text-xs border-2 border-white">TK</div>
                <div className="w-10 h-10 rounded-full bg-brand-yellow text-brand-navy font-black flex items-center justify-center text-xs border-2 border-white">DH</div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-black text-brand-navy text-sm">50+ Local Geneva Homes</span>
                  <div className="flex text-[#ebd34b]"><Star size={12} className="fill-current" /></div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Cleaned this month in Mill Creek & Eagle Brook!</p>
              </div>
            </div>
          </div>

          {/* Interactive Quote Wizard Bento */}
          <div className="lg:col-span-6">
            <QuoteCalculator />
          </div>
        </div>
      </header>

      {/* Local Neighborhood Banner Bar */}
      <section className="bg-[#f0f4ee] border-y border-[#dfebd9] py-4 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs font-black text-brand-green uppercase tracking-widest">
            ACTIVE CODES & TRUCKS IN GENEVA NEIGHBORHOODS THIS WEEK:
          </p>
          <div className="flex items-center justify-center gap-4 sm:gap-8 mt-2 flex-wrap text-sm font-black text-brand-navy">
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-brand-green" /> Mill Creek</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-brand-green" /> Eagle Brook</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-brand-green" /> Pepper Valley</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-brand-green" /> Fox Run</span>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section id="services" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1 text-xs font-black bg-[#f0f9f4] text-brand-green uppercase tracking-widest px-3 py-1 rounded-full border border-brand-green/10">
            <CheckCircle2 size={12} /> Clear Flat-Rates
          </div>
          <h2 className="text-4xl font-black text-brand-navy font-display tracking-tighter">
            Our Professional Core Services
          </h2>
          <p className="text-slate-600 text-base">
            No dynamic estimates or hidden fees. We bring our commercial pumps, premium soft brushes, and customized eco-soaps.
          </p>
        </div>

        {/* Services Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Siding Wash */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-navy" />
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-brand-navy/5 text-brand-navy flex items-center justify-center group-hover:bg-brand-navy group-hover:text-white transition duration-300">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-brand-navy tracking-tight uppercase text-sm">Exterior Siding Wash</h3>
                <div className="font-black text-brand-navy text-3xl">$150 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Flat rate</span></div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Complete house siding wash (up to 2 stories). We use a specialized "soft-wash" nozzle to gently lift green mold & organic mildew without stripping your home's exterior paint or forcing water behind siding.
              </p>
              <ul className="space-y-2 pt-2 text-xs font-bold text-slate-700">
                <li className="flex items-center gap-2"><Check size={14} className="text-brand-green" /> High-volume soft rinse</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-brand-green" /> Hand-swept gutters outer finish</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-brand-green" /> Eco-safe surfactant scrub</li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-50">
              <a href="#quote-calculator" className="block text-center py-3.5 px-4 bg-brand-navy/5 hover:bg-brand-navy/10 text-brand-navy font-black text-xs rounded-xl transition cursor-pointer uppercase tracking-wider">
                Select Siding Wash
              </a>
            </div>
          </div>

          {/* Card 2: Trash Can combo */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-green" />
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-[#f0f9f4] text-brand-green flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition duration-300">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-brand-navy tracking-tight uppercase text-sm">Trash Can Sanitization</h3>
                <div className="font-black text-brand-green text-3xl">$35 <span className="text-xs font-bold text-slate-400">/ 1 can</span> <span className="text-sm font-black text-brand-navy ml-1">$55 for both!</span></div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Stop the garage stink! We deep clean your waste & recycling bins inside and out. Using high-pressure 200° sanitized steam and organic pine deodorizer to eliminate bugs, maggots, and bacteria.
              </p>
              <ul className="space-y-2 pt-2 text-xs font-bold text-slate-700">
                <li className="flex items-center gap-2"><Check size={14} className="text-brand-green" /> Under-rim germ scrub</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-brand-green" /> Interior and exterior high-pressure rinse</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-brand-green" /> Organic pine scent deodorizer</li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-50">
              <a href="#quote-calculator" className="block text-center py-3.5 px-4 bg-brand-green/5 hover:bg-brand-green/10 text-brand-green font-black text-xs rounded-xl transition cursor-pointer uppercase tracking-wider">
                Select Trash Can Wash
              </a>
            </div>
          </div>

          {/* Card 3: Driveway/Sidewalk */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-600" />
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition duration-300">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-brand-navy tracking-tight uppercase text-sm">Driveway & Sidewalk Wash</h3>
                <div className="font-black text-amber-600 text-3xl">$0.20 <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">/ sqft</span></div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Restore curb appeal and safety. High-efficiency rotary pressure cleaning that extracts oil stains, black mold, tire marks, and stubborn weeds from your driveway, sidewalk, and back patio.
              </p>
              <ul className="space-y-2 pt-2 text-xs font-bold text-slate-700">
                <li className="flex items-center gap-2"><Check size={14} className="text-brand-green" /> Rotary surface cleaners (zero water lines)</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-brand-green" /> Plant-safe grease treatment</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-brand-green" /> Joint weed removal & post-rinse</li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-50">
              <a href="#quote-calculator" className="block text-center py-3.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 font-black text-xs rounded-xl transition cursor-pointer uppercase tracking-wider">
                Select Driveway Wash
              </a>
            </div>
          </div>
        </div>

        {/* Big Special Bundle Callout Card */}
        <div className="mt-12 bg-brand-navy text-white rounded-3xl p-6 md:p-10 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 border border-white/5 shadow-lg">
          {/* Subtle decoration vector */}
          <div className="absolute right-0 bottom-0 w-48 h-48 bg-gradient-to-tr from-brand-green/20 to-transparent rounded-tl-full pointer-events-none" />
          
          <div className="space-y-3.5 max-w-xl text-center md:text-left">
            <span className="inline-block bg-brand-green text-white font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">
              Neighborhood Favorite
            </span>
            <h3 className="text-2xl md:text-3xl font-black font-display tracking-tight leading-none uppercase">
              The "Everything" Geneva Bundle
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Combine Siding Wash ($150) + Both Trash Cans ($55) for just <span className="text-white font-bold">$195 flat</span>! Our calculator applies this discount automatically to save you immediate money.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 shrink-0 w-full md:w-auto">
            <div className="text-center">
              <span className="block text-[10px] font-black uppercase tracking-widest text-white/50">Total Price</span>
              <span className="font-black text-4xl md:text-5xl text-brand-yellow tracking-tight">$195 <span className="text-xs text-white/30 font-bold line-through">$205</span></span>
            </div>
            <a href="#quote-calculator" className="w-full md:w-auto bg-brand-yellow hover:bg-[#ebd34b] text-brand-navy font-black text-xs px-6 py-3.5 rounded-xl shadow-md hover:scale-[1.01] transition text-center cursor-pointer uppercase tracking-wider">
              Get Bundle Pricing Now ⚡
            </a>
          </div>
        </div>
      </section>

      {/* The College Dudes Difference - Trust Elements */}
      <section className="bg-white py-24 border-y border-[#dfebd9]/20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Visual Grid Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#f0f4ee]/30 p-6 rounded-2xl border border-brand-green/10 text-center space-y-2">
              <div className="text-3xl font-black text-brand-navy">50+</div>
              <h4 className="font-bold text-slate-800 text-sm">Geneva Homes</h4>
              <p className="text-xs text-slate-400 font-medium">Cleaned this season alone</p>
            </div>
            <div className="bg-[#f0f4ee]/30 p-6 rounded-2xl border border-brand-green/10 text-center space-y-2">
              <div className="text-3xl font-black text-brand-green">100%</div>
              <h4 className="font-bold text-slate-800 text-sm">Eco-Conscious</h4>
              <p className="text-xs text-slate-400 font-medium">Lawn-safe biodegradable soaps</p>
            </div>
            <div className="bg-[#f0f4ee]/30 p-6 rounded-2xl border border-brand-green/10 text-center space-y-2">
              <div className="text-3xl font-black text-amber-600">$0</div>
              <h4 className="font-bold text-slate-800 text-sm">Mess Left Behind</h4>
              <p className="text-xs text-slate-400 font-medium">We hand-sweep after washing</p>
            </div>
            <div className="bg-[#f0f4ee]/30 p-6 rounded-2xl border border-brand-green/10 text-center space-y-2">
              <div className="text-3xl font-black text-brand-navy">706</div>
              <h4 className="font-bold text-slate-800 text-sm">Local Code</h4>
              <p className="text-xs text-slate-400 font-medium">Active support Kane County team</p>
            </div>
          </div>

          {/* Text Story Column */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-[#f0f9f4] border border-brand-green/20 text-brand-green font-black px-3 py-1 rounded-full text-xs uppercase tracking-widest">
              <GraduationCap size={14} /> Meet the Dudes
            </div>
            
            <h2 className="text-4xl font-black font-display text-brand-navy tracking-tight leading-[0.95] uppercase">
              Why We Call Ourselves the College Dudes
            </h2>
            
            <p className="text-slate-600 text-base leading-relaxed">
              We aren't just a generic crew with a power washer. We are local college students putting ourselves through school. We founded College Dudes Power Cleaning to provide professional, elite-grade exterior cleanings while earning tuition money.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex gap-4 items-start">
                <div className="bg-brand-navy/5 text-brand-navy p-3 rounded-xl shrink-0"><ShieldCheck size={20} /></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Elite Soft-Washing Equipment</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">We use top-tier commercial-grade pumps and rubber hoses that deliver 10x the rinsing power of ordinary hoses without any surface damage.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="bg-[#f0f9f4] text-brand-green p-3 rounded-xl shrink-0"><Droplets size={20} /></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Lawn-Safe & Pet-Safe Guarantee</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">We pre-saturate all landscape plants and hydrangeas, shielding them fully, and use fully biodegradable cleansers that dissolve safely.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-amber-50 text-amber-700 p-3 rounded-xl shrink-0"><CalendarCheck size={20} /></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Punctual & Responsive</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">We schedule down to the exact hour and text you when our clean-truck is on the way. Supporting our tuition means supporting 5-star customer service.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsSection />

      {/* Advice Portal / Blog */}
      <BlogSection />

      {/* Owner Admin & Calendar Sync Portal */}
      <OwnerDashboard />

      {/* Footer */}
      <Footer />

      {/* Mobile Sticky click-to-call elements */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-brand-navy/95 backdrop-blur-md border-t border-white/5 p-3 flex items-center justify-between z-50 shadow-2xl">
        <div className="flex items-center gap-2 pl-2">
          <div className="bg-brand-green text-white w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm italic">CD</div>
          <div>
            <div className="text-[10px] text-white/50 font-black uppercase tracking-wider">Ready to Clean?</div>
            <div className="text-xs text-white font-black">College Dudes Geneva</div>
          </div>
        </div>
        <a 
          href="tel:7063331557" 
          className="flex items-center gap-1.5 bg-brand-green hover:bg-[#256a47] text-white font-black text-xs px-4 py-2.5 rounded-full shadow-lg"
        >
          <Phone size={12} className="fill-current" /> (706) 333-1557
        </a>
      </div>
    </div>
  );
}

