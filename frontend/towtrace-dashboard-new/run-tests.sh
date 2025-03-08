#!/bin/bash

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}🧪 Running TowTrace Dashboard Tests Suite${NC}"
echo -e "${BLUE}===============================================${NC}"

# Function to run tests with coverage for a specific component
run_tests() {
  component=$1
  test_pattern=$2
  echo -e "\n${YELLOW}Running tests for ${component}...${NC}"
  npm test -- --coverage --testPathPattern="${test_pattern}" --colors
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ ${component} tests passed!${NC}"
    return 0
  else
    echo -e "${RED}❌ ${component} tests failed!${NC}"
    return 1
  fi
}

# Run tests for each major component
failed=0

# 1. Component Tests
run_tests "UI Components" "src/components.*\.test\.(tsx?|jsx?)"
if [ $? -ne 0 ]; then failed=1; fi

# 2. Services Tests
run_tests "Services" "src/services.*\.test\.(tsx?|jsx?)"
if [ $? -ne 0 ]; then failed=1; fi

# 3. Utils Tests
run_tests "Utilities" "src/utils.*\.test\.(tsx?|jsx?)"
if [ $? -ne 0 ]; then failed=1; fi

# 4. Context Tests
run_tests "Context" "src/app/context.*\.test\.(tsx?|jsx?)"
if [ $? -ne 0 ]; then failed=1; fi

# 5. Page Tests
run_tests "Pages" "src/app/.*page\.test\.(tsx?|jsx?)"
if [ $? -ne 0 ]; then failed=1; fi

# 6. Hooks Tests
run_tests "Hooks" "src/hooks.*\.test\.(tsx?|jsx?)"
if [ $? -ne 0 ]; then failed=1; fi

# Print summary
echo -e "\n${BLUE}===============================================${NC}"
if [ $failed -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed successfully!${NC}"
else
  echo -e "${RED}❌ Some tests failed. Please check the logs above.${NC}"
fi
echo -e "${BLUE}===============================================${NC}"

# Generate coverage report
echo -e "\n${YELLOW}Generating coverage report...${NC}"
npm test -- --coverage --coverageReporters="text" --coverageReporters="html" --colors

echo -e "\n${BLUE}Coverage report is available in the coverage/ directory${NC}"
echo -e "${BLUE}Open coverage/index.html in your browser to view detailed report${NC}"

exit $failed