import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Calendar, Clock, User, X, ChevronRight } from 'lucide-react';
import { BlogPost } from '../types';

const BLOG_POSTS: BlogPost[] = [
  {
    id: "post1",
    title: "5 Signs Your Geneva Home's Siding is Harboring Mold",
    slug: "geneva-siding-mold-signs",
    summary: "Fences, siding, and shaded walls in Kane County can grow green mold easily. Here's how to spot the signs before it damages your home paint.",
    content: `Green, fuzzy or greyish-black spots on your siding aren't just ugly—they are actively harboring mold and mildew that thrives in Illinois' humid summers.

### Why Siding Mold Thrives in Geneva
With our mature shade trees in neighborhoods like Mill Creek and close proximity to the Fox River, Kane County properties have high natural humidity. This creates a perfect environment for airborne spores to lock onto your siding, particularly on the north-facing walls of your home that receive the least amount of sunlight.

### 5 Tell-Tale Signs of Harmful Growth:
1. **The Green Tint**: Look at your siding at an angle under sunlight. If there's a subtle green haze, spores have started multiplying.
2. **Black Speckling near Gutters**: Clogged gutters often splash dirty water back onto your siding, feeding black mildew.
3. **Chalky Residue**: Oxidation combined with mold forms a white, chalky coating that weakens vinyl.
4. **Musty Smell Around the Patio**: If you smell mold when sitting outside on your porch, it's often living on the nearby siding.
5. **Fading Siding Paint**: Mold releases enzymes that can permanently discolor and break down exterior home finishes.

### The College Dudes Fix
We don't blast siding with high-pressure water, which can force water *behind* your siding and cause wood rot. Instead, we use a specialized, eco-friendly soft-wash solution that sanitizes the mold at the root, ensuring it stays away 3x longer than traditional high-pressure cleaning, while keeping your hydrangeas and lawn 100% safe!`,
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    date: "June 28, 2026",
    author: "Jace Jessup (Co-Founder)",
    readTime: "4 min read"
  },
  {
    id: "post2",
    title: "The 'College Dudes' Difference: Why We Never Leave a Mess Behind",
    slug: "college-dudes-zero-mess-guarantee",
    summary: "Many pressure washing crews blast away grime but leave messy pooling, debris, and water spots. Here is our absolute zero-mess guarantee.",
    content: `We've all heard the horror stories: you hire a contractor, and they leave muddy footprints on the deck, splatter green mold onto your windows, or kill your front porch hydrangeas.

At College Dudes Power Cleaning, we run our business under one simple golden rule: **We treat your home exactly like we'd treat our own mom's house.**

### What \"Zero-Mess\" Really Means:
* **The Hand-Sweep Inspection**: After we finish power cleaning your siding or driveway, we manually sweep up any pooled water and hand-wipe surrounding trim or railings.
* **Window Rinsing**: Exterior washing can spray microscopic dirt onto window panes. We rinse every window clean with pure water before packing up.
* **Plant Protection Protocol**: Before we spray any cleaner, we saturate your landscaping and hydrangeas with fresh water. This creates an invisible barrier, shielding them from soap. We rinse them again after the job is done.
* **Equipment Care**: We never drag heavy, oily machines across your pristine grass. We leave our pressure pumps in the driveway and run lightweight, premium rubber hoses through your spigot.

By choosing us, you are not only getting a pristine, professional clean, but you are supporting local college students putting themselves through school. We bring absolute integrity to every single spigot!`,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    date: "June 15, 2026",
    author: "Tyler K. (Lead Crew Member)",
    readTime: "3 min read"
  },
  {
    id: "post3",
    title: "Eco-Friendly Cleaning: How We Protect Your Lawn and Pets",
    slug: "eco-friendly-cleaning-safe-solutions",
    summary: "Discover how we clean moldy driveways and trash cans using high-efficiency nozzles and biodegradable soaps that are completely safe for pets.",
    content: `Homeowners are rightfully concerned about chemical runoff. Standard bleach and harsh chemical solvents can strip the topcoat of concrete, leach into neighborhood streams, and harm local Geneva wildlife or household pets.

Here is a look behind the scenes at how we balance **maximum cleaning power** with **complete eco-consciousness**.

### 1. High-Volume, Not Just High-Pressure
Many amateur washers turn their pumps up to 4000 PSI to blast dirt away. This high pressure can erode concrete and strip vinyl. We use commercial-grade pumps that focus on high-volume water flow rather than destructive pressure. This means we wash away grease and dirt gently using less overall water!

### 2. Fully Biodegradable Soaps
Our cleaning soaps are made of plant-based surfactants that break down naturally into organic elements within 48 hours of contact. They work by breaking the bond between dirt and siding, meaning we don't need harsh chemical chemicals to get a perfect result.

### 3. Safe For Paws & Pets
Our formula is completely chlorine-free and safe for lawns. Once rinsed, it is 100% safe for dogs, cats, and kids to play on.

We are proud to keep Geneva beautiful—both by making homes look brand new and by keeping our local environment clean and sustainable!`,
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80",
    date: "May 29, 2026",
    author: "Jace Jessup (Co-Founder)",
    readTime: "3 min read"
  }
];

export default function BlogSection() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <section id="blog" className="py-20 bg-white relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 bg-[#f0f9f4] text-brand-green text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-brand-green/10">
            <BookOpen size={12} /> Neighborhood Advice
          </div>
          <h2 className="text-4xl font-black text-brand-navy tracking-tighter uppercase">
            The College Dudes Advice Portal
          </h2>
          <p className="text-slate-600">
            Professional tips on protecting your siding, sanitizing your waste bins, and maintaining your Geneva home's value.
          </p>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <article 
              id={`blog-card-${post.id}`}
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
            >
              {/* Blog Image */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest text-brand-navy px-2.5 py-1 rounded-full shadow-sm">
                  {post.readTime}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-400 text-xs font-bold">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><User size={12} /> {post.author.split(' ')[0]}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-brand-navy tracking-tight group-hover:text-brand-green transition">
                    {post.title}
                  </h3>
                  
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-brand-green font-bold text-sm mt-5 group-hover:translate-x-1 transition duration-200">
                  Read Article <ChevronRight size={16} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              id="blog-modal"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative z-10 flex flex-col"
            >
              {/* Sticky Header with Close */}
              <div className="sticky top-0 right-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex justify-between items-center z-20">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {selectedPost.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {selectedPost.readTime}</span>
                </div>
                <button 
                  id="close-blog-modal"
                  onClick={() => setSelectedPost(null)}
                  className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Post Header Image */}
              <div className="h-64 relative bg-slate-100 shrink-0">
                <img 
                  src={selectedPost.image} 
                  alt={selectedPost.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Post Content */}
              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-950 leading-tight tracking-tight">
                    {selectedPost.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 font-semibold">
                    Written by: <span className="text-slate-800">{selectedPost.author}</span>
                  </p>
                </div>

                <div className="prose prose-slate max-w-none text-slate-600 text-base leading-relaxed space-y-4 whitespace-pre-wrap">
                  {selectedPost.content}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
