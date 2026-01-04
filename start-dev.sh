#!/bin/bash
# Start development server for localhost

echo "🚀 Starting Vite dev server..."
echo "📝 The server will be available at: http://localhost:5173"
echo "⚠️  Press Ctrl+C to stop the server"
echo ""

cd "$(dirname "$0")"
npm run dev

