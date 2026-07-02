import { useState, useEffect, FormEvent } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Star, CheckCircle2, MessageSquare, Send, Sparkles, MapPin } from 'lucide-react';
import { Review } from '../types';

const INITIAL_REVIEWS: Review[] = [
  {
    name: "Susan M.",
    location: "Mill Creek, Geneva",
    rating: 5,
    text: "The siding looks completely brand new! The dudes arrived right on time, explained exactly how they protect my hydrangeas, and did a spotless job. Hard workers and very polite!",
    date: "June 24, 2026",
    verified: true
  },
  {
    name: "Brad H.",
    location: "Eagle Brook, Geneva",
    rating: 5,
    text: "The trash can sanitizer is a game-changer. Our garage doesn't smell like rotting garbage anymore. Highly recommend the bundle with siding cleaning!",
    date: "June 18, 2026",
    verified: true
  },
  {
    name: "Karen L.",
    location: "Pepper Valley, Geneva",
    rating: 5,
    text: "So impressed with these hard-working college students! Highly professional, eco-friendly soaps, and perfect results on our driveway. Support them!",
    date: "June 12, 2026",
    verified: true
  }
];

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formText, setFormText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch reviews from firestore on mount
  useEffect(() => {
    async function fetchReviews() {
      try {
        const q = query(collection(db, 'reviews'), orderBy('date', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const fetched: Review[] = [];
        querySnapshot.forEach((doc) => {
          fetched.push(doc.data() as Review);
        });
        if (fetched.length > 0) {
          // Merge fetched reviews with initial ones to keep it populated
          setReviews([...fetched, ...INITIAL_REVIEWS]);
        }
      } catch (e) {
        console.error("Error fetching reviews from firestore, using default reviews: ", e);
        handleFirestoreError(e, OperationType.LIST, 'reviews');
      }
    }
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formText.trim()) return;
    setIsSubmitting(true);

    const newReview: Review = {
      name: formName,
      location: formLocation.trim() ? formLocation : "Geneva resident",
      rating: formRating,
      text: formText,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      verified: true
    };

    try {
      await addDoc(collection(db, 'reviews'), newReview);
      setReviews(prev => [newReview, ...prev]);
      setFormName('');
      setFormLocation('');
      setFormRating(5);
      setFormText('');
      setSuccessMsg("Thanks for your support! Your review is now live! ⭐");
      setShowReviewForm(false);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e) {
      console.error("Error saving review: ", e);
      handleFirestoreError(e, OperationType.CREATE, 'reviews');
    } finally {
      setIsSubmitting(false);
    }
  };  return (
    <section id="reviews" className="py-20 bg-brand-bg relative overflow-hidden">
      {/* Decorative vector shape */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-[#f0f9f4] text-brand-green text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-brand-green/10">
              <Star size={12} className="fill-current" /> Local Trust
            </div>
            <h2 className="text-4xl font-black text-brand-navy tracking-tighter uppercase">
              What Your Geneva Neighbors Are Saying
            </h2>
            <p className="text-slate-600 text-base">
              We treat every home like our own mom's house. Read honest experiences from families around Kane County.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={24} className="text-brand-yellow fill-brand-yellow" />
              ))}
              <span className="font-black text-xl text-brand-navy ml-2">4.9/5</span>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Based on 120+ happy homes
            </p>
            <button
              id="write-review-toggle"
              type="button"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-brand-navy hover:bg-[#122442] text-white font-black text-xs px-5 py-3 rounded-xl transition shadow-sm cursor-pointer uppercase tracking-wider"
            >
              Write a Review
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-4 bg-[#f0f9f4] border border-brand-green/20 text-brand-green rounded-2xl flex items-center gap-3 max-w-md mx-auto text-sm font-semibold">
            <Sparkles className="text-brand-green shrink-0" size={18} />
            {successMsg}
          </div>
        )}

        {/* Write Review Form Modal-like collapsible */}
        {showReviewForm && (
          <div className="max-w-lg mx-auto bg-white rounded-3xl p-6 shadow-xl border border-slate-150 mb-12">
            <h3 className="text-xl font-bold text-brand-navy mb-4 flex items-center gap-2">
              <MessageSquare className="text-brand-green" size={20} /> Share Your Experience!
            </h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Your Name</label>
                  <input
                    id="review-name"
                    type="text"
                    required
                    placeholder="e.g. Susan M."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-green text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Your Neighborhood</label>
                  <input
                    id="review-location"
                    type="text"
                    placeholder="e.g. Mill Creek, Geneva"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-green text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      id={`rating-star-${val}`}
                      key={val}
                      type="button"
                      onClick={() => setFormRating(val)}
                      className="p-1 cursor-pointer focus:outline-none transition hover:scale-110"
                    >
                      <Star
                        size={24}
                        className={val <= formRating ? "text-brand-yellow fill-brand-yellow" : "text-slate-200"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Your Review</label>
                <textarea
                  id="review-text"
                  required
                  rows={3}
                  placeholder="Tell us what you liked about our work..."
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-green text-sm font-medium resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-review-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-green hover:bg-[#256a47] text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Post Review'} <Send size={12} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Review Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={rev.id || idx}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                {/* Rating & Verified */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < rev.rating ? "text-brand-yellow fill-brand-yellow" : "text-slate-200"}
                      />
                    ))}
                  </div>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-[#f0f9f4] text-brand-green font-bold px-2 py-0.5 rounded-full border border-brand-green/10">
                      <CheckCircle2 size={10} /> Verified Job
                    </span>
                  )}
                </div>

                {/* Text */}
                <p className="text-slate-600 text-sm leading-relaxed italic">
                  "{rev.text}"
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-slate-100 mt-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-navy/5 flex items-center justify-center font-bold text-brand-navy text-sm">
                  {rev.name.slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{rev.name}</h4>
                  <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium">
                    <MapPin size={10} /> {rev.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
