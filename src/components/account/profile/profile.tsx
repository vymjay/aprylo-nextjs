'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { getInternalUserId, getCurrentUserAddresses, updateProfile, updateAddresses } from '@/lib/repositories/user-repository'
import { useRouter } from 'next/navigation'
import AddressForm from '@/components/account/address/address-form'
import { Address, UserWithMinimal } from '@/types/address.types'

export default function Profile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [internalUserId, setInternalUserId] = useState<number | null>(null)
  const [name, setName] = useState(user?.user_metadata?.name || '')
  const [addresses, setAddresses] = useState<Address[]>([])
  const [deletedAddressIds, setDeletedAddressIds] = useState<number[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchUserAndAddresses() {
      if (!user) return
      setIsLoading(true)
      try {
        // 1. Get internal user ID
        const internalId = await getInternalUserId();
        setInternalUserId(internalId);

        // 2. Fetch addresses
        const addressData = await getCurrentUserAddresses();
        
        setAddresses(
          addressData?.map(addr => ({
            id: addr.id,
            name: addr.name,
            street: addr.street,
            city: addr.city,
            state: addr.state,
            postal_code: addr.zipCode,
            country: addr.country,
            phone: addr.phone,
            isDefault: addr.isDefault,
          })) || []
        )
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load profile data.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndAddresses()
  }, [user, toast])

  function ensureSingleDefault(addressesList: Address[]) {
    // If no address marked default, set first as default
    if (!addressesList.some(addr => addr.isDefault)) {
      if (addressesList.length > 0) {
        addressesList[0].isDefault = true
      }
    }
    // If multiple defaults, keep only the first default
    const defaultCount = addressesList.filter(addr => addr.isDefault).length
    if (defaultCount > 1) {
      let foundFirst = false
      addressesList.forEach(addr => {
        if (addr.isDefault) {
          if (!foundFirst) {
            foundFirst = true
          } else {
            addr.isDefault = false
          }
        }
      })
    }
    return addressesList
  }

  function updateAddress(index: number, updated: Address) {
    let newAddresses = [...addresses]
    newAddresses[index] = updated

    if (updated.isDefault) {
      // Only one default allowed, reset others
      newAddresses = newAddresses.map((addr, i) => ({
        ...addr,
        isDefault: i === index,
      }))
    } else {
      // If no default at all, ensure one default remains
      newAddresses = ensureSingleDefault(newAddresses)
    }

    setAddresses(newAddresses)
  }

  function removeAddress(index: number) {
    const removed = addresses[index]
    if (removed?.id !== undefined) {
      setDeletedAddressIds((prev) => [...prev, removed.id!])
      toast({
        title: 'Address removed',
        description: `"${removed.name || 'Address'}" will be deleted on save.`,
        variant: 'destructive',
      })
    }
    let newAddresses = addresses.filter((_, i) => i !== index)
    newAddresses = ensureSingleDefault(newAddresses)
    setAddresses(newAddresses)
  }

  function addAddress() {
    let newAddresses = [
      ...addresses,
      {
        name: '',
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        phone: '',
        isDefault: addresses.length === 0,
      },
    ]
    newAddresses = ensureSingleDefault(newAddresses)
    setAddresses(newAddresses)
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      // Update user profile
      await updateProfile(name);

      // Update addresses
      const addressPayloads = addresses.map(address => ({
        ...(address.id ? { id: address.id } : {}),
        userId: internalUserId!,
        name: address.name || '',
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.postal_code || '',
        country: address.country || '',
        phone: address.phone || '',
        isDefault: address.isDefault || false,
      }));

      await updateAddresses(addressPayloads, deletedAddressIds);
      setDeletedAddressIds([]);

      toast({
        title: 'Profile updated',
        description: 'Your details have been saved successfully.',
      })

      router.push('/')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) {
    return <p className="text-center mt-10">You need to log in to view this page.</p>
  }

  if (isLoading) {
    return <p className="text-center mt-10">Loading your profile...</p>
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        handleSave()
      }}
      className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-12"
      autoComplete="on"
    >
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      {/* Email (readonly) */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={user.email}
          disabled
          className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 cursor-not-allowed"
          autoComplete="email"
        />
      </div>

      {/* Name */}
      <div className="mb-6">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
        />
      </div>

      {/* Addresses */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Addresses</h2>
        {addresses.map((address, index) => (
          <AddressForm
            key={index}
            address={address}
            index={index}
            onChange={(idx, updated) => updateAddress(idx, updated)}
            onRemove={(idx) => removeAddress(idx)}
          />
        ))}
        <Button type="button" onClick={addAddress} variant="outline" className="w-full mt-2">
          Add Address
        </Button>
      </div>

      {/* Save */}
      <Button type="submit" disabled={isSaving} className="w-full">
        {isSaving ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  )
}