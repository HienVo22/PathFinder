#!/bin/bash

# PathFinder - Start All Services
# Run this script to start MongoDB, Ollama, and Next.js

echo "🚀 Starting PathFinder..."
echo ""

# Check if MongoDB is running (portable check)
if ps aux | grep -v grep | grep "mongod" > /dev/null; then
    echo "✓ MongoDB is already running"
else
    echo "Starting MongoDB..."
    
    # Set configurable MongoDB data path
    MONGODB_DATA_PATH=${MONGODB_DATA_PATH:-"data/db_new"}
    
    # Ensure MongoDB data directory exists
    if [ ! -d "$MONGODB_DATA_PATH" ]; then
        echo "Creating MongoDB data directory: $MONGODB_DATA_PATH"
        mkdir -p "$MONGODB_DATA_PATH"
        if [ $? -ne 0 ]; then
            echo "❌ Failed to create MongoDB data directory: $MONGODB_DATA_PATH"
            echo "Please check permissions or create the directory manually"
            exit 1
        fi
    fi
    
    # Check if directory is writable
    if [ ! -w "$MONGODB_DATA_PATH" ]; then
        echo "❌ MongoDB data directory is not writable: $MONGODB_DATA_PATH"
        echo "Please check permissions: chmod 755 $MONGODB_DATA_PATH"
        exit 1
    fi
    
    mongod --dbpath "$MONGODB_DATA_PATH" --port 27017 > /dev/null 2>&1 &
    sleep 2
    
    # Verify MongoDB started successfully
    if ps aux | grep -v grep | grep "mongod" > /dev/null; then
        echo "✓ MongoDB started on port 27017 with data path: $MONGODB_DATA_PATH"
    else
        echo "❌ Failed to start MongoDB. Check the logs for more details."
        echo "You can run 'mongod --dbpath $MONGODB_DATA_PATH --port 27017' manually to see error messages."
        exit 1
    fi
fi

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



