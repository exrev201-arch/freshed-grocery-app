# PWA App Icons Setup Guide

This guide explains how to properly set up your app icons for the Progressive Web App (PWA) so they appear when users add the app to their home screen.

## Current Setup

The PWA manifest is already configured in `public/manifest.json` with references to various icon sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## Steps to Set Up Your App Icons

### 1. Prepare Your Logo

For best results, prepare a high-quality logo that meets these requirements:
- Square aspect ratio (1:1)
- Minimum size: 512x512 pixels
- Preferred format: PNG or SVG
- Transparent background (if desired)

### 2. Generate Required Icon Sizes

You have several options to generate the required icon sizes:

#### Option A: Online Tools (Easiest)
1. Visit https://www.favicon-generator.org/ or https://realfavicongenerator.net/
2. Upload your logo
3. Download the generated package
4. Extract and place the files in `public/icons/`

#### Option B: Manual Creation
1. Use image editing software (Photoshop, GIMP, etc.)
2. Resize your logo to each required dimension
3. Save each size as a PNG file with the naming convention: `icon-{width}x{height}.png`

#### Option C: Command Line Tools
If you have ImageMagick installed:
```bash
# Resize to multiple sizes
convert source-logo.png -resize 72x72 public/icons/icon-72x72.png
convert source-logo.png -resize 96x96 public/icons/icon-96x96.png
convert source-logo.png -resize 128x128 public/icons/icon-128x128.png
convert source-logo.png -resize 144x144 public/icons/icon-144x144.png
convert source-logo.png -resize 152x152 public/icons/icon-152x152.png
convert source-logo.png -resize 192x192 public/icons/icon-192x192.png
convert source-logo.png -resize 384x384 public/icons/icon-384x384.png
convert source-logo.png -resize 512x512 public/icons/icon-512x512.png
```

### 3. Place Files in Correct Directory

Place all generated icon files in the `public/icons/` directory:
```
public/
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

### 4. Verify Manifest Configuration

Ensure `public/manifest.json` references the correct icon paths:
```json
"icons": [
  {
    "src": "/icons/icon-72x72.png",
    "sizes": "72x72",
    "type": "image/png",
    "purpose": "maskable any"
  },
  // ... other sizes
]
```

### 5. Test the Setup

1. Build and deploy your application
2. Visit your site in a mobile browser
3. Look for the "Add to Home Screen" option in the browser menu
4. Add the app to your home screen
5. Verify that your custom icon appears

## Additional Recommendations

### Apple Touch Icons
For better iOS support, you might want to add specific Apple touch icons:
```html
<!-- In index.html head section -->
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
```

### Favicon
Don't forget to create and place a favicon:
- `public/icons/favicon-16x16.png`
- `public/icons/favicon-32x32.png`
- `public/icons/favicon.ico`

### Maskable Icons
For adaptive icons on Android, consider creating maskable versions of your icons. These have extra padding to accommodate different device icon masks.

## Troubleshooting

### Icons Not Appearing?
1. Ensure all icon files exist at the specified paths
2. Check browser developer tools for 404 errors on icon files
3. Verify the manifest.json file is accessible and valid
4. Clear browser cache and try again
5. Test on different devices and browsers

### Wrong Icon Displayed?
1. Check that the largest appropriate icon (192x192 or 512x512) exists
2. Verify the manifest.json icon order (larger sizes should be listed last)
3. Ensure icons are properly sized (not just renamed small images)

## Need Help?

If you need assistance with creating or resizing your logo, you can:
1. Use the placeholder logo at `public/icons/app-logo.svg` as a reference
2. Run the icon generation script: `node scripts/generate-icons.js`
3. Contact a designer or use AI image generation tools to create your logo

Remember to replace all placeholder files with your actual brand logo for a professional appearance.