#!/bin/bash

# PathFinder - Start All Services
# Run this script to start MongoDB, Ollama, and Next.js

# Add MongoDB to PATH based on environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Git Bash on Windows
    export PATH="/c/Program Files/MongoDB/Server/8.2/bin:$PATH"
elif grep -qi microsoft /proc/version 2>/dev/null; then
    # WSL (Windows Subsystem for Linux) - use Windows MongoDB via interop
    export PATH="/mnt/c/Program Files/MongoDB/Server/8.2/bin:$PATH"
fi

echo "🚀 Starting PathFinder..."
echo ""

echo "ℹ️  Skipping local MongoDB startup. The app now uses MONGODB_URI (remote cluster)."

# Check if Ollama is running (portable check)
if ps aux | grep -v grep | grep "ollama" > /dev/null; then
    echo "✓ Ollama is already running"
else
    echo "Starting Ollama AI service..."
    ollama serve > /dev/null 2>&1 &
    sleep 2
    echo "✓ Ollama started on port 11434"
fi

# Check if Next.js is running on port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✓ Next.js is already running on port 3000"
else
    echo "Starting Next.js..."
    npm run dev > /dev/null 2>&1 &
    sleep 3
    echo "✓ Next.js started on port 3000"
fi

echo ""
echo "✅ All services are running!"
echo ""
echo "Open your browser: http://localhost:3000"
echo ""
echo "To stop all services, run: ./stop-all.sh"



