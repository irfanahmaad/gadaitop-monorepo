import type { AclActionValues, AclSubjectValues } from '../types';

export interface IAbility {
  action: AclActionValues;
  subject: AclSubjectValues;
  condition?: unknown;
}
