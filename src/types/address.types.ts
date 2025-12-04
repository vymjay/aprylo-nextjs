export type Address = {
  id?: number
  name?: string
  street?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  phone?: string
  isDefault?: boolean
}

export type AddressFormProps = {
  address: Address
  index: number
  onChange: (index: number, updated: Address) => void
  onRemove: (index: number) => void
}

export type UserWithMinimal = {
  id: string // Supabase UUID from auth
  email: string
  name: string
}