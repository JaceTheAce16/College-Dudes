import { useState, useEffect } from 'react';
import { 
  db, 
  auth, 
  googleSignIn, 
  logout, 
  getAccessToken, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { createGoogleCalendarEvent, CalendarEventData } from '../lib/calendar';
import { 
  Calendar, 
  Check, 
  Loader2, 
  LogOut, 
  Shield, 
  RefreshCw, 
  AlertTriangle,
  User,
  Phone,
  MapPin,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

export default function OwnerDashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [syncStatus, setSyncStatus] = useState<Record<string, 'idle' | 'syncing' | 'success' | 'error'>>({});
  const [isOpen, setIsOpen] = useState(false);

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const accessToken = await getAccessToken();
        setToken(accessToken);
        fetchLeads();
      } else {
        setToken(null);
        setLeads([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        fetchLeads();
      }
    } catch (err) {
      console.error('Login to Google Calendar failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setLeads([]);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const q = query(collection(db, 'leads'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const fetchedLeads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeads(fetchedLeads);
    } catch (e) {
      console.error('Error fetching leads:', e);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const handleSyncToCalendar = async (lead: any) => {
    if (!token) {
      alert('Please connect your Google Calendar first!');
      return;
    }

    setSyncStatus(prev => ({ ...prev, [lead.id]: 'syncing' }));

    try {
      const eventData: CalendarEventData = {
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        address: lead.address,
        services: lead.services || [],
        totalEstimate: lead.totalEstimate,
        paymentOption: lead.paymentOption,
        scheduledDate: lead.scheduledDate,
        scheduledTimeSlot: lead.scheduledTimeSlot
      };

      await createGoogleCalendarEvent(token, eventData);

      // Update Firestore so we know it has been synced
      await updateDoc(doc(db, 'leads', lead.id), {
        syncedToCalendar: true
      });

      setSyncStatus(prev => ({ ...prev, [lead.id]: 'success' }));
      
      // Update local state
      setLeads(prev =>
        prev.map(l => (l.id === lead.id ? { ...l, syncedToCalendar: true } : l))
      );
    } catch (err) {
      console.error('Error syncing to calendar:', err);
      setSyncStatus(prev => ({ ...prev, [lead.id]: 'error' }));
      alert(`Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <section id="owner-portal" className="py-12 bg-slate-50 border-t border-slate-200 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-brand-navy/5 text-brand-navy text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-brand-navy/10">
              <Shield size={12} /> Owner Administration
            </div>
            <h2 className="text-3xl font-black text-brand-navy tracking-tight uppercase mt-2">
              Google Calendar Sync & Leads Panel
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Connect your Google Calendar to instantly sync booking requests from Geneva customers into your Google Calendar.
            </p>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-6 py-3 bg-brand-navy hover:bg-[#122744] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-sm transition cursor-pointer flex items-center gap-2"
          >
            {isOpen ? 'Close Administrative Panel' : 'Open Administrative Panel'}
          </button>
        </div>

        {isOpen && (
          <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            {/* Calendar Connection Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200 gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${token ? 'bg-[#f0f9f4] text-brand-green' : 'bg-amber-50 text-amber-500'}`}>
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">
                    {token ? 'Google Calendar Connected!' : 'Calendar Not Connected'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {token 
                      ? `Syncing active with account: ${user?.email}` 
                      : 'Connect your calendar to sync Geneva bookings to your Google Calendar.'}
                  </p>
                </div>
              </div>

              <div>
                {token ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    <LogOut size={14} /> Disconnect Calendar
                  </button>
                ) : (
                  <button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="gsi-material-button"
                    style={{ margin: 0, border: '1px solid #dadce0', borderRadius: '12px', background: 'white' }}
                  >
                    <div className="gsi-material-button-state"></div>
                    <div className="gsi-material-button-content-wrapper" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="gsi-material-button-icon" style={{ display: 'flex', alignItems: 'center' }}>
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: '18px', height: '18px' }}>
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                          <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents" style={{ fontSize: '13px', fontWeight: 'bold', color: '#3c4043' }}>
                        {isLoggingIn ? 'Connecting...' : 'Connect Google Calendar'}
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Leads Panel */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-black text-brand-navy uppercase text-sm tracking-wider">
                  Leads and Cleaning Booking Requests ({leads.length})
                </h3>
                {token && (
                  <button
                    onClick={fetchLeads}
                    disabled={isLoadingLeads}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition cursor-pointer"
                  >
                    <RefreshCw size={16} className={isLoadingLeads ? 'animate-spin' : ''} />
                  </button>
                )}
              </div>

              {isLoadingLeads ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="animate-spin text-brand-navy mr-2" />
                  <span className="text-slate-500 font-bold text-sm">Loading active leads...</span>
                </div>
              ) : !token ? (
                <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-slate-500 space-y-2">
                  <Shield size={32} className="mx-auto text-slate-300" />
                  <p className="font-bold text-sm">Access Restricted</p>
                  <p className="text-xs">Connect your Google Calendar account using the button above to view lead databases and calendar synchronization panels.</p>
                </div>
              ) : leads.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-xs font-bold uppercase">No leads found in Geneva system yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2">
                  {leads.map(lead => (
                    <div 
                      key={lead.id} 
                      className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-brand-navy text-base">{lead.name}</span>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            lead.paymentOption === 'pre_pay_save_10' 
                              ? 'bg-brand-green/10 text-brand-green' 
                              : 'bg-brand-navy/5 text-brand-navy'
                          }`}>
                            {lead.paymentOption === 'pre_pay_save_10' ? 'Pre-Paid' : 'Pay Later'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600 font-medium">
                          <span className="flex items-center gap-1.5"><Phone size={13} className="text-slate-400" /> {lead.phone}</span>
                          <span className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-400" /> {lead.address}</span>
                          <span className="flex items-center gap-1.5"><DollarSign size={13} className="text-slate-400" /> Quote: <strong className="text-brand-navy">${lead.totalEstimate}</strong></span>
                          <span className="flex items-center gap-1.5"><Briefcase size={13} className="text-slate-400" /> Services: {lead.services?.join(', ') || 'None'}</span>
                          {lead.scheduledDate ? (
                            <span className="flex items-center gap-1.5 col-span-1 sm:col-span-2 text-brand-green font-bold bg-[#f0f9f4] border border-brand-green/10 px-2 py-0.5 rounded-lg w-max"><Calendar size={13} /> Scheduled Online: {lead.scheduledDate} at {lead.scheduledTimeSlot === 'morning' ? '9:00 AM - 12:00 PM' : lead.scheduledTimeSlot === 'afternoon' ? '1:00 PM - 4:00 PM' : '4:00 PM - 7:00 PM'}</span>
                          ) : (
                            <span className="flex items-center gap-1.5 col-span-1 sm:col-span-2 text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-lg w-max"><Calendar size={13} /> Waiting for Callback Coordination</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-stretch md:self-auto border-t md:border-t-0 pt-3 md:pt-0">
                        {lead.syncedToCalendar ? (
                          <div className="flex items-center gap-1 text-brand-green font-bold text-xs bg-[#f0f9f4] border border-brand-green/20 px-3 py-2 rounded-xl">
                            <Check size={14} strokeWidth={3} /> Synced to Calendar
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSyncToCalendar(lead)}
                            disabled={syncStatus[lead.id] === 'syncing'}
                            className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-brand-yellow hover:bg-[#ebd34b] text-brand-navy font-black text-xs px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                          >
                            {syncStatus[lead.id] === 'syncing' ? (
                              <>
                                <Loader2 size={13} className="animate-spin" /> Syncing...
                              </>
                            ) : (
                              <>
                                <Calendar size={13} /> Sync to Google Calendar
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
