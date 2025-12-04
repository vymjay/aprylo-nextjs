import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/api-client';
import { generateInvoiceHTML_forView } from '@/lib/invoice/generator';

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
            return new Response(
                '<html><body><h1>Order not found</h1><p>The requested order could not be found.</p></body></html>',
                { 
                    status: 404,
                    headers: { 'Content-Type': 'text/html' }
                }
            );
        }

        // Generate HTML
        const userInfo = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email || 'Customer'
        };
        const htmlContent = await generateInvoiceHTML_forView(order, userInfo);

        // Return HTML response
        return new Response(htmlContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });

    } catch (error) {
        console.error('Error generating invoice HTML:', error);
        
        // Provide more specific error responses
        if (error instanceof Error) {
            if (error.message.includes('Unauthorized') || error.message.includes('Auth session missing')) {
                return NextResponse.json(
                    { error: 'Authentication required. Please log in to view your invoice.' },
                    { status: 401 }
                );
            }
            
            if (error.message.includes('not found')) {
                return NextResponse.json(
                    { error: 'Invoice not found for the specified order.' },
                    { status: 404 }
                );
            }
        }
        
        return NextResponse.json(
            { error: 'Failed to generate invoice. Please try again later.' },
            { status: 500 }
        );
    }
}
