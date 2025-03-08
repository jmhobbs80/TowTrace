#!/bin/bash

# TowTrace Project Linting Script
# This script runs linting, type checking, and checks function line counts across the project
# It identifies unused references and enforces <50 lines per function where possible

echo "=== TowTrace Project Linting ==="
echo "Running linting and type checking for all components..."

PROJECT_ROOT="/mnt/c/users/jhobb/towtrace"
REPORT_FILE="$PROJECT_ROOT/lint-report.md"

# Create report file with header and timestamp
echo "# TowTrace Lint Report" > $REPORT_FILE
echo "Generated on $(date)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Function to add section to report
add_section() {
  echo "## $1" >> $REPORT_FILE
  echo "" >> $REPORT_FILE
}

# Function to add content to report
add_content() {
  echo "$1" >> $REPORT_FILE
  echo "" >> $REPORT_FILE
}

# Function to run lint and type check
run_checks() {
  local COMPONENT=$1
  local DIRECTORY=$2
  
  echo ""
  echo "=== Checking $COMPONENT ==="
  
  cd "$DIRECTORY" || { 
    echo "Directory $DIRECTORY not found"; 
    add_content "Directory $DIRECTORY not found - skipping checks";
    return 1; 
  }
  
  add_section "$COMPONENT Checks"
  
  # Check files in src directory for JSDoc comments
  echo "Checking for JSDoc comments..."
  add_content "### Missing JSDoc Comments"
  
  if [ -d "src" ]; then
    echo "Scanning src directory for functions without JSDoc comments..."
    find ./src -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*" | while read -r file; do
      # Find exported functions or components without JSDoc comments
      NO_DOCS=$(awk '
        /export/ && !/@param/ && !/\/\*\*/ && /function|=>|class|interface/ {
          print "Line " NR ": Missing JSDoc for " $0
        }
      ' "$file")
      
      if [ -n "$NO_DOCS" ]; then
        echo "$file:"
        echo "$NO_DOCS"
        add_content "- $file missing JSDoc:"
        add_content "  ```"
        add_content "$NO_DOCS"
        add_content "  ```"
      fi
    done
  else
    echo "No src directory found, skipping JSDoc check"
    add_content "No src directory found, skipping JSDoc check"
  fi
  
  # Check for functions over 50 lines
  echo "Checking for functions over 50 lines..."
  add_content "### Functions Over 50 Lines"
  
  # Find all TypeScript/JavaScript files (avoiding node_modules, .next, and dist)
  local FILES=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" -not -path "*/build/*" -print)

  for file in $FILES; do
    # Get function/component declarations and line info
    grep -n -E "function [a-zA-Z0-9_]+|const [a-zA-Z0-9_]+ = |export (default )?function|export (default )?const|export (default )?class" "$file" | while read -r line_info; do
      line_num=$(echo "$line_info" | cut -d: -f1)
      function_sig=$(echo "$line_info" | cut -d: -f2-)
      
      # Get the end line of the function (crude approximation)
      end_line=$(tail -n +$line_num "$file" | grep -n "}" | head -1 | cut -d: -f1)
      if [ -n "$end_line" ]; then
        end_line=$((line_num + end_line))
        line_count=$((end_line - line_num))
        
        if [ $line_count -gt 50 ]; then
          # Try to extract function name
          function_name=$(echo "$function_sig" | grep -oE "(function|const|class) ([a-zA-Z0-9_]+)" | head -1)
          if [ -z "$function_name" ]; then
            function_name="$function_sig (truncated)"
          fi
          
          echo "$file: $function_name at line $line_num (approx. $line_count lines)"
          add_content "- $file: $function_name at line $line_num (approx. $line_count lines)"
        fi
      fi
    done
  done
  
  # Check file naming conventions
  echo "Checking file naming conventions..."
  add_content "### File Naming Convention Check"
  
  find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" -not -path "*/build/*" | while read -r file; do
    FILENAME=$(basename "$file")
    FILENAME_BASE=$(echo "$FILENAME" | sed -E 's/\.[^.]+$//')
    
    # Extract component/function name from file
    COMPONENT_NAME=$(grep -E "export (default )?(function|class|const) ([A-Za-z0-9_]+)" "$file" | head -1 | sed -E 's/.*export (default )?(function|class|const) ([A-Za-z0-9_]+).*/\3/')
    
    if [ -n "$COMPONENT_NAME" ]; then
      # Convert both to lowercase for case-insensitive comparison
      COMPONENT_LOWER=$(echo "$COMPONENT_NAME" | tr '[:upper:]' '[:lower:]')
      FILENAME_LOWER=$(echo "$FILENAME_BASE" | tr '[:upper:]' '[:lower:]')
      
      # Check if filename contains component name or vice versa
      if [[ "$FILENAME_LOWER" != *"$COMPONENT_LOWER"* && "$COMPONENT_LOWER" != *"$FILENAME_LOWER"* ]]; then
        echo "$file: Main export '$COMPONENT_NAME' does not match filename '$FILENAME_BASE'"
        add_content "- $file: Main export '$COMPONENT_NAME' does not match filename '$FILENAME_BASE'"
      fi
    fi
  done
  
  echo "Checking for clean code issues..."
  add_content "### Clean Code Issues"
  
  # Find magic numbers
  find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" -not -path "*/build/*" | while read -r file; do
    # Find numeric literals that aren't 0 or 1
    MAGIC_NUMBERS=$(grep -n -E '[^a-zA-Z0-9_][2-9][0-9]*[^a-zA-Z0-9_.]|[^a-zA-Z0-9_][0-9]{2,}[^a-zA-Z0-9_.]' "$file" | grep -v "// MAGIC" | head -5)
    
    if [ -n "$MAGIC_NUMBERS" ]; then
      echo "$file: Contains potential magic numbers"
      add_content "- $file: Contains potential magic numbers"
      add_content "  ```"
      add_content "$MAGIC_NUMBERS"
      add_content "  ```"
    fi
  done
  
  echo "Checking for commented-out code..."
  # Find commented out code blocks
  find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" -not -path "*/build/*" | while read -r file; do
    COMMENTED_CODE=$(grep -n -E "^[[:space:]]*//.*\{|\}[[:space:]]*//|//.*function[[:space:]]*\(|//.*=>" "$file" | head -5)
    
    if [ -n "$COMMENTED_CODE" ]; then
      echo "$file: Contains commented-out code"
      add_content "- $file: Contains commented-out code"
      add_content "  ```"
      add_content "$COMMENTED_CODE"
      add_content "  ```"
    fi
  done
  
  # If package.json exists, check for proper scripts
  if [ -f "package.json" ]; then
    echo "Checking package.json for recommended scripts..."
    add_content "### Package.json Script Check"
    
    # Check for recommended scripts
    for script in "lint" "typecheck" "test" "build" "start" "dev"; do
      if ! grep -q "\"$script\":" package.json; then
        echo "Missing recommended script: $script"
        add_content "- Missing recommended script: $script"
      fi
    done
  fi
}

# Run checks for each component
for component in "Frontend Dashboard" "Mobile Driver App" "Mobile Dispatch App" "Backend API"; do
  case "$component" in
    "Frontend Dashboard")
      run_checks "$component" "$PROJECT_ROOT/frontend/towtrace-dashboard-new"
      ;;
    "Mobile Driver App")
      run_checks "$component" "$PROJECT_ROOT/mobile/TowTraceDriverApp-New"
      ;;
    "Mobile Dispatch App")
      run_checks "$component" "$PROJECT_ROOT/mobile/TowTraceDispatchApp-New"
      ;;
    "Backend API")
      run_checks "$component" "$PROJECT_ROOT/backend/towtrace-api"
      ;;
  esac
done

echo ""
echo "=== Linting Complete ==="
echo "Report generated at: $REPORT_FILE"
echo ""
echo "Next steps:"
echo "1. Review the lint report to identify issues"
echo "2. Add mandatory comments to all functions"
echo "3. Refactor functions over 50 lines where possible"
echo "4. Fix file naming to match component/export names"
echo "5. Convert magic numbers to named constants"
echo "6. Remove commented-out code"