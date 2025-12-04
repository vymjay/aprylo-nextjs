# Billing & Invoice Management

## Overview

The Aprylo billing system provides comprehensive invoice management capabilities, allowing users to view, download, and manage their order invoices seamlessly.

## Features

### User Features
- **Invoice Overview**: Dashboard showing billing statistics and invoice history
- **Invoice Search & Filter**: Search by order ID or invoice number, filter by payment status
- **PDF Download**: Download professional PDF invoices for any order
- **Invoice Preview**: View invoices directly in the browser
- **Billing History**: Complete order and payment history with status tracking

### Admin Features
- **Automatic Invoice Generation**: Invoices are automatically generated when orders move to processing/shipped status
- **Invoice Number Management**: Automatic sequential invoice numbering with date-based formatting
- **Invoice Status Tracking**: Track invoice generation and payment status

## Database Schema

### Invoice-Related Fields Added to Order Table

```sql
-- Invoice-specific columns
invoice_number VARCHAR(50) UNIQUE,           -- Auto-generated invoice number
invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
due_date TIMESTAMP,                          -- Payment due date (30 days default)
invoice_status VARCHAR(20) DEFAULT 'generated',
invoice_pdf_url VARCHAR(500),                -- Future: Store PDF URLs
billing_address JSONB,                       -- Billing address (if different from shipping)
company_details JSONB,                       -- Customer company information
tax_details JSONB,                           -- Tax breakdown details
notes TEXT                                   -- Additional invoice notes
```

### Automatic Invoice Generation

The system includes a database trigger that automatically generates invoice numbers when:
- Order status changes from 'PENDING' to 'PROCESSING' or 'SHIPPED'
- Invoice number format: `INV-YYYYMMDD-NNNN` (e.g., INV-20250831-0001)

## API Endpoints

### Invoice Download
```
GET /api/invoices/[orderId]/download
```
- Downloads PDF invoice for the specified order
- Requires user authentication and order ownership verification
- Returns PDF file with appropriate headers for download

### Invoice View
```
GET /api/invoices/[orderId]/view
```
- Displays invoice in browser for preview
- Requires user authentication and order ownership verification
- Returns HTML content optimized for viewing and printing

## Page Structure

### Billing Page (`/account/billing`)
- **Summary Cards**: Total invoices, total amount, paid invoices, pending invoices
- **Search & Filter**: Search by order ID or invoice number, filter by payment status
- **Invoice Table**: Comprehensive table showing all invoices with actions
- **Actions**: View and download buttons for each invoice

## Implementation Details

### PDF Generation
- Uses Puppeteer for high-quality PDF generation
- Professional invoice template with company branding
- Optimized for both digital viewing and printing
- Includes all order details, billing information, and payment status

### Security
- User authentication required for all invoice operations
- Order ownership verification ensures users can only access their own invoices
- Server-side PDF generation for security and performance

### Performance Considerations
- PDF generation is done on-demand to save storage space
- Caching headers prevent unnecessary regeneration
- Optimized Puppeteer settings for server environments

## Usage

### Accessing Billing Page
1. Navigate to `/account/billing` or use the account dropdown menu
2. View billing summary and invoice history
3. Use search and filters to find specific invoices
4. Click "View" to preview invoice in browser
5. Click "Download" to save PDF invoice

### Invoice Generation Workflow
1. Customer places order (status: PENDING)
2. Admin processes order (status changes to PROCESSING)
3. Database trigger automatically generates invoice number
4. Invoice becomes available for download
5. Customer can access invoice from billing page

## File Structure

```
src/
├── app/
│   ├── account/
│   │   └── billing/
│   │       └── page.tsx              # Main billing page
│   └── api/
│       └── invoices/
│           └── [orderId]/
│               ├── download/
│               │   └── route.ts      # PDF download endpoint
│               └── view/
│                   └── route.ts      # HTML view endpoint
├── components/
│   └── billing/
│       ├── billing-client.tsx        # Main billing component
│       ├── billing-server.tsx        # Server-side data fetching
│       └── billing-skeleton.tsx      # Loading skeleton
├── lib/
│   └── invoice/
│       ├── template.ts               # HTML invoice template
│       └── generator.ts              # PDF generation utilities
└── supabase/
    └── migrations/
        └── 20250831000000_add_invoice_support.sql
```

## Dependencies

### Required Packages
- `puppeteer`: PDF generation from HTML
- `@supabase/supabase-js`: Database operations
- `lucide-react`: Icons for UI components

### Development Dependencies
- `@types/puppeteer`: TypeScript definitions (not needed, Puppeteer includes its own types)

## Configuration

### Environment Variables
No additional environment variables required. Uses existing Supabase configuration.

### Puppeteer Configuration
Optimized for server environments with headless browser settings:
- No sandbox mode for containerized environments
- Disabled GPU acceleration for better compatibility
- Minimal resource usage configuration

## Future Enhancements

### Planned Features
1. **Email Invoices**: Send invoices directly via email
2. **Custom Branding**: Allow admin to customize invoice templates
3. **Bulk Downloads**: Download multiple invoices as ZIP file
4. **Payment Links**: Include payment links in invoices for pending orders
5. **Invoice Templates**: Multiple template options for different business needs
6. **Tax Integration**: Advanced tax calculation and reporting
7. **Multi-Currency**: Support for multiple currencies
8. **Invoice Storage**: Optional PDF storage in cloud for faster access

### Integration Opportunities
1. **Accounting Software**: Export to QuickBooks, Xero, etc.
2. **Payment Gateways**: Enhanced integration with Razorpay for automatic status updates
3. **Analytics**: Invoice analytics and reporting dashboard
4. **Notifications**: Email/SMS notifications for invoice events

## Troubleshooting

### Common Issues

**PDF Generation Fails**
- Check Puppeteer installation and dependencies
- Verify server has sufficient memory for PDF generation
- Check browser permissions in containerized environments

**Invoice Not Found**
- Verify order exists and belongs to authenticated user
- Check if order status allows invoice generation
- Ensure database migration was applied correctly

**Download Not Working**
- Check browser download settings
- Verify PDF MIME type headers
- Test with different browsers

### Debug Information
- Enable detailed logging in PDF generation process
- Check Supabase logs for database errors
- Monitor API response times for performance issues

## Security Considerations

### Data Protection
- All invoice data is encrypted at rest in Supabase
- PDF generation happens server-side to prevent data exposure
- User authentication required for all operations

### Access Control
- Row-level security ensures users only access their own data
- Server-side verification of order ownership
- API endpoints protected with authentication middleware

### Privacy Compliance
- Invoice data handling complies with data protection regulations
- User data is only used for legitimate business purposes
- Clear privacy policy covers invoice data usage
