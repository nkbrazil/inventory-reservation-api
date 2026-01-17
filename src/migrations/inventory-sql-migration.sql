-- ================================================
-- INVENTORY RESERVATION API - COMPLETE DATABASE SCHEMA
-- ================================================
-- This file creates the complete database schema for the Inventory Reservation API
-- Run this in Supabase SQL Editor to set up the entire database
-- ================================================

-- ================================================
-- STEP 1: Enable Extensions
-- ================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================
-- STEP 2: Create Inventory Schema
-- ================================================
CREATE SCHEMA IF NOT EXISTS inventory;

-- ================================================
-- STEP 3: Create Custom Types
-- ================================================
-- Reservation status enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
        CREATE TYPE reservation_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED');
    END IF;
END $$;

-- ================================================
-- STEP 4: Drop Existing Tables (if re-running)
-- ================================================
DROP TABLE IF EXISTS inventory.reservations CASCADE;
DROP TABLE IF EXISTS inventory.items CASCADE;

-- ================================================
-- STEP 5: Create Items Table
-- ================================================
CREATE TABLE inventory.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    total_quantity INT NOT NULL CHECK (total_quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT items_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT items_name_unique UNIQUE (name),
    CONSTRAINT items_updated_after_created CHECK (updated_at >= created_at)
);

-- Add comments for documentation
COMMENT ON TABLE inventory.items IS 'Stores inventory items with their total quantities';
COMMENT ON COLUMN inventory.items.name IS 'Unique name of the inventory item (cannot be empty)';
COMMENT ON COLUMN inventory.items.total_quantity IS 'Total available quantity (decreases when reservations are confirmed, must be >= 0)';

-- ================================================
-- STEP 6: Create Reservations Table
-- ================================================
CREATE TABLE inventory.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    status reservation_status NOT NULL DEFAULT 'PENDING',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT reservations_customer_id_not_empty CHECK (length(trim(customer_id)) > 0),
    CONSTRAINT reservations_customer_name_not_empty CHECK (length(trim(customer_name)) > 0),
    CONSTRAINT reservations_expires_at_after_created CHECK (expires_at > created_at),
    CONSTRAINT reservations_updated_after_created CHECK (updated_at >= created_at),
    
    -- Foreign Key with CASCADE delete
    CONSTRAINT reservations_item_id_fkey 
        FOREIGN KEY (item_id) 
        REFERENCES inventory.items(id) 
        ON DELETE CASCADE
);

-- Add comments for documentation
COMMENT ON TABLE inventory.reservations IS 'Stores temporary and confirmed reservations for inventory items';
COMMENT ON COLUMN inventory.reservations.item_id IS 'Reference to the item being reserved';
COMMENT ON COLUMN inventory.reservations.customer_id IS 'Identifier for the customer making the reservation (cannot be empty)';
COMMENT ON COLUMN inventory.reservations.customer_name IS 'Name of the customer (cannot be empty)';
COMMENT ON COLUMN inventory.reservations.quantity IS 'Number of items reserved (must be > 0)';
COMMENT ON COLUMN inventory.reservations.status IS 'PENDING: temporary hold, CONFIRMED: permanently deducted, CANCELLED: released, EXPIRED: timed out';
COMMENT ON COLUMN inventory.reservations.expires_at IS 'Expiration time for PENDING reservations (must be after created_at)';

-- ================================================
-- STEP 7: Create Indexes
-- ================================================

-- Items table indexes
CREATE INDEX idx_items_name ON inventory.items(name);

-- Reservations table indexes
CREATE INDEX idx_reservations_item_id_status ON inventory.reservations(item_id, status);
CREATE INDEX idx_reservations_expires_at ON inventory.reservations(expires_at);

-- Add comments to indexes
COMMENT ON INDEX inventory.idx_reservations_item_id_status IS 'Optimizes availability checks and item status queries (used in createReservation and getItemStatus)';
COMMENT ON INDEX inventory.idx_reservations_expires_at IS 'Optimizes expire-reservations maintenance endpoint (finds expired reservations)';

