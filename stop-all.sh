#!/bin/bash

# PathFinder - Stop All Services

echo "🛑 Stopping PathFinder services..."
echo ""

# Stop MongoDB
if pgrep -x "mongod" > /dev/null; then
    pkill mongod
    echo "✓ MongoDB stopped"
else
    echo "○ MongoDB was not running"
fi

# Stop Ollama
if pgrep -x "ollama" > /dev/null; then
    pkill ollama
    echo "✓ Ollama stopped"
else
    echo "○ Ollama was not running"
fi

# Stop Next.js
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    echo "✓ Next.js stopped"
else
    echo "○ Next.js was not running"
fi

echo ""
echo "✅ All services stopped"



