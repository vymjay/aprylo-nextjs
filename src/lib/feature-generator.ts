/**
 * Feature Generator Utility
 * Helps generate standardized feature components and hooks following common patterns
 */

import { 
  QueryKeyFactory, 
  createQueryKeyFactory, 
  FeatureStructure, 
  generateFeaturePaths,
  CrudComponentProps,
  ListComponentProps,
  FormComponentProps,
  UseDataOptions,
  UseMutationOptions
} from './common-patterns'

export interface FeatureConfig {
  name: string
  entityName: string
  hasInfiniteScroll?: boolean
  hasFiltering?: boolean
  hasSearch?: boolean
  hasSorting?: boolean
  fields: FeatureField[]
}

export interface FeatureField {
  name: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'text'
  required?: boolean
  validation?: string[]
  label?: string
}

/**
 * Generates standardized component templates
 */
export class FeatureGenerator {
  private config: FeatureConfig

  constructor(config: FeatureConfig) {
    this.config = config
  }

  /**
   * Generate TypeScript interface for the entity
   */
  generateEntityInterface(): string {
    const fields = this.config.fields
      .map(field => {
        const optional = field.required ? '' : '?'
        let tsType = this.mapToTSType(field.type)
        return `  ${field.name}${optional}: ${tsType}`
      })
      .join('\n')

    return `export interface ${this.pascalCase(this.config.entityName)} {
  id: number
${fields}
  createdAt?: string
  updatedAt?: string
}

export interface ${this.pascalCase(this.config.entityName)}CreateInput {
${fields.replace(/\?:/g, ':')}
}

export interface ${this.pascalCase(this.config.entityName)}UpdateInput {
${fields}
}`
  }

  /**
   * Generate API hook with standardized patterns
   */
  generateApiHook(): string {
    const entityName = this.config.entityName
    const EntityName = this.pascalCase(entityName)
    const ENTITY_KEYS = entityName.toUpperCase() + '_KEYS'

    return `'use client'

import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { createQueryKeyFactory } from '@/lib/common-patterns'
import { fetcher } from '@/lib/utils/api-fetch'
import type { ${EntityName}, ${EntityName}CreateInput, ${EntityName}UpdateInput } from '@/types/${entityName}'

// Query Keys
export const ${ENTITY_KEYS} = createQueryKeyFactory('${entityName}')

// ==================== QUERIES ====================

/**
 * Get all ${entityName}s with optional filtering
 */
export function use${EntityName}s(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: ${ENTITY_KEYS}.list(filters),
    queryFn: () => {
      const params = new URLSearchParams(filters)
      return fetcher<${EntityName}[]>(\`/api/${entityName}?\${params}\`)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get single ${entityName} by ID
 */
export function use${EntityName}(id: string | number) {
  return useQuery({
    queryKey: ${ENTITY_KEYS}.detail(id),
    queryFn: () => fetcher<${EntityName}>(\`/api/${entityName}/\${id}\`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

${this.config.hasInfiniteScroll ? this.generateInfiniteQuery() : ''}

// ==================== MUTATIONS ====================

/**
 * Create new ${entityName}
 */
export function useCreate${EntityName}Mutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ${EntityName}CreateInput) => {
      return fetcher<${EntityName}>('/api/${entityName}', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ${ENTITY_KEYS}.lists() })
    },
  })
}

/**
 * Update ${entityName}
 */
export function useUpdate${EntityName}Mutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: ${EntityName}UpdateInput }) => {
      return fetcher<${EntityName}>(\`/api/${entityName}/\${id}\`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ${ENTITY_KEYS}.lists() })
      queryClient.invalidateQueries({ queryKey: ${ENTITY_KEYS}.detail(data.id) })
    },
  })
}

/**
 * Delete ${entityName}
 */
export function useDelete${EntityName}Mutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string | number) => {
      return fetcher(\`/api/${entityName}/\${id}\`, {
        method: 'DELETE',
      })
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ${ENTITY_KEYS}.lists() })
      queryClient.removeQueries({ queryKey: ${ENTITY_KEYS}.detail(id) })
    },
  })
}`
  }

