import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/api-client';
import { generateInvoicePDF } from '@/lib/invoice/generator';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { supabase, user } = await createServerSupabaseClient();
        const { orderId } = await params;

        // Fetch order with full details
        const { data: order, error: orderError } = await supabase
            .from('Order')
            .select(`
                *,
                OrderItem (
                    id,
                    quantity,
                    price,
                    total,
                    Product (
                        id,
                        name,
                        imageUrl
                    )
                ),
                Address!Order_shippingAddressId_fkey (
                    id,
                    name,
                    street,
                    city,
                    state,
                    postalCode,
                    country,
                    phone
                )
            `)
            .eq('id', orderId)
            .eq('userId', user.id)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Generate PDF
        const userInfo = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email || 'Customer'
        };
        const pdfBuffer = await generateInvoicePDF(order, userInfo);

        // Set response headers for PDF download
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', `attachment; filename="invoice-${order.invoiceNumber || orderId}.pdf"`);
        headers.set('Content-Length', pdfBuffer.length.toString());

        return new Response(new Uint8Array(pdfBuffer), {
            status: 200,
            headers
        });

    } catch (error) {
        console.error('Error generating invoice PDF:', error);
        
        // Provide more specific error responses
        if (error instanceof Error) {
            if (error.message.includes('Unauthorized') || error.message.includes('Auth session missing')) {
                return NextResponse.json(
                    { error: 'Authentication required. Please log in to download your invoice.' },
                    { status: 401 }
                );
            }
            
            if (error.message.includes('not found')) {
                return NextResponse.json(
                    { error: 'Invoice not found for the specified order.' },
                    { status: 404 }
                );
            }
            
            if (error.message.includes('PDF generation failed') || error.message.includes('Puppeteer')) {
                return NextResponse.json(
                    { error: 'PDF generation failed. Please try again or contact support.' },
                    { status: 500 }
                );
            }
        }
        
        return NextResponse.json(
            { error: 'Failed to generate invoice. Please try again later.' },
            { status: 500 }
        );
    }
}
