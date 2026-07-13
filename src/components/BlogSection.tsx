import { BookOpen, Calendar, User, ChevronRight } from 'lucide-react';
import { Link } from './Router';
import { BLOG_POSTS } from '../data/blogPosts';

interface BlogSectionProps {
  hideHeader?: boolean;
  noPadding?: boolean;
}

export default function BlogSection({ hideHeader = false, noPadding = false }: BlogSectionProps = {}) {
  return (
    <section id="blog" className={`${noPadding ? '' : 'py-20'} bg-white relative`}>
      <div className="max-w-6xl mx-auto px-6">
        {!hideHeader && (
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
        )}

        {/* Blog Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <div key={post.id} className="h-full">
              <Link 
                id={`blog-card-${post.id}`}
                to={`/blog/${post.slug}`}
                className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
              >
                <article className="flex flex-col h-full">
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
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
