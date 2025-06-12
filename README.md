# Sendfull Website

The official website for Sendfull, a design research consultancy focused on emerging technology products.

## 🌐 Live Site
Visit: [www.sendfull.com](https://www.sendfull.com)

## 🚀 Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Performance Optimized**: Critical CSS inlining, optimized images, and fast loading
- **Newsletter Integration**: Automated RSS feed from Substack
- **Modern UI**: Clean, professional design with smooth animations

## 📁 Structure
- `index.html` - Homepage
- `about.html` - About page
- `newsletter.html` - Newsletter/Substack posts
- `styles.css` - Main stylesheet
- `script.js` - Main JavaScript
- `newsletter.js` - Newsletter functionality
- `newsletter-rss.json` - Cached RSS feed data

## 🔧 Setup & Deployment
This site is hosted on **GitHub Pages** with automatic deployment from the main branch.

### Local Development
1. Clone the repository
2. Open any HTML file in your browser
3. Or use a local server: `python3 -m http.server 8000`

### RSS Feed Updates
The newsletter page automatically fetches posts from the Sendfull Substack RSS feed. Due to Cloudflare protection, updates are done locally:

```bash
# Update RSS feed (when needed)
node fetch-rss-local.js
git add newsletter-rss.json
git commit -m "Update RSS feed"
git push
```

## 🎨 Design System
- **Colors**: Professional blue and white theme
- **Typography**: Clean, readable fonts
- **Layout**: Grid-based responsive design
- **Animations**: Smooth transitions and hover effects

## 📱 Mobile Optimized
- Hamburger menu for mobile navigation
- Responsive grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## 🔍 Performance
- Critical CSS inlined for above-the-fold content
- Optimized images and assets
- Minimal JavaScript footprint
- Fast loading times

## 📞 Contact
For questions about this website, contact: stef@sendfull.com

---

Built with ❤️ for the Sendfull community 