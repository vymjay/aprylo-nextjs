// src/types/user.ts
import type { Database } from "./db"

// Pick the `User` table type from the generated Database type
export type UserTable = Database["public"]["Tables"]["User"]

// Insert & Update types
export type UserInsert = UserTable["Insert"]
export type UserUpdate = UserTable["Update"]
export type UserRow = UserTable["Row"]