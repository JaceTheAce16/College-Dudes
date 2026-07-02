import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType, getAccessToken, googleSignIn } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { 
  User, 
  Phone, 
  MapPin, 
  Check, 
  Sparkles, 
  Home, 
  Trash2, 
  Droplets, 
  ArrowRight, 
  ArrowLeft, 
  Percent, 
  Calendar,
  Lock,
  Star,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Lead } from '../types';
import { createGoogleCalendarEvent } from '../lib/calendar';

export default function QuoteCalculator() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [isBooked, setIsBooked] = useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [calendarSynced, setCalendarSynced] = useState(false);
  
  // Scheduling State
  const [wantToSchedule, setWantToSchedule] = useState(true);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  const getAvailableDates = () => {
    const dates: { dateStr: string; label: string; weekday: string }[] = [];
    const d = new Date();
    
    let attempts = 0;
    while (dates.length < 6 && attempts < 35) {
      attempts++;
      d.setDate(d.getDate() + 1);
      if (d.getDay() === 0) continue; // Skip Sunday

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      dates.push({ dateStr, label, weekday });
    }
    return dates;
  };

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  // Services state
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [drivewaySize, setDrivewaySize] = useState<'none' | 'small' | 'medium' | 'large'>('none');
  const [paymentOption, setPaymentOption] = useState<'pay_later' | 'pre_pay_save_10'>('pay_later');
  
  // Validation error state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Constants
  const PRICING = {
    siding: 150,      // Two-story flat rate
    oneCan: 35,       // Single trash can inside/out
    twoCans: 55,      // Both trash cans (trash + recycling)
    drivewaySmall: 80,  // Small driveway ~400 sqft @ $0.20
    drivewayMedium: 160, // Medium driveway ~800 sqft @ $0.20
    drivewayLarge: 240,  // Large driveway ~1200 sqft @ $0.20
  };

  const getDrivewaySqFt = () => {
    switch(drivewaySize) {
      case 'small': return 400;
      case 'medium': return 800;
      case 'large': return 1200;
      default: return 0;
    }
  };

  const calculateBreakdown = () => {
    let base = 0;
    let savings = 0;
    let isBundleApplied = false;

    // Check for bundle discount: Siding Wash ($150) + Both Trash Cans ($55) = $205.
    // Bundle price is $195. Savings = $10.
    const hasSiding = selectedServices.includes('siding');
    const hasBothCans = selectedServices.includes('twoCans');

    if (hasSiding && hasBothCans) {
      base += 195; // Bundled price
      savings += 10;
      isBundleApplied = true;
    } else {
      if (hasSiding) base += PRICING.siding;
      if (selectedServices.includes('oneCan')) base += PRICING.oneCan;
      if (hasBothCans) base += PRICING.twoCans;
    }

    // Add driveway/sidewalk
    if (drivewaySize === 'small') base += PRICING.drivewaySmall;
    else if (drivewaySize === 'medium') base += PRICING.drivewayMedium;
    else if (drivewaySize === 'large') base += PRICING.drivewayLarge;

    // Pre-pay discount (10%)
    const discount = paymentOption === 'pre_pay_save_10' ? Math.round(base * 0.10) : 0;
    const finalTotal = base - discount;

    return {
      subtotal: base + (isBundleApplied ? 10 : 0),
      savings: savings,
      discount: discount,
      total: finalTotal,
      isBundle: isBundleApplied
    };
  };

  const { subtotal, savings, discount, total, isBundle } = calculateBreakdown();

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      // If choosing twoCans, deselect oneCan
      if (serviceId === 'twoCans') {
        const filtered = prev.filter(s => s !== 'oneCan');
        return filtered.includes('twoCans') ? filtered.filter(s => s !== 'twoCans') : [...filtered, 'twoCans'];
      }
      // If choosing oneCan, deselect twoCans
      if (serviceId === 'oneCan') {
        const filtered = prev.filter(s => s !== 'twoCans');
        return filtered.includes('oneCan') ? filtered.filter(s => s !== 'oneCan') : [...filtered, 'oneCan'];
      }
      
      return prev.includes(serviceId) ? prev.filter(s => s !== serviceId) : [...prev, serviceId];
    });
  };

  const validateStep1 = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) errs.name = 'Please tell us your name';
    if (!phone.trim()) errs.phone = 'We need a phone number to confirm bookings';
    else if (!/^\+?[0-9\s\-()]{7,15}$/.test(phone)) errs.phone = 'Please enter a valid phone number';
    if (!address.trim()) errs.address = 'Please enter your service address';
    else if (!address.toLowerCase().includes('geneva') && !address.toLowerCase().includes('kane') && !address.toLowerCase().includes('il') && address.length < 5) {
      errs.address = 'We only service Geneva & Kane County, IL areas. Please specify your address.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextToServices = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleCalculateQuote = async () => {
    if (selectedServices.length === 0 && drivewaySize === 'none') {
      setErrors({ services: 'Please select at least one service to clean!' });
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const activeServices = [...selectedServices];
      if (drivewaySize !== 'none') {
        activeServices.push(`driveway-${drivewaySize}`);
      }

      const newLead: any = {
        name,
        phone,
        address,
        services: activeServices,
        totalEstimate: total,
        status: 'pending',
        paymentOption: paymentOption,
        paymentStatus: 'unpaid',
        timestamp: new Date().toISOString()
      };

      if (email.trim()) {
        newLead.email = email.trim();
      }

      const sqFt = getDrivewaySqFt();
      if (sqFt > 0) {
        newLead.drivewaySqFt = sqFt;
      }

      const docRef = await addDoc(collection(db, 'leads'), newLead);
      setLeadId(docRef.id);
      setStep(3);
    } catch (e) {
      console.error("Error creating lead: ", e);
      setErrors({ submit: "Something went wrong. Let's try again!" });
      handleFirestoreError(e, OperationType.CREATE, 'leads');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPaymentOption = async (option: 'pay_later' | 'pre_pay_save_10') => {
    setPaymentOption(option);
    if (!leadId) return;

    try {
      // Update existing lead in firebase with their preferred booking flow
      const updatedTotal = option === 'pre_pay_save_10' ? Math.round(total * 0.90) : total;
      await updateDoc(doc(db, 'leads', leadId), {
        paymentOption: option,
        totalEstimate: updatedTotal
      });
    } catch (e) {
      console.error("Error updating payment option: ", e);
      handleFirestoreError(e, OperationType.UPDATE, `leads/${leadId}`);
    }
  };

  const handleConfirmBooking = async () => {
    setIsBooked(true);

    // Save scheduled date/time and status update to Firestore
    if (leadId) {
      try {
        const updateFields: any = {};
        if (wantToSchedule) {
          updateFields.scheduledDate = scheduledDate;
          updateFields.scheduledTimeSlot = scheduledTimeSlot;
          updateFields.status = 'scheduled'; // Upgrade status to scheduled!
        }
        await updateDoc(doc(db, 'leads', leadId), updateFields);
      } catch (err) {
        console.error("Error saving schedule details to Firestore lead:", err);
      }
    }

    // Try to auto-sync if we have an active in-memory Google Calendar OAuth token
    const token = await getAccessToken();
    if (token && leadId) {
      try {
        const activeServices = [...selectedServices];
        if (drivewaySize !== 'none') {
          activeServices.push(`driveway-${drivewaySize}`);
        }

        await createGoogleCalendarEvent(token, {
          name,
          phone,
          email: email || undefined,
          address,
          services: activeServices,
          totalEstimate: total,
          paymentOption,
          scheduledDate: wantToSchedule ? scheduledDate : undefined,
          scheduledTimeSlot: wantToSchedule ? scheduledTimeSlot : undefined
        });

        // Update firestore that it's successfully synced
        await updateDoc(doc(db, 'leads', leadId), {
          syncedToCalendar: true
        });

        setCalendarSynced(true);
        console.log("Successfully auto-synced lead to Google Calendar!");
      } catch (err) {
        console.error("Auto-sync to Google Calendar failed:", err);
      }
    }
  };

  const handleCustomerSyncCalendar = async () => {
    setIsSyncingCalendar(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const result = await googleSignIn();
        token = result?.accessToken || null;
      }

      if (token && leadId) {
        const activeServices = [...selectedServices];
        if (drivewaySize !== 'none') {
          activeServices.push(`driveway-${drivewaySize}`);
        }

        await createGoogleCalendarEvent(token, {
          name,
          phone,
          email: email || undefined,
          address,
          services: activeServices,
          totalEstimate: total,
          paymentOption,
          scheduledDate: wantToSchedule ? scheduledDate : undefined,
          scheduledTimeSlot: wantToSchedule ? scheduledTimeSlot : undefined
        });

        await updateDoc(doc(db, 'leads', leadId), {
          syncedToCalendar: true
        });

        setCalendarSynced(true);
      }
    } catch (err) {
      console.error("Customer manual calendar sync failed:", err);
      alert(`Could not add to calendar: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  return (
    <div id="quote-calculator" className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 md:p-8 relative overflow-hidden">
      {/* Absolute Decorative Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-green to-transparent rounded-bl-full pointer-events-none opacity-10" />

      {/* Header Wizard Steps */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="bg-brand-navy text-white w-7 h-7 rounded-full flex items-center justify-center font-black text-sm">
            {step}
          </div>
          <span className="font-black text-brand-navy text-sm md:text-base uppercase tracking-tight">
            {step === 1 && "1. Your Contact Info"}
            {step === 2 && "2. Custom Clean Package"}
            {step === 3 && "3. Your Instant Quote!"}
          </span>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Step {step} of 3
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Let's Get Your Quote! ⚡</h3>
              <p className="text-sm text-slate-500 mt-1">
                Enter your details to calculate flat-rates for your Geneva / Kane County home.
              </p>
            </div>

            <div className="space-y-4">
              {/* Name Input */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="quote-name"
                    type="text"
                    required
                    placeholder="e.g. Michael Smith"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-200 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 outline-none transition font-medium"
                  />
                </div>
                {errors.name && <span className="text-xs text-rose-500 font-semibold mt-1 block">{errors.name}</span>}
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Phone Number (for confirmation)
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="quote-phone"
                    type="tel"
                    required
                    placeholder="e.g. (706) 333-1557"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-200 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 outline-none transition font-medium"
                  />
                </div>
                {errors.phone && <span className="text-xs text-rose-500 font-semibold mt-1 block">{errors.phone}</span>}
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email Address (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                  <input
                    id="quote-email"
                    type="email"
                    placeholder="e.g. mike@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-200 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 outline-none transition font-medium"
                  />
                </div>
              </div>

              {/* Address Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Address in Geneva / Kane County
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="quote-address"
                    type="text"
                    required
                    placeholder="e.g. 123 Maple St, Geneva, IL"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-200 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 outline-none transition font-medium"
                  />
                </div>
                {errors.address && <span className="text-xs text-rose-500 font-semibold mt-1 block">{errors.address}</span>}
              </div>
            </div>

            <button
              id="quote-step1-next"
              type="button"
              onClick={handleNextToServices}
              className="w-full bg-brand-navy text-white font-black py-4 px-6 rounded-2xl shadow-md hover:shadow-lg hover:bg-[#122744] active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              Next: Select Services <ArrowRight size={18} />
            </button>
            <p className="text-center text-[11px] text-slate-400 font-medium">
              🔒 We never spam. Your info is safe and strictly used for Geneva scheduling.
            </p>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select Services To Clean 🧼</h3>
              <p className="text-sm text-slate-500 mt-1">
                Flat rates straight from our rack card. Choose what you need cleaned.
              </p>
            </div>

            {/* Error badge */}
            {errors.services && (
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold text-center border border-rose-100">
                {errors.services}
              </div>
            )}

            {/* Service Selection Cards */}
            <div className="space-y-3">
              {/* Siding Wash Card */}
              <div 
                id="service-siding"
                onClick={() => toggleService('siding')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-4 select-none ${
                  selectedServices.includes('siding') 
                    ? 'border-brand-green bg-[#f0f9f4]' 
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                }`}
              >
                <div className={`mt-1 p-2 rounded-xl ${selectedServices.includes('siding') ? 'bg-brand-green text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Home size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-800 text-base">Exterior Siding Wash</span>
                    <span className="font-black text-brand-green text-lg">$150</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Complete house wash (up to 2 stories). High-volume, low-pressure soft wash protecting your paint & landscaping.
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center self-center ${selectedServices.includes('siding') ? 'border-brand-green bg-brand-green text-white' : 'border-slate-300'}`}>
                  {selectedServices.includes('siding') && <Check size={14} strokeWidth={3} />}
                </div>
              </div>

              {/* Trash Cans Combo Grid/Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* One Can */}
                <div 
                  id="service-one-can"
                  onClick={() => toggleService('oneCan')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 select-none ${
                    selectedServices.includes('oneCan') 
                      ? 'border-brand-green bg-[#f0f9f4]' 
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${selectedServices.includes('oneCan') ? 'bg-brand-green text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Trash2 size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm truncate">Single Trash Can</div>
                    <div className="font-black text-brand-green text-sm mt-0.5">$35</div>
                    <p className="text-[10px] text-slate-400 mt-1">Sanitized inside/out, deodorized.</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center self-center ${selectedServices.includes('oneCan') ? 'border-brand-green bg-brand-green text-white' : 'border-slate-300'}`}>
                    {selectedServices.includes('oneCan') && <Check size={10} strokeWidth={3} />}
                  </div>
                </div>

                {/* Both Cans */}
                <div 
                  id="service-two-cans"
                  onClick={() => toggleService('twoCans')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 select-none ${
                    selectedServices.includes('twoCans') 
                      ? 'border-brand-green bg-[#f0f9f4]' 
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${selectedServices.includes('twoCans') ? 'bg-brand-green text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Trash2 size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm truncate">Both Trash Cans</div>
                    <div className="font-black text-brand-green text-sm mt-0.5">$55 <span className="text-[10px] text-brand-green font-bold ml-1">Saves $15</span></div>
                    <p className="text-[10px] text-slate-400 mt-1">Trash + recycling can deodorized.</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center self-center ${selectedServices.includes('twoCans') ? 'border-brand-green bg-brand-green text-white' : 'border-slate-300'}`}>
                    {selectedServices.includes('twoCans') && <Check size={10} strokeWidth={3} />}
                  </div>
                </div>
              </div>

              {/* Driveway & Sidewalk Selection */}
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-150 space-y-3">
                <div className="flex items-center gap-2">
                  <Droplets size={18} className="text-brand-green" />
                  <span className="font-bold text-slate-800 text-sm">Add Professional Driveway / Sidewalk Wash</span>
                </div>
                <p className="text-xs text-slate-500 leading-snug">
                  High-efficiency pressure cleaning removing oil stains, mildew, and weeds. Safe for pets and landscaping. Just $0.20/sqft!
                </p>
                <div className="grid grid-cols-4 gap-2 pt-1.5">
                  {(['none', 'small', 'medium', 'large'] as const).map((size) => (
                    <button
                      id={`driveway-size-${size}`}
                      key={size}
                      type="button"
                      onClick={() => setDrivewaySize(size)}
                      className={`py-2 px-1 text-center rounded-xl font-bold text-xs border transition ${
                        drivewaySize === size
                          ? 'border-brand-green bg-[#f0f9f4] text-brand-green shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {size === 'none' && 'Skip'}
                      {size === 'small' && 'Small (~$80)'}
                      {size === 'medium' && 'Medium (~$160)'}
                      {size === 'large' && 'Large (~$240)'}
                      {size !== 'none' && (
                        <span className="block text-[9px] font-medium text-slate-400">
                          {size === 'small' && '1-2 Car'}
                          {size === 'medium' && '2-3 Car'}
                          {size === 'large' && '3+ Car'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic Bundle Applied Banner */}
            {isBundle && (
              <motion.div 
                id="bundle-banner"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-900"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500 animate-pulse" />
                  <span className="text-xs font-bold">⚡ Neighborhood Bundle Applied!</span>
                </div>
                <span className="text-xs font-black bg-amber-500 text-white px-2 py-0.5 rounded-full">Saved $10</span>
              </motion.div>
            )}

            {/* Price Preview & Submit Button */}
            <div className="pt-2 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-4 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition flex items-center justify-center cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                id="quote-calculate-btn"
                type="button"
                onClick={handleCalculateQuote}
                disabled={isSubmitting}
                className="flex-1 bg-brand-yellow text-brand-navy font-black py-4 px-6 rounded-2xl shadow-md hover:bg-[#ebd34b] active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-base uppercase tracking-tight"
              >
                {isSubmitting ? 'Calculating...' : 'See My Instant Quote! ⚡'}
              </button>
            </div>
            {errors.submit && (
              <span className="text-xs text-rose-500 font-bold text-center block mt-1">{errors.submit}</span>
            )}
          </motion.div>
        )}

        {step === 3 && !isBooked && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div>
              <div className="w-12 h-12 bg-[#f0f9f4] text-brand-green rounded-full flex items-center justify-center mx-auto mb-3">
                <Check size={24} strokeWidth={3} />
              </div>
              <p className="text-xs uppercase font-black tracking-widest text-brand-green">Your Estimated Total</p>
              <h2 id="final-quote-price" className="text-6xl md:text-7xl font-black text-brand-navy tracking-tighter mt-1">
                ${total}
              </h2>
              {isBundle && (
                <span className="inline-block bg-brand-navy text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-widest mt-2">
                  Special Bundle Discount Applied
                </span>
              )}
            </div>

            {/* Price breakdown and details */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 text-left space-y-2.5 max-w-sm mx-auto">
              <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>Details for {name}</span>
                <span className="text-slate-400">Geneva, IL</span>
              </div>
              <div className="space-y-1.5 pt-1.5 border-t border-slate-200 text-sm font-medium text-slate-700">
                {selectedServices.includes('siding') && (
                  <div className="flex justify-between">
                    <span>Siding Wash</span>
                    <span>$150</span>
                  </div>
                )}
                {selectedServices.includes('oneCan') && (
                  <div className="flex justify-between">
                    <span>Single Trash Can</span>
                    <span>$35</span>
                  </div>
                )}
                {selectedServices.includes('twoCans') && (
                  <div className="flex justify-between">
                    <span>Both Trash Cans</span>
                    <span>$55</span>
                  </div>
                )}
                {drivewaySize !== 'none' && (
                  <div className="flex justify-between">
                    <span>Driveway Wash ({drivewaySize})</span>
                    <span>${drivewaySize === 'small' ? 80 : drivewaySize === 'medium' ? 160 : 240}</span>
                  </div>
                )}
                {isBundle && (
                  <div className="flex justify-between text-amber-600 font-bold">
                    <span>Neighborhood Bundle Saving</span>
                    <span>-$10</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Pre-Pay Discount (10%)</span>
                    <span>-${discount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Online Appointment Scheduler */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 max-w-lg mx-auto text-left">
              <div className="flex items-center justify-between">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={wantToSchedule}
                    onChange={(e) => setWantToSchedule(e.target.checked)}
                    className="w-5 h-5 text-brand-navy rounded border-slate-300 focus:ring-brand-navy focus:ring-2 cursor-pointer mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">Schedule Appointment Online Now</span>
                    <span className="text-[11px] text-slate-500 block">Secure your exact day & hour instantly (or opt-out to coordinate via phone call)</span>
                  </div>
                </label>
              </div>

              {wantToSchedule && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  {/* Select Date */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                      1. Select an Available Day (Mon - Sat)
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {getAvailableDates().map(({ dateStr, label, weekday }) => {
                        const isSelected = scheduledDate === dateStr;
                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => setScheduledDate(dateStr)}
                            className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-[9px] uppercase font-black tracking-tight opacity-75">
                              {weekday}
                            </span>
                            <span className="text-xs font-black mt-0.5">
                              {label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Select Time Slot */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                      2. Select a Preferred Time Window
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'morning', label: 'Morning Slot', hours: '9am - 12pm' },
                        { id: 'afternoon', label: 'Afternoon Slot', hours: '1pm - 4pm' },
                        { id: 'evening', label: 'Evening Slot', hours: '4pm - 7pm' },
                      ].map((slot) => {
                        const isSelected = scheduledTimeSlot === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setScheduledTimeSlot(slot.id as any)}
                            className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-xs font-black">{slot.label}</span>
                            <span className="text-[10px] font-semibold opacity-75">{slot.hours}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Payment Switcher */}
            <div className="space-y-3 max-w-sm mx-auto">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Secure Your Booking Slot & Choose Method
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                {/* Pre Pay Option */}
                <button
                  id="pay-prepay"
                  type="button"
                  onClick={() => handleSelectPaymentOption('pre_pay_save_10')}
                  className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition flex items-center justify-between ${
                    paymentOption === 'pre_pay_save_10'
                      ? 'border-brand-green bg-[#f0f9f4] shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${paymentOption === 'pre_pay_save_10' ? 'bg-brand-green text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Percent size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Pre-Pay Online</div>
                      <div className="text-xs text-brand-green font-semibold mt-0.5">Save an extra 10% instantly!</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900 text-base">${Math.round(subtotal * 0.90)}</div>
                    <div className="text-[10px] text-slate-400 font-medium">Stripe Secured</div>
                  </div>
                </button>

                {/* Pay Later Option */}
                <button
                  id="pay-later"
                  type="button"
                  onClick={() => handleSelectPaymentOption('pay_later')}
                  className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition flex items-center justify-between ${
                    paymentOption === 'pay_later'
                      ? 'border-brand-navy bg-brand-navy/5 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${paymentOption === 'pay_later' ? 'bg-brand-navy text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Book Now, Pay After</div>
                      <div className="text-xs text-slate-500 mt-0.5">No deposit needed. Pay on completion.</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900 text-base">${subtotal}</div>
                    <div className="text-[10px] text-slate-400 font-medium">Card/Cash/Check</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Booking submission outcome */}
            <div className="space-y-3 pt-2">
              <button
                id="booking-confirm-btn"
                onClick={handleConfirmBooking}
                className="w-full bg-brand-yellow text-brand-navy font-black py-4 rounded-2xl shadow-md hover:bg-[#ebd34b] transition uppercase tracking-tight text-sm cursor-pointer"
              >
                {paymentOption === 'pre_pay_save_10' ? 'Confirm & Go to Secured Checkout ⚡' : 'Lock In My Spot & Book Now!'}
              </button>
              
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                <Lock size={12} /> Securely encrypted • Supporting local college students
              </div>
            </div>
          </motion.div>
        )}

        {isBooked && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-6"
          >
            <div className="w-16 h-16 bg-[#eaf7f0] text-brand-green rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={36} className="text-brand-green" strokeWidth={3} />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-brand-navy uppercase tracking-tight">Spot Locked In! 🎉</h2>
              {wantToSchedule ? (
                <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Awesome <strong className="text-brand-navy">{name}</strong>! Your appointment is successfully scheduled for <strong className="text-brand-navy">{new Date(scheduledDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong> during the <strong className="text-brand-navy">{scheduledTimeSlot === 'morning' ? 'Morning Slot (9:00 AM - 12:00 PM)' : scheduledTimeSlot === 'afternoon' ? 'Afternoon Slot (1:00 PM - 4:00 PM)' : 'Evening Slot (4:00 PM - 7:00 PM)'}</strong>! We will call you within 2 hours to confirm details.
                </p>
              ) : (
                <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Awesome {name}! Your booking request is confirmed. We will call you at <strong className="text-brand-navy">{phone}</strong> within 2 hours to coordinate!
                </p>
              )}
            </div>

            {/* Google Calendar Optional Button for customers/testers */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 max-w-sm mx-auto space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center justify-center gap-1.5">
                <Calendar size={14} className="text-brand-navy" /> Keep Track of Your Booking
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add this service appointment directly to your Google Calendar so you don't forget.
              </p>

              {calendarSynced ? (
                <div className="flex items-center justify-center gap-1.5 text-brand-green font-bold text-xs bg-[#f0f9f4] border border-brand-green/20 py-2.5 rounded-xl shadow-sm">
                  <Check size={14} strokeWidth={3} /> Added to Google Calendar!
                </div>
              ) : (
                <button
                  onClick={handleCustomerSyncCalendar}
                  disabled={isSyncingCalendar}
                  className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSyncingCalendar ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-brand-navy" /> Adding to Calendar...
                    </>
                  ) : (
                    <>
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: '14px', height: '14px' }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                      Add to Google Calendar
                    </>
                  )}
                </button>
              )}
            </div>

            <button
              onClick={() => {
                // Reset calculator
                setStep(1);
                setIsBooked(false);
                setCalendarSynced(false);
                setSelectedServices(['siding']);
                setDrivewaySize('none');
                setPaymentOption('pay_later');
                setLeadId(null);
              }}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              Calculate Another Quote
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
