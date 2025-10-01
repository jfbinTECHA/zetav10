#!/bin/bash
# Build Zeta AI Dashboard Manual PDF with version and timestamp

VERSION="1.0"
cd "$(dirname "$0")"
TIMESTAMP=$(date +"%Y-%m-%d_%H%M")
OUTPUT_FILE="ZetaDashboardManual_v${VERSION}_${TIMESTAMP}.pdf"

CHROME_CMD=$(command -v google-chrome || command -v chromium-browser)
if [ -z "$CHROME_CMD" ]; then
    echo "Chrome/Chromium not found. Please install it."
    exit 1
fi

$CHROME_CMD --headless --disable-gpu --print-to-pdf="$OUTPUT_FILE" index.html
echo "✅ PDF generated: $OUTPUT_FILE"