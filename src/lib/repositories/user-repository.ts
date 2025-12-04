import type { Tables } from "@/types/db";

type UserRow = Tables<"User">;
type UserInsert = Omit<UserRow, "id" | "createdAt" | "updatedAt">;
type UserUpdate = Partial<UserInsert>;

type AddressRow = Tables<"Address">;
type AddressInsert = Omit<AddressRow, "id">;
type AddressUpdate = Partial<AddressInsert>;

// ------------------- USER QUERIES -------------------

export async function getInternalUserId() {
  const response = await fetch("/api/users/internal-id", {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const data = await response.json();
  return data.id as number;
}

export async function getUserById(id: number) {
  const response = await fetch(`/api/users?userId=${id}`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json() as Promise<UserRow>;
}

export async function createUser(payload: UserInsert) {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json() as Promise<UserRow>;
}

export async function updateUser(id: number, payload: UserUpdate) {
  const response = await fetch("/api/users", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, ...payload }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json() as Promise<UserRow>;
}

export async function updateProfile(name: string) {
  const response = await fetch("/api/users/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json() as Promise<UserRow>;
}

export async function updateAddresses(addresses: AddressInsert[], deletedIds: number[]) {
  const response = await fetch("/api/users/addresses/batch", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ addresses, deletedIds }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json() as Promise<AddressRow[]>;
}

// ------------------- ADDRESS QUERIES -------------------

export async function getCurrentUserAddresses() {
  const response = await fetch(`/api/users/addresses/current`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json() as Promise<AddressRow[]>;
}

export async function getAddressByUserId(userId: number) {
  const response = await fetch(`/api/users/addresses?userId=${userId}`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json() as Promise<AddressRow[]>;
}

export async function createAddress(payload: AddressInsert) {
  const response = await fetch("/api/users/addresses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json() as Promise<AddressRow>;
}

export async function updateAddress(id: number, payload: AddressUpdate) {
  const response = await fetch("/api/users/addresses", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, ...payload }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json() as Promise<AddressRow>;
}

export async function deleteAddress(id: number) {
  const response = await fetch(`/api/users/addresses?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}