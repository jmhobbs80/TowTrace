#!/bin/bash

# TowTrace JSDoc Comment Generator
# This script helps add JSDoc comments to functions that are missing them
# It identifies exported functions without JSDoc comments and generates template comments

PROJECT_ROOT="/mnt/c/users/jhobb/towtrace"
COMPONENT=$1

print_usage() {
  echo "Usage: $0 <component>"
  echo "  component: One of 'frontend', 'driver-app', 'dispatch-app', 'backend'"
  echo ""
  echo "Example: $0 backend"
}

if [ -z "$COMPONENT" ]; then
  print_usage
  exit 1
fi

case "$COMPONENT" in
  "frontend")
    DIRECTORY="$PROJECT_ROOT/frontend/towtrace-dashboard-new"
    ;;
  "driver-app")
    DIRECTORY="$PROJECT_ROOT/mobile/TowTraceDriverApp-New"
    ;;
  "dispatch-app")
    DIRECTORY="$PROJECT_ROOT/mobile/TowTraceDispatchApp-New"
    ;;
  "backend")
    DIRECTORY="$PROJECT_ROOT/backend/towtrace-api"
    ;;
  *)
    echo "Invalid component: $COMPONENT"
    print_usage
    exit 1
    ;;
esac

# Check if directory exists
if [ ! -d "$DIRECTORY" ]; then
  echo "Directory not found: $DIRECTORY"
  exit 1
fi

cd "$DIRECTORY" || exit 1

# Find directories to check
if [ -d "src" ]; then
  DIRS_TO_CHECK="src"
else
  DIRS_TO_CHECK="."
fi

# Find TypeScript files that need JSDoc comments
for dir in $DIRS_TO_CHECK; do
  find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" | while read -r file; do
    # Skip type declaration files
    if [[ "$file" == *.d.ts ]]; then
      continue
    fi
    
    # Check if the file has functions/components without JSDoc
    FUNCTIONS_WITHOUT_JSDOC=$(grep -n -B1 -A1 "export " "$file" | grep -v "@" | grep -E "function|=>|class|interface|type|enum" | grep -v "//" || echo "")
    
    if [ -n "$FUNCTIONS_WITHOUT_JSDOC" ]; then
      echo "File: $file"
      echo ""
      echo "Functions/components without JSDoc:"
      echo "$FUNCTIONS_WITHOUT_JSDOC"
      echo ""
      
      # For each function without JSDoc, generate a template
      while read -r line; do
        LINE_NUM=$(echo "$line" | cut -d: -f1)
        FUNC_DEF=$(echo "$line" | cut -d: -f2-)
        
        # Determine function name and type
        if [[ "$FUNC_DEF" =~ export[[:space:]]+(default[[:space:]]+)?(function|class|const|interface|type|enum)[[:space:]]+([A-Za-z0-9_]+) ]]; then
          FUNC_TYPE="${BASH_REMATCH[2]}"
          FUNC_NAME="${BASH_REMATCH[3]}"
          
          # Extract parameters
          PARAMS=""
          if [[ "$FUNC_DEF" =~ "(" ]]; then
            # Extract text between parentheses
            PARAMS=$(echo "$FUNC_DEF" | sed -n 's/.*(\([^)]*\)).*/\1/p')
            # Extract param names
            PARAM_NAMES=$(echo "$PARAMS" | tr ',' '\n' | sed -E 's/[^a-zA-Z0-9_].*//g' | grep -v "^$")
          fi
          
          # Generate JSDoc template based on function type
          JSDOC="/**\n * $FUNC_NAME\n *\n * [DESCRIPTION]\n *"
          
          # Add param tags if parameters exist
          if [ -n "$PARAM_NAMES" ]; then
            JSDOC="$JSDOC\n *"
            while read -r param; do
              JSDOC="$JSDOC\n * @param {any} $param - [DESCRIPTION]"
            done <<< "$PARAM_NAMES"
          fi
          
          # Add return tag for functions
          if [[ "$FUNC_TYPE" == "function" || "$FUNC_DEF" =~ "=>" ]]; then
            JSDOC="$JSDOC\n * @returns {any} - [DESCRIPTION]"
          fi
          
          JSDOC="$JSDOC\n */"
          
          # Output JSDoc template
          echo "Suggested JSDoc for line $LINE_NUM:"
          echo -e "$JSDOC"
          echo ""
          echo "To insert this JSDoc, add the following lines before line $LINE_NUM:"
          echo -e "$JSDOC"
          echo ""
          echo "----------------------------------------"
        fi
      done <<< "$FUNCTIONS_WITHOUT_JSDOC"
    fi
  done
done

echo "JSDoc template generation complete."
echo "Use the suggested templates to add proper documentation to functions."