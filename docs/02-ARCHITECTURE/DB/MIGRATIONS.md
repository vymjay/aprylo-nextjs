# Database Migrations Guide

## Overview

Aprylo uses Supabase for database management with a structured migration approach to ensure data integrity and version control of schema changes.

## Migration Strategy

### 1. Migration Files Structure

```
supabase/
├── migrations/
│   ├── 20250813000000_initial_schema.sql
│   ├── 20250813000001_add_user_profiles.sql
│   ├── 20250813000002_create_products_table.sql
│   ├── 20250813000003_add_cart_functionality.sql
│   ├── 20250813000004_create_orders_system.sql
│   ├── 20250813000005_add_reviews_table.sql
│   └── 20250813000006_add_indexes_optimization.sql
└── seed.sql
```

### 2. Migration Naming Convention

```bash
# Format: YYYYMMDDHHMMSS_description.sql
20250813120000_add_user_authentication.sql
20250813120001_create_product_categories.sql
20250813120002_add_cart_items_table.sql
```

## Creating Migrations

### 1. Generate New Migration

```bash
# Create a new migration file
supabase migration new add_user_preferences

# This creates: supabase/migrations/TIMESTAMP_add_user_preferences.sql
```

### 2. Migration File Structure

```sql
-- Migration: 20250813120000_add_user_preferences.sql
-- Description: Add user preferences table for storing user settings

-- UP Migration
CREATE TABLE IF NOT EXISTS "UserPreferences" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  language VARCHAR(10) DEFAULT 'en',
  currency VARCHAR(5) DEFAULT 'USD',
  notifications JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Add indexes
CREATE INDEX idx_user_preferences_user_id ON "UserPreferences"(user_id);

-- Add RLS policies
ALTER TABLE "UserPreferences" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences" ON "UserPreferences"
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Add triggers
CREATE TRIGGER trigger_update_user_preferences_updated_at
  BEFORE UPDATE ON "UserPreferences"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- DOWN Migration (for rollbacks)
-- DROP TABLE IF EXISTS "UserPreferences";
```

### 3. Complex Migration Example

```sql
-- Migration: 20250813120001_refactor_product_variants.sql
-- Description: Refactor product variants to separate table

-- Create new variants table
CREATE TABLE IF NOT EXISTS "ProductVariant" (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  sku VARCHAR(100) UNIQUE NOT NULL,
  size VARCHAR(20),
  color VARCHAR(50),
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_product_variant_product_id ON "ProductVariant"(product_id);
CREATE INDEX idx_product_variant_sku ON "ProductVariant"(sku);
CREATE UNIQUE INDEX idx_product_variant_unique ON "ProductVariant"(product_id, size, color);

-- Migrate existing data
INSERT INTO "ProductVariant" (product_id, sku, size, color, price, stock_quantity)
SELECT 
  id as product_id,
  CONCAT('SKU-', id, '-DEFAULT') as sku,
  'OS' as size, -- One Size
  'DEFAULT' as color,
  price,
  stock_quantity
FROM "Product"
WHERE id NOT IN (SELECT DISTINCT product_id FROM "ProductVariant");

-- Update existing tables
ALTER TABLE "Product" DROP COLUMN IF EXISTS stock_quantity;
ALTER TABLE "Product" ADD COLUMN default_variant_id INTEGER REFERENCES "ProductVariant"(id);

-- Update default variant references
UPDATE "Product" p
SET default_variant_id = (
  SELECT id FROM "ProductVariant" pv 
  WHERE pv.product_id = p.id 
  LIMIT 1
);

-- Add constraints
ALTER TABLE "Product" ALTER COLUMN default_variant_id SET NOT NULL;
```

## Migration Commands

### 1. Development Workflow

```bash
# Check migration status
supabase migration list

# Create new migration
supabase migration new migration_name

# Apply migrations to local database
supabase db reset

# Generate types after migration
npm run supabase:gen-types

# Push migrations to remote
supabase db push
```

### 2. Production Workflow

