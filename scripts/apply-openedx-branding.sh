#!/usr/bin/env bash
# apply-openedx-branding.sh
# Applies JourneyLite branding to a running Tutor Open edX instance.
# Run this after: tutor local launch
# Usage: ./scripts/apply-openedx-branding.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
TMP_DIR=$(mktemp -d)

echo "🎨 Applying JourneyLite branding to Open edX..."

# ── 1. Convert SVG logo to PNG ──────────────────────────────────────────────
echo "→ Converting logos..."
# Regular (dark text for light backgrounds)
npx --yes svgexport "$REPO_DIR/public/journeylite-logo.svg" "$TMP_DIR/logo.png" "560:160"
# White variant (for dark/green backgrounds)
python3 -c "
svg = open('$REPO_DIR/public/journeylite-logo.svg').read()
white = svg.replace('fill=\"#050505\"','fill=\"#ffffff\"').replace('fill=\"#737373\"','fill=\"rgba(255,255,255,0.8)\"')
open('$TMP_DIR/logo-white.svg','w').write(white)
"
npx --yes svgexport "$TMP_DIR/logo-white.svg" "$TMP_DIR/logo-white.png" "560:160"

# ── 2. Generate favicon ──────────────────────────────────────────────────────
echo "→ Creating favicon..."
python3 - << 'PYEOF'
from PIL import Image, ImageDraw
img = Image.new('RGBA', (32, 32), (20, 92, 66, 255))
draw = ImageDraw.Draw(img)
draw.rectangle([14, 4, 20, 24], fill=(255, 255, 255, 255))
draw.ellipse([6, 18, 20, 30], fill=(255, 255, 255, 255))
draw.rectangle([8, 26, 14, 30], fill=(20, 92, 66, 255))
img.save('/tmp/jl-favicon.ico', format='ICO', sizes=[(16,16),(32,32),(48,48)])
print("Favicon created")
PYEOF

# ── 3. Copy logos and favicons into containers ───────────────────────────────
echo "→ Copying assets into LMS container..."
for container in tutor_local-lms-1 tutor_local-cms-1; do
  docker cp "$TMP_DIR/logo.png"        "$container:/openedx/staticfiles/indigo/images/logo.png"
  docker cp "$TMP_DIR/logo.png"        "$container:/openedx/staticfiles/indigo/images/logo.f3a840613c01.png"
  docker cp "$TMP_DIR/logo-white.png"  "$container:/openedx/staticfiles/indigo/images/logo-white.png"
  docker cp "$TMP_DIR/logo-white.png"  "$container:/openedx/staticfiles/indigo/images/logo-white.fccc31ee581f.png"
  docker cp "/tmp/jl-favicon.ico"      "$container:/openedx/staticfiles/indigo/images/favicon.ico"
  docker cp "/tmp/jl-favicon.ico"      "$container:/openedx/staticfiles/indigo/images/favicon.a30c5b7f3b1c.ico"
  echo "  ✓ $container"
done

# ── 4. Replace colors in all CSS files ──────────────────────────────────────
echo "→ Recoloring CSS in LMS container..."
docker exec tutor_local-lms-1 python3 -c "
import subprocess
result = subprocess.run(['find', '/openedx/staticfiles/', '-name', '*.css'], capture_output=True, text=True)
files = [f.strip() for f in result.stdout.strip().split('\n') if f.strip()]
replacements = [
    # Original Indigo blue → JourneyLite green
    ('#15376D','#145c42'),('#15376d','#145c42'),
    ('#AEC7F6','#7cc9a8'),('#aec7f6','#7cc9a8'),
    ('#112F6B','#0d3d2b'),('#112f6b','#0d3d2b'),
    # Link colors (medium blue → medium green)
    ('#1b6d99','#1a7d52'),('#1B6D99','#1a7d52'),
    # Link hover / --blue variable (bright blue → primary green)
    ('#0075b4','#145c42'),('#0075B4','#145c42'),
    ('#0079bc','#145c42'),('#0079BC','#145c42'),
    # Visited links (dark blue → dark green)
    ('#003655','#0d3d2b'),('#003355','#0d3d2b'),
    # CSS blue shade variables
    ('#005e90','#0d4a35'),('#00466c','#0a3528'),('#001724','#071f17'),
    # Button hover/active states (dark navy → dark green)
    ('#0f274d','#0f4432'),('#0d2142','#0d3a2b'),
    ('#0b1c38','#0b3024'),('#0a3055','#0a3d29'),
    # Button focus/active
    ('#1790c7','#1a7d52'),('#065683','#0a4532'),('#075683','#0a4532'),
    ('#126f9a','#157a50'),('#0d72a2','#0d6644'),
    ('#006daa','#0d6644'),('#207ab7','#1a7d52'),
    # Discussion/forum link blues
    ('#337ab7','#1a7d52'),('#286090','#156a43'),
    ('#2e6da4','#1a6a45'),('#1b468b','#145c42'),
    ('#2b6dd6','#1a7d52'),('#1d9dd9','#1a9d68'),
    # Info/bright blues → light greens
    ('#00bbf9','#2ecc87'),('#00BBF9','#2ecc87'),
    # Focus ring rgba
    ('rgba(21,55,109','rgba(20,92,66'),('rgba(21, 55, 109','rgba(20, 92, 66'),
]
total_files = 0; total_replacements = 0
for fpath in files:
    try:
        content = open(fpath,'r',encoding='utf-8',errors='ignore').read()
        new_content = content
        c = sum(new_content.count(o) for o, _ in replacements)
        for old, new in replacements: new_content = new_content.replace(old, new)
        if c > 0:
            open(fpath,'w',encoding='utf-8').write(new_content)
            total_files += 1; total_replacements += c
    except Exception as e: print('Error:', fpath, e)
