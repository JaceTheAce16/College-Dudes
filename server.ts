import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { render } from './src/entry-server';
import { BLOG_POSTS } from './src/data/blogPosts';
import { sendLeadEmail } from './src/lib/mail';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();
  
  // Enable parsing JSON bodies for lead submission
  app.use(express.json());

  // API endpoint for sending email notification of new quotes
  app.post('/api/quote-lead', async (req, res) => {
    try {
      const leadData = req.body;
      const result = await sendLeadEmail(leadData);
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      console.error('Error in /api/quote-lead route:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 1. Robots.txt Route
  app.get('/robots.txt', (req, res) => {
    const host = `${req.protocol}://${req.get('host')}`;
    res.header('Content-Type', 'text/plain');
    res.send(`User-agent: *\nAllow: /\nSitemap: ${host}/sitemap.xml\n`);
  });

  // 2. Sitemap.xml Route
  app.get('/sitemap.xml', (req, res) => {
    const host = `${req.protocol}://${req.get('host')}`;
    const urls = [
      '',
      '/services',
      '/quote',
      '/reviews',
      '/blog',
      '/blog/geneva-siding-mold-signs',
      '/blog/college-dudes-zero-mess-guarantee',
      '/blog/eco-friendly-cleaning-safe-solutions',
    ];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const url of urls) {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${host}${url}</loc>\n`;
      sitemap += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>${url === '' ? '1.0' : '0.8'}</priority>\n`;
      sitemap += `  </url>\n`;
    }
    sitemap += `</urlset>`;
    
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  let vite: any;
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static client assets, but disable default index.html serving so SSR handles the root page
    app.use(express.static(path.join(process.cwd(), 'dist/client'), { index: false }));
  }

  // 3. Dynamic Page Metadata Builder
  function getPageMetadata(urlPath: string) {
    let title = 'College Dudes Power Cleaning | Eco-Friendly Pressure Washing Geneva IL';
    let description = 'Professional eco-friendly pressure washing in Geneva, IL. Support local college students! Siding wash, driveway cleaning, trash can sanitization with zero mess guarantee.';
    
    const cleanPath = urlPath.split('?')[0].replace(/\/$/, '') || '/';

    if (cleanPath === '/' || cleanPath === '/home') {
      title = "College Dudes Power Cleaning | Eco-Friendly Pressure Washing Geneva IL";
      description = "Professional eco-friendly pressure washing in Geneva, IL. Support local college students! Siding wash, driveway cleaning, trash can sanitization with zero mess guarantee.";
    } else if (cleanPath === '/services') {
      title = "Our Pressure Washing & Cleaning Services | College Dudes Geneva";
      description = "Explore our flat-rate exterior cleaning services in Kane County: soft-wash exterior siding, rotary concrete pressure cleaning, and eco-friendly trash can sanitization.";
    } else if (cleanPath === '/quote') {
      title = "Get an Instant Pressure Washing Quote | College Dudes Geneva";
      description = "Calculate your customized flat-rate estimate instantly with our interactive pricing tool. Siding, driveways, and trash can sanitization with student-backed support.";
    } else if (cleanPath === '/reviews') {
      title = "Customer Reviews & Testimonials | College Dudes Power Cleaning";
      description = "Read real 5-star reviews from homeowners in Mill Creek, Eagle Brook, and Geneva, IL. Verified local customer feedback about our exterior cleaning service.";
    } else if (cleanPath === '/blog') {
      title = "Home Care & Pressure Washing Advice Blog | College Dudes Geneva";
      description = "Expert homeowner tips from the College Dudes. Learn how to identify siding mold, protect your lawn during power washing, and keep your trash cans smelling fresh.";
    } else if (cleanPath === '/dashboard') {
      title = "College Dudes Admin Portal";
      description = "Secure owner dashboard for managing service leads, checking customer inquiries, and syncing events with Google Calendar.";
    } else if (cleanPath.startsWith('/blog/')) {
      const slug = cleanPath.substring('/blog/'.length);
      const post = BLOG_POSTS.find(p => p.slug === slug);
      if (post) {
        title = `${post.title} | College Dudes Power Cleaning`;
        description = post.summary;
      }
    }

    // LocalBusiness JSON-LD schema
    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "College Dudes Power Cleaning",
      "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "url": "https://collegedudespowercleaning.com",
      "telephone": "+17063331557",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "34 S Geneva Rd",
        "addressLocality": "Geneva",
        "addressRegion": "IL",
        "postalCode": "60134",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 41.8875,
        "longitude": -88.3056
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "08:00",
        "closes": "18:00"
      }
    };

    return `
      <title>${title}</title>
      <meta name="description" content="${description}" />
      <script type="application/ld+json">
        ${JSON.stringify(schema, null, 2)}
      </script>
    `.trim();
  }

  // 4. Fallback wildcard to Server-Side Render React pages
  app.get('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      let template: string;
      let renderFn: typeof render;

      if (!isProd) {
        // Read index.html from workspace root and run through Vite HTML transform
        template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        
        // Dynamically load SSR entry point to ensure changes pick up without server reboots
        const ssrModule = await vite.ssrLoadModule('/src/entry-server.tsx');
        renderFn = ssrModule.render;
      } else {
        // In production, read from the compiled client directory
        template = fs.readFileSync(path.resolve(process.cwd(), 'dist/client/index.html'), 'utf-8');
        renderFn = render;
      }

      // Render the full React tree with initial path passed as a prop
      const appHtml = renderFn(url);

      // Build SEO header elements
      const headHtml = getPageMetadata(url);

      // Inject server-rendered app HTML and header metadata
      const html = template
        .replace('<!--app-head-->', headHtml)
        .replace('<!--app-html-->', appHtml);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e: any) {
      if (!isProd) {
        vite.ssrFixStacktrace(e);
      }
      console.error(`SSR Error rendering path ${url}:`, e);
      next(e);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${isProd ? 'production' : 'development'} mode on port ${PORT}`);
  });
}

startServer();