```bash
# Dry run migration (check for issues)
supabase db diff --schema public

# Create migration from differences
supabase db diff --schema public > new_migration.sql

# Apply to production (with backup)
pg_dump $PRODUCTION_DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
supabase db push --db-url $PRODUCTION_DATABASE_URL

# Verify migration success
supabase migration list --db-url $PRODUCTION_DATABASE_URL
```

### 3. Rollback Procedures

```bash
# Reset local database to specific migration
supabase db reset --version 20250813120000

# Manual rollback (if needed)
psql $DATABASE_URL < rollback_script.sql
```

## Data Migration Patterns

### 1. Column Addition

```sql
-- Safe column addition
ALTER TABLE "Product" 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Populate slug from name
UPDATE "Product" 
SET slug = LOWER(REGEXP_REPLACE(name, '[^A-Za-z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Add constraints after population
ALTER TABLE "Product" 
ALTER COLUMN slug SET NOT NULL,
ADD CONSTRAINT unique_product_slug UNIQUE (slug);
```

### 2. Data Type Changes

```sql
-- Safe data type change
ALTER TABLE "Product" 
ADD COLUMN price_new DECIMAL(10,2);

-- Copy data with conversion
UPDATE "Product" 
SET price_new = price::DECIMAL(10,2);

-- Verify data integrity
SELECT COUNT(*) FROM "Product" WHERE price_new IS NULL;

-- Drop old column and rename
ALTER TABLE "Product" 
DROP COLUMN price,
RENAME COLUMN price_new TO price;
```

### 3. Table Restructuring

```sql
-- Create new table structure
CREATE TABLE "OrderNew" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "User"(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  -- new structure
);

-- Migrate data with transformation
INSERT INTO "OrderNew" (user_id, order_number, ...)
SELECT 
  user_id,
  CONCAT('ORD-', LPAD(id::text, 8, '0')) as order_number,
  ...
FROM "Order"
ORDER BY id;

-- Verify migration
SELECT 
  (SELECT COUNT(*) FROM "Order") as old_count,
  (SELECT COUNT(*) FROM "OrderNew") as new_count;

-- Switch tables (in transaction)
BEGIN;
  DROP TABLE "Order";
  ALTER TABLE "OrderNew" RENAME TO "Order";
COMMIT;
```

## Migration Best Practices

### 1. Backwards Compatibility

```sql
-- Bad: Breaking change
ALTER TABLE "Product" DROP COLUMN name;

-- Good: Gradual migration
ALTER TABLE "Product" ADD COLUMN title VARCHAR(255);
UPDATE "Product" SET title = name WHERE title IS NULL;
-- Deploy application code to use 'title'
-- Next migration: DROP COLUMN name
```

### 2. Index Creation

```sql
-- Bad: Blocking index creation
CREATE INDEX idx_product_name ON "Product"(name);

-- Good: Concurrent index creation (PostgreSQL)
CREATE INDEX CONCURRENTLY idx_product_name ON "Product"(name);
```

### 3. Large Data Migrations

```sql
-- Bad: Single large update
UPDATE "Product" SET slug = generate_slug(name);

-- Good: Batch processing
DO $$
DECLARE
  batch_size INTEGER := 1000;
  total_rows INTEGER;
  processed INTEGER := 0;
BEGIN
  SELECT COUNT(*) INTO total_rows FROM "Product" WHERE slug IS NULL;
  
  WHILE processed < total_rows LOOP
    UPDATE "Product" 
    SET slug = generate_slug(name)
    WHERE id IN (
      SELECT id FROM "Product" 
      WHERE slug IS NULL 
      LIMIT batch_size
    );
    
    processed := processed + batch_size;
    RAISE NOTICE 'Processed % of % rows', processed, total_rows;
    
    -- Allow other operations
    PERFORM pg_sleep(0.1);
  END LOOP;
END $$;
```

## Testing Migrations

### 1. Migration Testing Script