print('LMS CSS: updated', total_files, 'files,', total_replacements, 'replacements')
"

echo "→ Recoloring CSS in CMS container..."
docker exec tutor_local-cms-1 python3 -c "
import subprocess
result = subprocess.run(['find', '/openedx/staticfiles/', '-name', '*.css'], capture_output=True, text=True)
files = [f.strip() for f in result.stdout.strip().split('\n') if f.strip()]
replacements = [
    ('#15376D','#145c42'),('#15376d','#145c42'),
    ('#AEC7F6','#7cc9a8'),('#aec7f6','#7cc9a8'),
    ('#112F6B','#0d3d2b'),('#112f6b','#0d3d2b'),
    ('#1b6d99','#1a7d52'),('#1B6D99','#1a7d52'),
    ('#0075b4','#145c42'),('#0075B4','#145c42'),
    ('#0079bc','#145c42'),('#0079BC','#145c42'),
    ('#003655','#0d3d2b'),('#003355','#0d3d2b'),
    ('#005e90','#0d4a35'),('#00466c','#0a3528'),('#001724','#071f17'),
    ('#0f274d','#0f4432'),('#0d2142','#0d3a2b'),
    ('#0b1c38','#0b3024'),('#0a3055','#0a3d29'),
    ('#1790c7','#1a7d52'),('#065683','#0a4532'),('#075683','#0a4532'),
    ('#126f9a','#157a50'),('#0d72a2','#0d6644'),
    ('#006daa','#0d6644'),('#207ab7','#1a7d52'),
    ('#337ab7','#1a7d52'),('#286090','#156a43'),
    ('#2e6da4','#1a6a45'),('#1b468b','#145c42'),
    ('#2b6dd6','#1a7d52'),('#1d9dd9','#1a9d68'),
    ('#00bbf9','#2ecc87'),('#00BBF9','#2ecc87'),
    ('rgba(21,55,109','rgba(20,92,66'),('rgba(21, 55, 109','rgba(20, 92, 66'),
]
total_files = 0; total_replacements = 0
for fpath in files:
    try:
        content = open(fpath,'r',encoding='utf-8',errors='ignore').read()
        new_content = content
        c = sum(new_content.count(o) for o, _ in replacements)
        for old, new in replacements: new_content = new_content.replace(old, new)
        if c > 0:
            open(fpath,'w',encoding='utf-8').write(new_content)
            total_files += 1; total_replacements += c
    except Exception as e: print('Error:', fpath, e)
print('CMS CSS: updated', total_files, 'files,', total_replacements, 'replacements')
"

# ── 5. Update LMS site configuration ────────────────────────────────────────
echo "→ Setting LMS site configuration..."
docker exec tutor_local-lms-1 python manage.py lms shell -c "
from openedx.core.djangoapps.site_configuration.models import SiteConfiguration
from django.contrib.sites.models import Site
site = Site.objects.get(domain='local.edly.io')
config, created = SiteConfiguration.objects.get_or_create(site=site)
config.site_values = {
    'PLATFORM_NAME': 'JourneyLite',
    'PLATFORM_DESCRIPTION': 'JourneyLite Bariatric Physicians — Patient Education Portal',
    'CONTACT_EMAIL': 'admin@journeylite.com',
    'DEFAULT_FROM_EMAIL': 'noreply@journeylite.com',
    'TECH_SUPPORT_EMAIL': 'admin@journeylite.com',
}
config.enabled = True
config.save()
print('Site config saved:', site.domain, '(created:', created, ')')
" 2>/dev/null | tail -1

# ── 6. Restart LMS/CMS to apply template changes ────────────────────────────
echo "→ Restarting LMS and CMS containers..."
docker restart tutor_local-lms-1 tutor_local-lms-worker-1 tutor_local-cms-1 tutor_local-cms-worker-1 > /dev/null
echo "  Waiting for LMS to be ready..."
sleep 20
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://local.edly.io/)
echo "  LMS status: HTTP $HTTP"

# ── Clean up ─────────────────────────────────────────────────────────────────
rm -rf "$TMP_DIR"

echo ""
echo "✅ JourneyLite branding applied!"
echo "   🌐 LMS:    http://local.edly.io"
echo "   🎛️  Studio: http://studio.local.edly.io"
echo ""
echo "ℹ️  Note: These changes are applied to running containers."
echo "   After 'tutor images build openedx && tutor local launch',"
echo "   run this script again to reapply. The SCSS source files"
echo "   in the tutor env already use #145c42 for future rebuilds."
