# Favicon Generation Instructions

## Quick Setup

1. Open `generate-favicons.html` in your web browser
2. Click "Generate All Favicons" 
3. This will download 6 favicon files automatically
4. Save all downloaded files to `src/web/assets/images/`
5. Open `generate-ico.html` in your browser
6. Click "Generate ICO File" to create favicon.ico
7. Save favicon.ico to `src/web/assets/images/`

## Generated Files

The following favicon files will be created:

- `favicon.ico` - 32x32 ICO format (classic favicon)
- `favicon-16x16.png` - 16x16 PNG
- `favicon-32x32.png` - 32x32 PNG  
- `apple-touch-icon.png` - 180x180 PNG (iOS home screen)
- `android-chrome-192x192.png` - 192x192 PNG (Android)
- `android-chrome-512x512.png` - 512x512 PNG (Android/PWA)
- `mstile-150x150.png` - 150x150 PNG (Windows tiles)

## Design

The favicon uses a blue water drop icon with a gradient:
- Top: #42A5F5 (Light blue)
- Middle: #2196F3 (Material Blue)
- Bottom: #1976D2 (Dark blue)
- Stroke: #1565C0 (Darker blue)

## Already Configured

The HTML head section and manifest.json have been updated to reference all the favicon files correctly. Once you generate and save the files, they will work automatically.

## Alternative Method

If you prefer to use a different design tool:
1. Use the `icon.svg` file as a base
2. Generate favicons using online tools like:
   - https://realfavicongenerator.net/
   - https://favicon.io/
3. Replace the generated files with your custom ones
