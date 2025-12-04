interface Order {
    id: string;
    invoiceNumber?: string;
    createdAt: string;
    status: string;
    paymentStatus: string;
    subtotal: number;
    tax: number;
    shipping: number;
    totalAmount: number;
    OrderItem: Array<{
        id: string;
        quantity: number;
        price: number;
        Product: {
            id: string;
            title: string;
            images?: string[];
        };
    }>;
    Address?: {
        name: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        phone: string;
    };
}

interface User {
    id: string;
    email: string;
    name?: string;
}

export function generateInvoiceHTML(order: Order, user: User): string {
    const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${order.invoiceNumber || order.id}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #fff;
            }

            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
                background: white;
            }

            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 40px;
                border-bottom: 3px solid #2563eb;
                padding-bottom: 20px;
            }

            .company-info {
                flex: 1;
            }

            .company-name {
                font-size: 28px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 8px;
            }

            .company-details {
                color: #666;
                font-size: 14px;
            }

            .invoice-info {
                text-align: right;
                flex: 1;
            }

            .invoice-title {
                font-size: 32px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
            }

            .invoice-meta {
                font-size: 14px;
                color: #666;
            }

            .invoice-meta strong {
                color: #333;
            }

            .billing-info {
                display: flex;
                justify-content: space-between;
                margin: 40px 0;
                gap: 40px;
            }

            .billing-section {
                flex: 1;
            }

            .section-title {
                font-size: 16px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 12px;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 4px;
            }

            .address {
                font-size: 14px;
                line-height: 1.6;
            }

            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 30px 0;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .items-table th {
                background-color: #f8fafc;
                padding: 15px;
                text-align: left;
                font-weight: 600;
                color: #374151;
                border-bottom: 2px solid #e5e7eb;
            }

            .items-table td {
                padding: 15px;
                border-bottom: 1px solid #e5e7eb;
            }

            .items-table tr:last-child td {
                border-bottom: none;
            }

            .text-right {
                text-align: right;
            }

            .text-center {
                text-align: center;
            }

            .summary {
                margin-top: 30px;
                max-width: 350px;
                margin-left: auto;
            }

            .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
            }

            .summary-row.total {
                font-weight: bold;
                font-size: 18px;
                color: #2563eb;
                border-bottom: 3px solid #2563eb;
                margin-top: 10px;
                padding-top: 15px;
            }

            .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #666;
                font-size: 12px;
            }

            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .status-paid {
                background-color: #dcfce7;
                color: #166534;
            }

            .status-pending {
                background-color: #fef3c7;
                color: #92400e;
            }

            .status-failed {
                background-color: #fee2e2;
                color: #991b1b;
            }

            @media print {
                .invoice-container {
                    box-shadow: none;
                    padding: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- Header -->
            <div class="header">
                <div class="company-info">
                    <div class="company-name">Aprylo</div>
                    <div class="company-details">
                        Premium Fashion E-commerce<br>
                        123 Fashion Street<br>
                        Mumbai, Maharashtra 400001<br>
                        India<br>
                        Email: support@vbcart.com<br>
                        Phone: +91 98765 43210
                    </div>
                </div>
                <div class="invoice-info">
                    <div class="invoice-title">INVOICE</div>
                    <div class="invoice-meta">
                        <strong>Invoice #:</strong> ${order.invoiceNumber || `ORD-${order.id}`}<br>
                        <strong>Date:</strong> ${invoiceDate}<br>
                        <strong>Due Date:</strong> ${dueDate}<br>
                        <strong>Status:</strong> <span class="status-badge status-${order.paymentStatus.toLowerCase()}">${order.paymentStatus}</span>
                    </div>
                </div>
            </div>

            <!-- Billing Information -->
            <div class="billing-info">
                <div class="billing-section">
                    <div class="section-title">Bill To:</div>
                    <div class="address">
                        <strong>${user.name || 'Customer'}</strong><br>
                        ${user.email}<br>
                        ${order.Address ? `
                            ${order.Address.name}<br>
                            ${order.Address.street}<br>
                            ${order.Address.city}, ${order.Address.state} ${order.Address.zipCode}<br>
                            ${order.Address.country}<br>
                            Phone: ${order.Address.phone}
                        ` : 'Address not available'}
                    </div>
                </div>
                <div class="billing-section">
                    <div class="section-title">Order Details:</div>
                    <div class="address">
                        <strong>Order ID:</strong> ${order.id}<br>
                        <strong>Order Date:</strong> ${invoiceDate}<br>
                        <strong>Payment Method:</strong> Online Payment<br>
                        <strong>Order Status:</strong> ${order.status}
                    </div>
                </div>
            </div>

            <!-- Items Table -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th class="text-center">Quantity</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.OrderItem.map(item => `
                        <tr>
                            <td>
                                <strong>${item.Product.title}</strong><br>
                                <small style="color: #666;">Product ID: ${item.Product.id}</small>
                            </td>
                            <td class="text-center">${item.quantity}</td>
                            <td class="text-right">₹${(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td class="text-right">₹${(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <!-- Summary -->
            <div class="summary">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>₹${order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping:</span>
                    <span>₹${order.shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="summary-row">
                    <span>Tax:</span>
                    <span>₹${order.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="summary-row total">
                    <span>Total Amount:</span>
                    <span>₹${order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>Thank you for shopping with Aprylo!</p>
                <p>For any queries regarding this invoice, please contact us at support@vbcart.com</p>
                <p style="margin-top: 10px;">
                    <strong>Terms & Conditions:</strong> Payment is due within 30 days of invoice date. 
                    Late payments may incur additional charges.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}