  /**
   * Generate infinite query if enabled
   */
  private generateInfiniteQuery(): string {
    const EntityName = this.pascalCase(this.config.entityName)
    const entityName = this.config.entityName
    const ENTITY_KEYS = entityName.toUpperCase() + '_KEYS'

    return `
/**
 * Infinite scroll ${entityName}s
 */
export function useInfinite${EntityName}s(filters: Record<string, any> = {}) {
  return useInfiniteQuery({
    queryKey: ${ENTITY_KEYS}.infinite(filters),
    queryFn: ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ ...filters, page: pageParam.toString(), limit: '10' })
      return fetcher<{ ${entityName}s: ${EntityName}[], pagination: any }>(\`/api/${entityName}?\${params}\`)
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination?.hasMore ? lastPage.pagination.currentPage + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}`
  }

  /**
   * Generate list component
   */
  generateListComponent(): string {
    const EntityName = this.pascalCase(this.config.entityName)
    const entityName = this.config.entityName

    return `'use client'

import { useState, useMemo, useCallback } from 'react'
import { use${EntityName}s, useDelete${EntityName}Mutation } from '@/hooks/api/use-${entityName}'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus } from 'lucide-react'
import ${EntityName}Item from './${entityName}-item'
import ${EntityName}Form from './${entityName}-form'
import ${EntityName}Skeleton from './${entityName}-skeleton'
import type { ${EntityName} } from '@/types/${entityName}'

interface ${EntityName}ListProps {
  filters?: Record<string, any>
  onItemSelect?: (item: ${EntityName}) => void
  showCreateButton?: boolean
}

export default function ${EntityName}List({ 
  filters = {}, 
  onItemSelect,
  showCreateButton = true 
}: ${EntityName}ListProps) {
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  
  const { data: ${entityName}s, isLoading, error, refetch } = use${EntityName}s(filters)
  const deleteM utation = useDelete${EntityName}Mutation()

  const handleDelete = useCallback(async (id: string | number) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast({
        title: 'Success',
        description: '${EntityName} deleted successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete ${entityName}',
        variant: 'destructive',
      })
    }
  }, [deleteMutation, toast])

  const handleCreateSuccess = useCallback(() => {
    setIsCreating(false)
    refetch()
  }, [refetch])

  if (isLoading) {
    return <${EntityName}Skeleton />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load ${entityName}s</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">${EntityName}s</h2>
        {showCreateButton && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add ${EntityName}
          </Button>
        )}
      </div>

      {isCreating && (
        <${EntityName}Form
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreating(false)}
        />
      )}

      <div className="grid gap-4">
        {${entityName}s?.length > 0 ? (
          ${entityName}s.map((item) => (
            <${EntityName}Item
              key={item.id}
              ${entityName}={item}
              onSelect={() => onItemSelect?.(item)}
              onDelete={() => handleDelete(item.id)}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            No ${entityName}s found
          </div>
        )}
      </div>
    </div>
  )
}`
  }

