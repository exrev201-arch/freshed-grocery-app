# Freshed App Icon Setup Guide

This guide explains how the app icons are configured for the Freshed Grocery application.

## Current Icon Configuration

The app uses two main logo files:
1. `freshedlogo.svg` - SVG version of the logo (scalable)
2. `freshedlogo.jpg` - JPG version of the logo (for reference)

Additionally, there are placeholder files for all required icon sizes that should be replaced with actual resized versions of your logo.

## File Structure

```
public/
├── icons/
│   ├── freshedlogo.svg          # Main SVG logo
│   ├── freshedlogo.jpg          # JPG reference logo
│   ├── icon-72x72.png           # App icons in various sizes
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   ├── icon-16x16.png           # Favicon sizes
│   ├── icon-32x32.png
│   ├── apple-touch-icon.png     # iOS home screen icon (180x180)
│   ├── shortcut-products.png    # Shortcut icons
│   ├── shortcut-cart.png
│   └── shortcut-admin.png
├── manifest.json                # PWA configuration
└── browserconfig.xml            # Windows tile configuration
```

## How to Replace with Your Actual Logo

### Option 1: Using Online Tools (Recommended)
1. Visit https://realfavicongenerator.net/
2. Upload your high-quality logo (at least 512x512 pixels)
3. Configure the settings:
   - Primary color: #16a34a (green)
   - Theme color: #16a34a
   - Background color: #ffffff
   - App name: Freshed
   - Short name: Freshed
4. Generate and download the package
5. Extract and replace the files in `public/icons/`

### Option 2: Using ImageMagick
If you have ImageMagick installed, you can generate all sizes with commands like:
```bash
convert your-logo.jpg -resize 192x192 public/icons/icon-192x192.png
```

### Option 3: Manual Creation
Use an image editor to resize your logo to each required size and save as PNG.

## Testing Your Icons

1. **Local Testing**:
   ```bash
   npm run dev
   ```
   - Visit http://localhost:5173
   - Open browser developer tools
   - Check Application > Manifest tab to verify icons are loading

2. **Device Testing**:
   - Open your site on a mobile device
   - Look for "Add to Home Screen" option
   - Verify your custom icon appears

3. **Online Validation**:
   - Use https://www.pwabuilder.com/ to validate your PWA
   - Use https://realfavicongenerator.net/ to generate additional icon formats

## Troubleshooting

If your custom icons aren't showing:
1. Clear your browser cache
2. Check that file paths in manifest.json are correct
3. Ensure all required icon sizes exist
4. Verify file permissions (should be readable)

## Next Steps

1. Replace all placeholder files with actual resized versions of your logo
2. Test on different devices and browsers
3. Validate with PWA testing tools

Your app is now properly configured to display custom icons when users add it to their home screen!