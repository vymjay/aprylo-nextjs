#!/bin/bash

# Script to find unused TypeScript/TSX files
echo "🔍 Scanning for unused files..."

UNUSED_FILES=()
TOTAL_CHECKED=0

# Get all TypeScript/TSX files excluding tests
while IFS= read -r file; do
    TOTAL_CHECKED=$((TOTAL_CHECKED + 1))
    
    # Skip if it's an entry point (page.tsx, layout.tsx, route.ts, etc.)
    if [[ "$file" =~ (page\.tsx|layout\.tsx|route\.ts|globals\.css|middleware\.ts)$ ]]; then
        continue
    fi
    
    # Skip if it's in app directory (likely entry points)
    if [[ "$file" =~ ^src/app/ ]] && [[ "$file" =~ \.(tsx|ts)$ ]]; then
        continue
    fi
    
    # Get the filename without extension and path
    basename_file=$(basename "$file" .tsx)
    basename_file=$(basename "$basename_file" .ts)
    
    # Get the relative path for import checking
    relative_path=${file#src/}
    import_path=${relative_path%.*}
    
    # Search for imports of this file (multiple patterns)
    if ! grep -r --include="*.tsx" --include="*.ts" --exclude-dir=node_modules \
        -E "(import.*from ['\"].*${basename_file}['\"]|import.*from ['\"].*${import_path}['\"]|import.*from ['\"]\..*${basename_file})" \
        src/ > /dev/null 2>&1; then
        
        # Also check for dynamic imports
        if ! grep -r --include="*.tsx" --include="*.ts" --exclude-dir=node_modules \
            -E "(import\(.*${basename_file}|import\(.*${import_path})" \
            src/ > /dev/null 2>&1; then
            
            UNUSED_FILES+=("$file")
        fi
    fi
    
    if (( TOTAL_CHECKED % 20 == 0 )); then
        echo "Checked $TOTAL_CHECKED files..."
    fi
    
done < <(find src -name "*.tsx" -o -name "*.ts" | grep -v ".test." | grep -v ".spec.")

echo ""
echo "📊 Results:"
echo "Total files checked: $TOTAL_CHECKED"
echo "Potentially unused files: ${#UNUSED_FILES[@]}"

if [ ${#UNUSED_FILES[@]} -gt 0 ]; then
    echo ""
    echo "🗑️  Potentially unused files:"
    printf '%s\n' "${UNUSED_FILES[@]}"
else
    echo "✅ No unused files found!"
fi
