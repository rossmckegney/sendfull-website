# Sendfull Website

A modern, responsive website for Sendfull - Design Research at the Speed of AI.

## Features

- **Interactive Shader Effects**: WebGL-powered animated backgrounds on hero sections
- **Professional Design**: Clean, modern interface with Frame.io-inspired styling
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **SVG Icons**: Professional, futuristic icons throughout the site
- **Smooth Animations**: Hover effects and transitions for enhanced user experience

## Pages

- **Homepage**: Features interactive shader background and service offerings
- **About Page**: Company information, mission, and team details

## Technologies Used

- HTML5
- CSS3 (with modern features like CSS Grid, Flexbox, and custom properties)
- JavaScript (ES6+)
- WebGL (for shader effects)

## Local Development

To run the site locally:

```bash
# Using Python (if you have Python installed)
python3 -m http.server 8000

# Using Node.js (if you have Node.js installed)
npx serve .

# Using PHP (if you have PHP installed)
php -S localhost:8000
```

Then open your browser and navigate to `http://localhost:8000`

## GitHub Pages Deployment

This site is configured to be deployed on GitHub Pages. To deploy:

1. **Create a GitHub repository** (if you haven't already)
2. **Push your code** to the repository
3. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click on "Settings"
   - Scroll down to "GitHub Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch (or "master" if that's your default)
   - Click "Save"

Your site will be available at: `https://[your-username].github.io/[repository-name]`

## File Structure

```
sendfull/
├── index.html          # Homepage
├── about.html          # About page
├── styles.css          # Main stylesheet
├── script.js           # JavaScript functionality
├── images/             # Image assets
│   ├── sendfull-logo.png
│   └── stef-hutka.jpg
└── README.md           # This file
```

## Customization

- **Colors**: Update CSS custom properties in `styles.css` for brand colors
- **Content**: Modify HTML files to update text and images
- **Shaders**: Edit the fragment shader in `script.js` for different background effects
- **Icons**: Replace SVG icons in HTML files with your preferred designs

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Note: The WebGL shader effects require a modern browser with WebGL support. 