  /**
   * Generate form component
   */
  generateFormComponent(): string {
    const EntityName = this.pascalCase(this.config.entityName)
    const entityName = this.config.entityName

    const formFields = this.config.fields
      .map(field => this.generateFormField(field))
      .join('\n\n')

    const validationSchema = this.generateValidationSchema()

    return `'use client'

import { useState } from 'react'
import { useCreate${EntityName}Mutation, useUpdate${EntityName}Mutation } from '@/hooks/api/use-${entityName}'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import type { ${EntityName}, ${EntityName}CreateInput, ${EntityName}UpdateInput } from '@/types/${entityName}'

interface ${EntityName}FormProps {
  ${entityName}?: ${EntityName}
  onSuccess?: (${entityName}: ${EntityName}) => void
  onCancel?: () => void
}

export default function ${EntityName}Form({ ${entityName}, onSuccess, onCancel }: ${EntityName}FormProps) {
  const isEdit = !!${entityName}
  const [formData, setFormData] = useState<${EntityName}CreateInput>({
${this.config.fields.map(field => `    ${field.name}: ${entityName}?.${field.name} || ${this.getDefaultValue(field.type)},`).join('\n')}
  })
  
  const { toast } = useToast()
  const createMutation = useCreate${EntityName}Mutation()
  const updateMutation = useUpdate${EntityName}Mutation()
  
  const isLoading = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isEdit) {
        const result = await updateMutation.mutateAsync({ 
          id: ${entityName}!.id, 
          data: formData as ${EntityName}UpdateInput 
        })
        onSuccess?.(result)
      } else {
        const result = await createMutation.mutateAsync(formData)
        onSuccess?.(result)
      }
      
      toast({
        title: 'Success',
        description: \`${EntityName} \${isEdit ? 'updated' : 'created'} successfully\`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: \`Failed to \${isEdit ? 'update' : 'create'} ${entityName}\`,
        variant: 'destructive',
      })
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold">
        {isEdit ? 'Edit' : 'Create'} ${EntityName}
      </h3>
      
${formFields}

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEdit ? 'Update' : 'Create'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}`
  }

  /**
   * Generate form field based on field type
   */
  private generateFormField(field: FeatureField): string {
    const fieldName = field.name
    const label = field.label || this.capitalize(fieldName)
    
    switch (field.type) {
      case 'text':
        return `      <div>
        <Label htmlFor="${fieldName}">${label}</Label>
        <textarea
          id="${fieldName}"
          value={formData.${fieldName}}
          onChange={(e) => handleChange('${fieldName}', e.target.value)}
          className="w-full min-h-[100px] p-2 border rounded-md"
          ${field.required ? 'required' : ''}
        />
      </div>`
      
      case 'boolean':
        return `      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="${fieldName}"
          checked={formData.${fieldName}}
          onChange={(e) => handleChange('${fieldName}', e.target.checked)}
        />
        <Label htmlFor="${fieldName}">${label}</Label>
      </div>`
      
      default:
        return `      <div>
        <Label htmlFor="${fieldName}">${label}</Label>
        <Input
          type="${this.mapToInputType(field.type)}"
          id="${fieldName}"
          value={formData.${fieldName}}
          onChange={(e) => handleChange('${fieldName}', e.target.value)}
          ${field.required ? 'required' : ''}
        />
      </div>`
    }
  }

  /**
   * Generate validation schema
   */
  private generateValidationSchema(): string {
    return this.config.fields
      .map(field => {
        const validations = field.validation || []
        if (field.required) validations.unshift('required')
        return `    ${field.name}: [${validations.map(v => `'${v}'`).join(', ')}]`
      })
      .join(',\n')
  }

  /**
   * Utility methods
   */
  private pascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  private mapToTSType(type: string): string {
    switch (type) {
      case 'string':
      case 'email':
      case 'url':
      case 'text':
        return 'string'
      case 'number':
        return 'number'
      case 'boolean':
        return 'boolean'
      case 'date':
        return 'Date | string'
      default:
        return 'string'
    }
  }

  private mapToInputType(type: string): string {
    switch (type) {
      case 'email':
        return 'email'
      case 'url':
        return 'url'
      case 'number':
        return 'number'
      case 'date':
        return 'date'
      default:
        return 'text'
    }
  }

  private getDefaultValue(type: string): string {
    switch (type) {
      case 'number':
        return '0'
      case 'boolean':
        return 'false'
      case 'date':
        return "''"
      default:
        return "''"
    }
  }
}

/**
 * CLI-like function to generate a complete feature
 */
export function generateFeature(config: FeatureConfig): Record<string, string> {
  const generator = new FeatureGenerator(config)
  const paths = generateFeaturePaths(config.name)

  return {
    [`${paths.types.entity}`]: generator.generateEntityInterface(),
    [`${paths.hooks.useList}`]: generator.generateApiHook(),
    [`${paths.components.list}`]: generator.generateListComponent(),
    [`${paths.components.form}`]: generator.generateFormComponent(),
    // Add more component templates as needed
  }
}

export default FeatureGenerator
