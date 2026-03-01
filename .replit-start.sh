#!/bin/bash

# Script for starting the application on Replit

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run the server
echo "Starting server..."
node simple_server.js