-- ================================================
-- STEP 8: Create Triggers for Auto-updating timestamps
-- ================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION inventory.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for items table
CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON inventory.items
    FOR EACH ROW
    EXECUTE FUNCTION inventory.update_updated_at_column();

-- Trigger for reservations table
CREATE TRIGGER update_reservations_updated_at 
    BEFORE UPDATE ON inventory.reservations
    FOR EACH ROW
    EXECUTE FUNCTION inventory.update_updated_at_column();

-- ================================================
-- STEP 9: Enable Row Level Security (RLS)
-- ================================================

-- Enable RLS on tables
ALTER TABLE inventory.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory.reservations ENABLE ROW LEVEL SECURITY;

-- ================================================
-- STEP 10: Create RLS Policies
-- ================================================

-- Items table policies
CREATE POLICY "Allow select for all" 
    ON inventory.items  
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow insert for service role" 
    ON inventory.items 
    FOR INSERT 
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow update for service role" 
    ON inventory.items 
    FOR UPDATE 
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow delete for service role" 
    ON inventory.items 
    FOR DELETE 
    TO service_role
    USING (true);

-- Reservations table policies
CREATE POLICY "Allow select for service role"
    ON inventory.reservations
    FOR SELECT 
    TO service_role
    USING (true);

CREATE POLICY "Allow insert for service role"
    ON inventory.reservations
    FOR INSERT 
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow update for service role"
    ON inventory.reservations
    FOR UPDATE 
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow delete for service role"
    ON inventory.reservations
    FOR DELETE 
    TO service_role
    USING (true);

-- ================================================
-- STEP 11: Grant Permissions
-- ================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA inventory TO service_role;

-- Grant all privileges on tables
GRANT ALL ON ALL TABLES IN SCHEMA inventory TO service_role;

-- Grant privileges on sequences (for future use)
GRANT ALL ON ALL SEQUENCES IN SCHEMA inventory TO service_role;

-- Grant future tables automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA inventory
    GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA inventory
    GRANT ALL ON SEQUENCES TO service_role;

-- ================================================
-- STEP 12: Initial Seed Data (Optional)
-- ================================================

INSERT INTO inventory.items (name, total_quantity) VALUES
    ('Laptop - Dell XPS 15', 50),
    ('Wireless Mouse - Logitech MX Master', 100),
    ('Mechanical Keyboard - Keychron K8', 75),
    ('USB-C Hub - Anker 7-in-1', 200),
    ('Monitor - LG UltraWide 34 inch', 30),
    ('Webcam - Logitech C920', 60),
    ('Headphones - Sony WH-1000XM5', 40),
    ('Standing Desk - FlexiSpot E7', 20);

-- ================================================
-- VERIFICATION QUERIES (Uncomment to verify)
-- ================================================

-- Check schema exists
-- SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'inventory';

-- List all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'inventory';

-- List all constraints
-- SELECT conname, contype, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid IN ('inventory.items'::regclass, 'inventory.reservations'::regclass)
-- ORDER BY conrelid, conname;

-- List all indexes
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE schemaname = 'inventory'
-- ORDER BY tablename, indexname;

-- Verify seed data
-- SELECT * FROM inventory.items;

-- Count records
-- SELECT 'items' as table_name, COUNT(*) as row_count FROM inventory.items
-- UNION ALL
-- SELECT 'reservations', COUNT(*) FROM inventory.reservations;

-- ================================================
-- SCHEMA CREATION COMPLETE 
-- ================================================
-- The database is now ready for the Inventory Reservation API
-- 
-- Features:
-- Custom ENUM type for reservation statuses
-- Comprehensive constraints (NOT NULL, CHECK, UNIQUE, FOREIGN KEY)
-- Performance indexes (composite indexes for queries)
-- Auto-updating timestamps
-- Row Level Security with service role policies
-- Sample seed data (8 items)
-- 
-- Next steps:
-- 1. Verify tables: SELECT * FROM inventory.items;
-- 2. Update your .env with SUPABASE_SERVICE_ROLE_KEY
-- 3. Test API endpoints
-- ================================================
