-- Add invoice support to the existing Order table
-- This migration adds invoice-specific fields to support billing functionality

-- Add invoice-related columns to the Order table
ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS invoice_status VARCHAR(20) DEFAULT 'generated' CHECK (invoice_status IN ('generated', 'sent', 'paid', 'overdue', 'cancelled')),
ADD COLUMN IF NOT EXISTS invoice_pdf_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS billing_address JSONB,
ADD COLUMN IF NOT EXISTS company_details JSONB,
ADD COLUMN IF NOT EXISTS tax_details JSONB,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index for invoice lookups
CREATE INDEX IF NOT EXISTS idx_order_invoice_number ON "Order"(invoice_number);
CREATE INDEX IF NOT EXISTS idx_order_invoice_status ON "Order"(invoice_status);
CREATE INDEX IF NOT EXISTS idx_order_invoice_date ON "Order"(invoice_date);

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    formatted_num TEXT;
BEGIN
    -- Get the next sequential number
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-(\d+)') AS INTEGER)), 0) + 1
    INTO next_num
    FROM "Order"
    WHERE invoice_number IS NOT NULL;
    
    -- Format as INV-YYYYMMDD-NNNN
    formatted_num := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(next_num::text, 4, '0');
    
    RETURN formatted_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invoice number when order is confirmed
CREATE OR REPLACE FUNCTION auto_generate_invoice()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate invoice number when order status changes to 'PROCESSING' or 'SHIPPED'
    IF (NEW.status IN ('PROCESSING', 'SHIPPED') AND OLD.status = 'PENDING') 
       AND NEW.invoice_number IS NULL THEN
        NEW.invoice_number := generate_invoice_number();
        NEW.invoice_date := CURRENT_TIMESTAMP;
        NEW.due_date := CURRENT_TIMESTAMP + INTERVAL '30 days';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_invoice ON "Order";
CREATE TRIGGER trigger_auto_generate_invoice
    BEFORE UPDATE ON "Order"
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_invoice();

-- Update existing orders to have invoice numbers if they're already processed
UPDATE "Order" 
SET 
    invoice_number = generate_invoice_number(),
    invoice_date = created_at,
    due_date = created_at + INTERVAL '30 days'
WHERE status IN ('PROCESSING', 'SHIPPED', 'DELIVERED') 
AND invoice_number IS NULL;
