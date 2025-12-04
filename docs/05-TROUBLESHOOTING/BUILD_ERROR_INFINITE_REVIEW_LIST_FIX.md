# Build Error Resolution - infinite-review-list-new.tsx

## 🚨 **Issue Identified**

**Error**: `Type error: Argument of type 'number' is not assignable to parameter of type 'Record<string, any>'.`  
**File**: `./src/components/product/review/infinite-review-list-new.tsx:144:36`  
**Line**: `queryKey: [...REVIEW_KEYS.list(productId), 'infinite']`

## 🔍 **Root Cause Analysis**

### **Problem**
- The file `infinite-review-list-new.tsx` had reappeared in the codebase
- It was using the incorrect query key pattern: `REVIEW_KEYS.list(productId)` 
- `REVIEW_KEYS.list()` doesn't accept parameters, causing a TypeScript error

### **Why This Happened**
- This was a duplicate file that was previously consolidated during our repository cleanup
- The file may have been restored from backup or recreated manually
- The incorrect query key usage shows it wasn't using our standardized patterns

## ✅ **Resolution Applied**

### **1. Verified File Usage**
```bash
# Searched for imports/references
grep -r "infinite-review-list-new" --include="*.tsx" --include="*.ts" src/
# Result: No matches found - file was not being used
```

### **2. Removed Duplicate File**
```bash
rm "/path/to/infinite-review-list-new.tsx"
# Safe to remove since it wasn't imported anywhere
```

### **3. Verified Correct Implementation**
The main `infinite-review-list.tsx` uses the correct pattern:
```typescript
// ✅ Correct usage
queryKey: [...EXTENDED_REVIEW_KEYS.byProduct(productId), 'infinite']

// ❌ Incorrect usage (in removed file)
queryKey: [...REVIEW_KEYS.list(productId), 'infinite']
```

## 🎯 **Build Status: RESOLVED**

```bash
✓ Compiled successfully in 3.0s
✓ Linting and checking validity of types    
✓ Collecting page data    
✓ Generating static pages (39/39)
✓ Bundle optimized to 335 kB
```

## 🛡️ **Prevention Measures**

### **1. Query Key Standards**
- Always use `EXTENDED_REVIEW_KEYS.byProduct(productId)` for product-specific reviews
- `REVIEW_KEYS.list()` is for general lists without parameters
- Follow the established query key factory patterns

### **2. File Management**
- Avoid creating duplicate files with `-new`, `-old`, or similar suffixes
- Use our established consolidation process for merging features
- Always check for existing implementations before creating new files

### **3. Code Review Checklist**
- [ ] Uses correct query key patterns
- [ ] No duplicate files created
- [ ] Follows naming conventions
- [ ] TypeScript compilation passes

## 📚 **Reference Documentation**
- **Query Key Patterns**: `docs/REPOSITORY_STANDARDS.md`
- **Consolidation Process**: `docs/04-IMPLEMENTATION/REPOSITORY_CONSOLIDATION_SUMMARY.md`
- **API Hooks Standards**: `docs/02-ARCHITECTURE/`

---

**Status**: ✅ **RESOLVED** - Build successful, duplicate file removed, standards maintained.
