# Image Optimization Guide

## Current Issues
Your images are significantly larger than they should be:

- `sendfull-logo-white.jpg`: 477KB → Should be ~5-10KB
- `stef-hutka.jpg`: 435KB → Should be ~50-100KB  
- `sendfull-platform.png`: 231KB → Should be ~30-50KB
- `sendfull-logo.png`: 147KB → Should be ~10-20KB

## Recommended Actions

### 1. Use SVG for Logo (Already Done)
✅ `sendfull-logo-white.svg` (7.4KB) - This is perfect!

### 2. Optimize Photos
For `stef-hutka.jpg`:
- Resize to max 800px width
- Use WebP format with JPEG fallback
- Target size: 50-100KB

### 3. Optimize Screenshots
For `sendfull-platform.png`:
- Convert to WebP format
- Resize if larger than needed
- Target size: 30-50KB

### 4. Remove Unused Images
- `sendfull-logo.png` - Replace with SVG version
- `sendfull-logo-white.jpg` - Replace with SVG version

## Quick Fix Commands

```bash
# Install ImageOptim (Mac) or use online tools
# For WebP conversion, use tools like:
# - Squoosh.app (Google)
# - TinyPNG.com
# - ImageOptim (Mac app)

# Recommended sizes:
# - Profile photos: 400x400px, WebP format
# - Screenshots: 800px max width, WebP format
# - Logos: SVG format (already done)
```

## Performance Impact
Optimizing these images will:
- Reduce initial page load by ~800KB
- Improve First Contentful Paint by 1-2 seconds
- Better mobile performance
- Lower bandwidth costs 