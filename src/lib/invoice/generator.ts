import puppeteer from 'puppeteer';
import { generateInvoiceHTML } from './template';

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

export async function generateInvoicePDF(order: Order, user: User): Promise<Buffer> {
    let browser;
    
    try {
        // Launch browser with optimized settings for server environments
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        
        // Generate HTML content
        const htmlContent = generateInvoiceHTML(order, user);
        
        // Set content and wait for fonts/styles to load
        await page.setContent(htmlContent, { 
            waitUntil: 'networkidle0' 
        });

        // Configure PDF options
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '15mm',
                right: '15mm'
            },
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: `
                <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
                    Page <span class="pageNumber"></span> of <span class="totalPages"></span>
                </div>
            `
        });

        return pdfBuffer;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate invoice PDF');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

export async function generateInvoiceHTML_forView(order: Order, user: User): Promise<string> {
    return generateInvoiceHTML(order, user);
}
