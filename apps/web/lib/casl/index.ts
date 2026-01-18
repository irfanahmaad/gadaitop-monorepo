/**
 * CASL Permission Management
 * Re-exports all CASL-related functionality
 */

// Types and constants
export { AclAction, AclSubject } from "./types"
export type {
  AclActionValues,
  AclSubjectValues,
  Abilities,
  Permission,
} from "./types"

// Ability factory functions
export {
  createAbilityFromPermissions,
  createEmptyAbility,
  flattenRolesPermissions,
} from "./ability"
export type { AppAbility } from "./ability"

// React context and components
export { AbilityContext, AbilityProvider, Can, useAppAbility } from "./context"
