'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Address, AddressFormProps } from '@/types/address.types'

export default function AddressForm({ address, index, onChange, onRemove }: AddressFormProps) {
  function updateField(field: keyof Address, value: any) {
    onChange(index, { ...address, [field]: value })
  }

  return (
    <div className="border p-4 rounded mb-6 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Address {index + 1}</h3>
        <Button variant="destructive" size="sm" onClick={() => onRemove(index)}>
          Remove
        </Button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address Name
        </label>
        <Input
          value={address.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Address name (e.g. Home, Work)"
          required
          autoComplete="address-line1"
          name={`address-name-${index}`}
          id={`address-name-${index}`}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street
        </label>
        <Input
          value={address.street || ''}
          onChange={(e) => updateField('street', e.target.value)}
          placeholder="Street"
          required
          autoComplete="address-line1"
          name={`street-${index}`}
          id={`street-${index}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <Input
            value={address.city || ''}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="City"
            required
            autoComplete="address-level2"
            name={`city-${index}`}
            id={`city-${index}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <Input
            value={address.state || ''}
            onChange={(e) => updateField('state', e.target.value)}
            placeholder="State"
            required
            autoComplete="address-level1"
            name={`state-${index}`}
            id={`state-${index}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code
          </label>
          <Input
            value={address.postal_code || ''}
            onChange={(e) => updateField('postal_code', e.target.value)}
            placeholder="Postal Code"
            required
            autoComplete="postal-code"
            name={`postal-code-${index}`}
            id={`postal-code-${index}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <Input
            value={address.country || ''}
            onChange={(e) => updateField('country', e.target.value)}
            placeholder="Country"
            required
            autoComplete="country-name"
            name={`country-${index}`}
            id={`country-${index}`}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <Input
          type="tel"
          value={address.phone || ''}
          onChange={(e) => updateField('phone', e.target.value)}
          placeholder="Phone number"
          required
          autoComplete="tel"
          name={`phone-${index}`}
          id={`phone-${index}`}
        />
      </div>

      <div className="mb-0 flex items-center space-x-2">
        <input
          type="checkbox"
          checked={!!address.isDefault}
          onChange={(e) => updateField('isDefault', e.target.checked)}
          id={`isDefault-${index}`}
          className="w-5 h-5"
        />
        <label htmlFor={`isDefault-${index}`} className="text-sm font-medium text-gray-700">
          Set as default address
        </label>
      </div>
    </div>
  )
}