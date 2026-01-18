import { createMongoAbility, MongoAbility, RawRuleOf } from "@casl/ability"

import { AclSubject } from "./types"
import type { Abilities, AclActionValues, AclSubjectValues, Permission } from "./types"

/**
 * Type alias for the application's CASL ability instance
 */
export type AppAbility = MongoAbility<Abilities>

/**
 * Creates an empty ability with no permissions
 * Used as default when user is not authenticated
 */
export function createEmptyAbility(): AppAbility {
  return createMongoAbility<Abilities>([])
}

/**
 * Creates a CASL ability instance from user permissions
 * Flattens permissions from all user roles into a single ability
 *
 * @param permissions - Array of permission objects from user's roles
 * @returns MongoAbility instance for permission checks
 */
export function createAbilityFromPermissions(
  permissions: Permission[]
): AppAbility {
  const rules: RawRuleOf<AppAbility>[] = []

  for (const p of permissions) {
    // If user has "manage All", expand it to all subjects
    // This ensures Super Admin can access everything
    if (p.action === "manage" && p.subject === "All") {
      // Add explicit permissions for all subjects
      const allSubjects: AclSubjectValues[] = Object.values(AclSubject) as AclSubjectValues[]
      for (const subject of allSubjects) {
        if (subject !== "All") {
          // Skip adding "All" itself, add all other subjects
          rules.push({
            action: p.action as AclActionValues,
            subject: subject,
          })
        }
      }
      // Also add the "manage All" rule itself for completeness
      rules.push({
        action: p.action as AclActionValues,
        subject: "All" as AclSubjectValues,
      })
    } else {
      // Regular permission
      rules.push({
        action: p.action as AclActionValues,
        subject: p.subject as AclSubjectValues,
      })
    }
  }

  return createMongoAbility<Abilities>(rules)
}

/**
 * Extracts and flattens permissions from user roles
 *
 * @param roles - Array of roles with permissions
 * @returns Flattened array of all permissions
 */
export function flattenRolesPermissions(
  roles: Array<{ permissions: Permission[] }>
): Permission[] {
  return roles.flatMap((role) => role.permissions)
}
