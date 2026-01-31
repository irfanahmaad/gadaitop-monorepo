import type { User, Role } from "@/lib/api/types"

// Dummy roles data
export const dummyRoles: Role[] = [
  {
    id: 1,
    uuid: "role-1",
    name: "Admin PT",
    code: "owner",
    description: "Admin Perusahaan",
    permissions: [],
    isSystemRole: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    uuid: "role-2",
    name: "Staf Toko",
    code: "staf-toko",
    description: "Staf Toko",
    permissions: [],
    isSystemRole: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    uuid: "role-3",
    name: "Stock Opname",
    code: "stock-opname",
    description: "Stock Opname",
    permissions: [],
    isSystemRole: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    uuid: "role-4",
    name: "Lelang",
    code: "lelang",
    description: "Lelang",
    permissions: [],
    isSystemRole: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    uuid: "role-5",
    name: "Marketing",
    code: "marketing",
    description: "Marketing",
    permissions: [],
    isSystemRole: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Dummy users data - using a function to create fresh instances
let userCounter = 6

export function getDummyUsers(): User[] {
  return [
    {
      id: 1,
      uuid: "user-1",
      email: "john.doe@example.com",
      fullName: "John Doe",
      phoneNumber: "081234567890",
      activeStatus: "active",
      isEmailVerified: true,
      isPhoneVerified: true,
      roles: [dummyRoles[0]!],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      uuid: "user-2",
      email: "jane.smith@example.com",
      fullName: "Jane Smith",
      phoneNumber: "081234567891",
      activeStatus: "active",
      isEmailVerified: true,
      isPhoneVerified: false,
      roles: [dummyRoles[1]!, dummyRoles[2]!],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      uuid: "user-3",
      email: "bob.wilson@example.com",
      fullName: "Bob Wilson",
      phoneNumber: "081234567892",
      activeStatus: "active",
      isEmailVerified: true,
      isPhoneVerified: true,
      roles: [dummyRoles[3]!],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      uuid: "user-4",
      email: "alice.brown@example.com",
      fullName: "Alice Brown",
      phoneNumber: undefined,
      activeStatus: "inactive",
      isEmailVerified: false,
      isPhoneVerified: false,
      roles: [dummyRoles[4]!],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 5,
      uuid: "user-5",
      email: "charlie.davis@example.com",
      fullName: "Charlie Davis",
      phoneNumber: "081234567893",
      activeStatus: "active",
      isEmailVerified: true,
      isPhoneVerified: true,
      roles: [dummyRoles[0]!, dummyRoles[1]!],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 6,
      uuid: "user-6",
      email: "diana.miller@example.com",
      fullName: "Diana Miller",
      phoneNumber: "081234567894",
      activeStatus: "active",
      isEmailVerified: true,
      isPhoneVerified: true,
      roles: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
}

// In-memory store for users (simulates database)
let usersStore: User[] = getDummyUsers()

export function getUsers(): User[] {
  return [...usersStore]
}

export function getUserById(uuid: string): User | undefined {
  return usersStore.find((u) => u.uuid === uuid)
}

export function createUser(userData: {
  fullName: string
  email: string
  password: string
  phoneNumber?: string
  roleIds?: string[]
}): User {
  userCounter++
  const newUser: User = {
    id: userCounter,
    uuid: `user-${userCounter}`,
    email: userData.email,
    fullName: userData.fullName,
    phoneNumber: userData.phoneNumber,
    activeStatus: "active",
    isEmailVerified: false,
    isPhoneVerified: false,
    roles: userData.roleIds
      ? dummyRoles.filter((r) => userData.roleIds!.includes(r.uuid))
      : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  usersStore.push(newUser)
  return newUser
}

export function updateUser(
  uuid: string,
  userData: {
    fullName?: string
    email?: string
    phoneNumber?: string
  }
): User | undefined {
  const userIndex = usersStore.findIndex((u) => u.uuid === uuid)
  if (userIndex === -1) return undefined

  const updatedUser: User = {
    ...usersStore[userIndex]!,
    ...userData,
    updatedAt: new Date().toISOString(),
  }
  usersStore[userIndex] = updatedUser
  return updatedUser
}

export function assignRolesToUser(
  uuid: string,
  roleIds: string[]
): User | undefined {
  const userIndex = usersStore.findIndex((u) => u.uuid === uuid)
  if (userIndex === -1) return undefined

  const updatedUser: User = {
    ...usersStore[userIndex]!,
    roles: dummyRoles.filter((r) => roleIds.includes(r.uuid)),
    updatedAt: new Date().toISOString(),
  }
  usersStore[userIndex] = updatedUser
  return updatedUser
}

export function deleteUser(uuid: string): boolean {
  const userIndex = usersStore.findIndex((u) => u.uuid === uuid)
  if (userIndex === -1) return false
  usersStore.splice(userIndex, 1)
  return true
}

export function resetUsers(): void {
  usersStore = getDummyUsers()
  userCounter = 6
}
