"use client"

import * as React from "react"
import { createContext } from "react"
import { createContextualCan, useAbility } from "@casl/react"
import { useSession } from "next-auth/react"

import {
  createAbilityFromPermissions,
  createEmptyAbility,
  flattenRolesPermissions,
  type AppAbility,
} from "./ability"

/**
 * React Context for CASL Ability
 * Provides ability instance to child components
 */
export const AbilityContext = createContext<AppAbility>(createEmptyAbility())

/**
 * Create the Can component bound to AbilityContext
 * Usage: <Can I="manage" a="User">...</Can>
 */
export const Can = createContextualCan(AbilityContext.Consumer)

/**
 * Hook to access the current ability instance
 * Usage: const ability = useAppAbility()
 */
export function useAppAbility() {
  return useAbility(AbilityContext)
}

/**
 * AbilityProvider component
 * Builds ability from authenticated user's permissions and provides it via context
 */
export function AbilityProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  const ability = React.useMemo(() => {
    // If not authenticated or loading, return empty ability
    if (status !== "authenticated" || !session?.user?.roles) {
      return createEmptyAbility()
    }

    // Flatten permissions from all user roles
    const permissions = flattenRolesPermissions(session.user.roles)

    // Debug: Log permissions (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log("CASL Debug - Session:", {
        roles: session.user.roles,
        permissions,
        rolesCount: session.user.roles.length,
        permissionsCount: permissions.length,
      })
    }

    // Create ability from permissions
    return createAbilityFromPermissions(permissions)
  }, [session, status])

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  )
}
