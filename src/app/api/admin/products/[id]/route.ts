import { NextRequest, NextResponse } from 'next/server'
import { createAuthenticatedClient } from '@/lib/supabase/api-client'

// GET - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { supabase, user } = await createAuthenticatedClient()

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('role')
      .eq('supabaseUserId', user.id)
      .single()

    if (userError || userData?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const { id } = await params

    const { data: product, error } = await supabase
      .from('Product')
      .select(`
        *,
        category:categoryId (
          id,
          name,
          slug
        ),
        variants:ProductVariant (
          id,
          title,
          size,
          color,
          sku,
          stock
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: `Failed to fetch product: ${error.message}` },
        { status: 500 }
      )
    }

    // Calculate total stock
    const totalStock = product.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0

    return NextResponse.json({
      success: true,
      data: { 
        product: {
          ...product,
          totalStock
        }
      }
    })
  } catch (error: any) {
    // Handle authentication errors
    if (error.message === 'Unauthorized' || error.message?.includes('auth')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('GET API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { supabase, user } = await createAuthenticatedClient()

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('role')
      .eq('supabaseUserId', user.id)
      .single()

    if (userError || userData?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const { id } = await params
    const body = await request.json()

    // Create slug from title if title is being updated
    if (body.title && !body.slug) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    }

    // Prepare update data for Product
    const updateData: any = {}
    
    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.description !== undefined) updateData.description = body.description
    if (body.price !== undefined) updateData.price = parseFloat(body.price)
    if (body.originalPrice !== undefined) updateData.originalPrice = body.originalPrice ? parseFloat(body.originalPrice) : null
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId
    if (body.images !== undefined) updateData.images = body.images
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive)

    // Update product
    const { data: product, error } = await supabase
      .from('Product')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        category:categoryId (
          id,
          name,
          slug
        )
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: `Failed to update product: ${error.message}` },
        { status: 500 }
      )
    }

    // Handle variants if provided
    const { variants } = body
    if (variants && Array.isArray(variants)) {
      // Update variants
      for (const variant of variants) {
        if (variant.id) {
          // Existing variant - update
          const { error: variantError } = await supabase
            .from('ProductVariant')
            .update({
              title: variant.title,
              size: variant.size,
              color: variant.color,
              sku: variant.sku,
              stock: variant.stock
            })
            .eq('id', variant.id)

          if (variantError) throw variantError
        } else {
          // New variant - create
          const { error: variantError } = await supabase
            .from('ProductVariant')
            .insert({
              productId: id,
              title: variant.title,
              size: variant.size,
              color: variant.color,
              sku: variant.sku,
              stock: variant.stock
            })

          if (variantError) throw variantError
        }
      }

      // Delete removed variants
      const existingVariantIds = variants.filter(v => v.id).map(v => v.id)
      if (existingVariantIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('ProductVariant')
          .delete()
          .eq('productId', id)
          .not('id', 'in', `(${existingVariantIds.join(',')})`)

        if (deleteError) throw deleteError
      } else {
        // Delete all variants if no existing IDs
        const { error: deleteError } = await supabase
          .from('ProductVariant')
          .delete()
          .eq('productId', id)

        if (deleteError) throw deleteError
      }
    }

    // Fetch updated product with variants
    const { data: updatedProduct, error: fetchError } = await supabase
      .from('Product')
      .select(`
        *,
        category:categoryId (
          id,
          name,
          slug
        ),
        variants:ProductVariant (
          id,
          title,
          size,
          color,
          sku,
          stock
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch updated product: ${fetchError.message}`)
    }

    // Calculate total stock
    const totalStock = updatedProduct.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0

    return NextResponse.json({
      success: true,
      data: { 
        product: {
          ...updatedProduct,
          totalStock
        }
      },
      message: 'Product updated successfully'
    })
  } catch (error: any) {
    // Handle authentication errors
    if (error.message === 'Unauthorized' || error.message?.includes('auth')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('PUT API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { supabase, user } = await createAuthenticatedClient()

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('role')
      .eq('supabaseUserId', user.id)
      .single()

    if (userError || userData?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const { id } = await params

    // First delete all variants
    const { error: variantError } = await supabase
      .from('ProductVariant')
      .delete()
      .eq('productId', id)

    if (variantError) {
      return NextResponse.json(
        { error: `Failed to delete product variants: ${variantError.message}` },
        { status: 500 }
      )
    }

    // Then delete the product
    const { error } = await supabase
      .from('Product')
      .delete()
      .eq('id', id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: `Failed to delete product: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error: any) {
    // Handle authentication errors
    if (error.message === 'Unauthorized' || error.message?.includes('auth')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('DELETE API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
