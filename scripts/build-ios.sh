#!/usr/bin/env bash
# build-ios.sh — Build a static Next.js export for embedding in the iOS app.
#
# Usage:
#   bash scripts/build-ios.sh [NEXT_PUBLIC_URL]
#
# The optional argument sets the backend API base URL that the iOS WKWebView
# will use for all /api/* requests (default: https://yourdomain.com).
#
# Output: ./out/  (ready to be dragged into the Xcode project as WebApp folder)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

NEXT_PUBLIC_URL="${1:-https://yourdomain.com}"

echo "Building static Next.js export for iOS…"
echo "  Backend API base URL: $NEXT_PUBLIC_URL"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies…"
  npm install
fi

# Build with static export flag
NEXT_STATIC_EXPORT=true \
NEXT_PUBLIC_URL="$NEXT_PUBLIC_URL" \
npm run build

echo ""
echo "✅ Static export complete → ./out/"
echo ""
echo "Next steps:"
echo "  1. Open Xcode: open ios/MeetFlow.xcodeproj"
echo "  2. Copy the contents of ./out/ into the 'WebApp' folder inside the Xcode project"
echo "     (right-click WebApp group → Add Files to 'MeetFlow')"
echo "  3. In Info.plist set MEETFLOW_API_BASE to your deployed backend URL if different."
echo "  4. Build and run on a simulator or device."
