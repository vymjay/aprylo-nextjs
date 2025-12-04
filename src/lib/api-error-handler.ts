import { NextResponse } from 'next/server'

export interface APIError {
  message: string
  status: number
  code?: string
  details?: any
}

export class APIErrorHandler {
  static createError(message: string, status: number = 500, code?: string, details?: any): APIError {
    return { message, status, code, details }
  }

  static handleError(error: any): NextResponse {
    console.error('API Error:', error)

    // Handle custom error objects with status
    if (error.message && error.status) {
      return NextResponse.json(
        { 
          error: error.message, 
          code: error.code,
          details: error.details 
        }, 
        { status: error.status }
      )
    }

    // Handle validation errors (from zod, joi, etc.)
    if (error.name === 'ValidationError' || error.errors) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors || error.message 
        }, 
        { status: 400 }
      )
    }

    // Handle database errors
    if (error.code === 'PGRST116' || error.message?.includes('not found')) {
      return NextResponse.json(
        { error: 'Resource not found' }, 
        { status: 404 }
      )
    }

    if (error.code === 'PGRST204' || error.message?.includes('duplicate')) {
      return NextResponse.json(
        { error: 'Resource already exists' }, 
        { status: 409 }
      )
    }

    // Handle authentication errors
    if (error.message?.includes('unauthorized') || error.message?.includes('authentication')) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    if (error.message?.includes('forbidden') || error.message?.includes('permission')) {
      return NextResponse.json(
        { error: 'Forbidden' }, 
        { status: 403 }
      )
    }

    // Default server error
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }

  static validateRequired(data: any, fields: string[]): void {
    const missing = fields.filter(field => !data[field])
    if (missing.length > 0) {
      throw this.createError(
        `Missing required fields: ${missing.join(', ')}`, 
        400,
        'MISSING_FIELDS',
        { missingFields: missing }
      )
    }
  }

  static validateTypes(data: any, schema: Record<string, string>): void {
    const errors: string[] = []
    
    Object.entries(schema).forEach(([field, expectedType]) => {
      if (data[field] !== undefined && typeof data[field] !== expectedType) {
        errors.push(`${field} must be of type ${expectedType}`)
      }
    })

    if (errors.length > 0) {
      throw this.createError(
        'Type validation failed',
        400,
        'TYPE_VALIDATION_ERROR',
        { errors }
      )
    }
  }

  // Common error responses
  static notFound(resource = 'Resource'): NextResponse {
    return NextResponse.json(
      { error: `${resource} not found` }, 
      { status: 404 }
    )
  }

  static unauthorized(): NextResponse {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    )
  }

  static forbidden(): NextResponse {
    return NextResponse.json(
      { error: 'Forbidden' }, 
      { status: 403 }
    )
  }

  static badRequest(message = 'Bad request'): NextResponse {
    return NextResponse.json(
      { error: message }, 
      { status: 400 }
    )
  }

  static conflict(message = 'Resource already exists'): NextResponse {
    return NextResponse.json(
      { error: message }, 
      { status: 409 }
    )
  }
}

// Wrapper function for API routes to handle errors automatically
export function withErrorHandler(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      return APIErrorHandler.handleError(error)
    }
  }
}

// Middleware for parameter validation
export function withValidation(schema: {
  required?: string[]
  types?: Record<string, string>
}) {
  return function(handler: Function) {
    return withErrorHandler(async (request: Request) => {
      let data: any = {}
      
      try {
        // Parse request body if it exists
        if (request.method !== 'GET' && request.method !== 'DELETE') {
          data = await request.json()
        }
      } catch (error) {
        throw APIErrorHandler.createError('Invalid JSON in request body', 400)
      }

      // Validate required fields
      if (schema.required) {
        APIErrorHandler.validateRequired(data, schema.required)
      }

      // Validate types
      if (schema.types) {
        APIErrorHandler.validateTypes(data, schema.types)
      }

      return handler(request, data)
    })
  }
}
