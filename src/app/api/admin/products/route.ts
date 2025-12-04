import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, AdminUser } from '@/lib/auth/admin'
import { createAuthenticatedClient } from '@/lib/supabase/api-client'

// GET - List all products for admin
export const GET = withAdminAuth(async (adminUser: AdminUser, request: NextRequest) => {
  try {
    const { supabase } = await createAuthenticatedClient()
    const { searchParams } = new URL(request.url)
  
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
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
      `, { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    if (category) {
      query = query.eq('categoryId', category)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    query = query.range(offset, offset + limit - 1)

    const { data: products, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    // Calculate total stock for each product and transform data
    const transformedProducts = (products || []).map(product => {
      const totalStock = product.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0
      return {
        ...product,
        totalStock
      }
    })

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count || 0,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
})

// POST - Create new product
export const POST = withAdminAuth(async (adminUser: AdminUser, request: NextRequest) => {
  try {
    const { supabase } = await createAuthenticatedClient()
    const body = await request.json()

  // Validate required fields
  const requiredFields = ['title', 'slug', 'price']
  for (const field of requiredFields) {
    if (!body[field]) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      )
    }
  }

  // Create slug from title if not provided
  if (!body.slug) {
    body.slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  // Insert product
  const { data: product, error } = await supabase
    .from('Product')
    .insert({
      title: body.title,
      slug: body.slug,
      description: body.description || '',
      price: parseFloat(body.price),
      originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
      categoryId: body.categoryId || null,
      images: body.images || [],
      isActive: body.isActive !== undefined ? body.isActive : true,
      rating: 0,
      reviewCount: 0
    })
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
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'Product slug already exists' },
          { status: 409 }
        )
      }
      throw new Error(`Failed to create product: ${error.message}`)
    }

    // Handle variants if provided
    if (body.variants && body.variants.length > 0) {
      const variants = body.variants.map((variant: any) => ({
        productId: product.id,
        title: variant.title || '',
        size: variant.size || '',
        color: variant.color || '',
        sku: variant.sku || '',
        stock: parseInt(variant.stock) || 0
      }))

      const { error: variantError } = await supabase
        .from('ProductVariant')
        .insert(variants)

      if (variantError) {
        // If variant creation fails, we should still return the product
        console.error('Error creating variants:', variantError)
      }
    }

    // Fetch the complete product with variants
    const { data: completeProduct, error: fetchError } = await supabase
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
      .eq('id', product.id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete product:', fetchError)
      // Return basic product if fetch fails
      return NextResponse.json({
        success: true,
        data: { product },
        message: 'Product created successfully'
      })
    }

    // Calculate total stock
    const totalStock = completeProduct.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0

    return NextResponse.json({
      success: true,
      data: { 
        product: {
          ...completeProduct,
          totalStock
        }
      },
      message: 'Product created successfully'
    })
  } catch (error: any) {
    console.error('POST API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
})
