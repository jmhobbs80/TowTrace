#!/bin/bash

# Set error handling
set -e
echo "🧪 Running TowTrace test suite..."

# Run frontend tests
echo "🔍 Testing frontend components..."
cd frontend/towtrace-dashboard-new
npm test
cd ../..

# Run backend tests
echo "🔍 Testing backend API..."
cd backend/towtrace-api
npm test
cd ../..

# Run mobile driver app tests
echo "🔍 Testing driver mobile app..."
cd mobile/TowTraceDriverApp-New
npm test
cd ../..

# Run mobile dispatch app tests (if test configuration is set up)
if [ -f "mobile/TowTraceDispatchApp-New/jest.setup.js" ]; then
  echo "🔍 Testing dispatch mobile app..."
  cd mobile/TowTraceDispatchApp-New
  npm test
  cd ../..
fi

echo "✅ All tests completed successfully!"