```sql
-- test_migration.sql
-- Test data setup
INSERT INTO "Product" (name, price, category) VALUES 
  ('Test Product 1', 29.99, 'men'),
  ('Test Product 2', 39.99, 'women');

-- Run migration
\i migration_file.sql

-- Verify results
SELECT 
  id, 
  name, 
  slug, 
  price 
FROM "Product" 
WHERE name LIKE 'Test Product%';

-- Cleanup
DELETE FROM "Product" WHERE name LIKE 'Test Product%';
```

### 2. Automated Testing

```bash
#!/bin/bash
# test_migrations.sh

# Setup test database
supabase start
supabase db reset

# Run specific migration
supabase migration up --to 20250813120000

# Run tests
npm run test:db

# Cleanup
supabase stop
```

## Migration Monitoring

### 1. Migration Logging

```sql
-- Create migration log table
CREATE TABLE IF NOT EXISTS "MigrationLog" (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,
  affected_rows INTEGER
);

-- Log migration start
INSERT INTO "MigrationLog" (migration_name, status)
VALUES ('20250813120000_add_user_preferences', 'started');

-- Log migration completion
UPDATE "MigrationLog" 
SET 
  status = 'completed',
  completed_at = CURRENT_TIMESTAMP,
  affected_rows = 1000
WHERE migration_name = '20250813120000_add_user_preferences' 
  AND status = 'started';
```

### 2. Performance Monitoring

```sql
-- Monitor long-running queries during migration
SELECT 
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- Check table locks
SELECT 
  t.relname,
  l.locktype,
  l.mode,
  l.granted
FROM pg_locks l
JOIN pg_class t ON l.relation = t.oid
WHERE t.relname IN ('Product', 'User', 'Order');
```

## Emergency Procedures

### 1. Migration Rollback

```sql
-- Emergency rollback template
BEGIN;

-- Step 1: Restore table structure
DROP TABLE IF EXISTS "NewTable";
ALTER TABLE "OldTable" RENAME TO "Table";

-- Step 2: Restore data (if backed up)
-- COPY "Table" FROM 'backup_file.csv' WITH CSV HEADER;

-- Step 3: Restore indexes
CREATE INDEX idx_table_column ON "Table"(column);

-- Step 4: Restore permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON "Table" TO authenticated;

-- Verify rollback
SELECT COUNT(*) FROM "Table";

COMMIT;
```

### 2. Data Recovery

```sql
-- Recover from backup
pg_restore --clean --if-exists -d $DATABASE_URL backup_file.dump

-- Point-in-time recovery (if available)
-- Contact Supabase support for production environments
```

## Migration Checklist

### Pre-Migration

- [ ] Create database backup
- [ ] Test migration on copy of production data
- [ ] Review migration for breaking changes
- [ ] Plan rollback procedure
- [ ] Schedule maintenance window (if needed)
- [ ] Notify team of migration

### During Migration

- [ ] Monitor migration progress
- [ ] Watch for lock contention
- [ ] Check error logs
- [ ] Verify data integrity
- [ ] Test application functionality

### Post-Migration

- [ ] Generate updated TypeScript types
- [ ] Run application tests
- [ ] Monitor performance metrics
- [ ] Verify user-facing functionality
- [ ] Document any issues encountered
- [ ] Clean up temporary migration data

## Common Migration Issues

### 1. Lock Timeouts

```sql
-- Increase lock timeout for large migrations
SET lock_timeout = '10min';

-- Use smaller transactions
COMMIT;
BEGIN;
```

### 2. Foreign Key Violations

```sql
-- Temporarily disable foreign key checks
ALTER TABLE "Table" DISABLE TRIGGER ALL;
-- Run migration
ALTER TABLE "Table" ENABLE TRIGGER ALL;
```

### 3. Memory Issues

```sql
-- Process in smaller batches
UPDATE "Table" SET column = value 
WHERE id BETWEEN 1 AND 10000;
-- Repeat for each batch
```

---

*For production migrations, always test thoroughly and have a rollback plan ready.*
