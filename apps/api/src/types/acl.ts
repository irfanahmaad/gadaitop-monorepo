import type { AclAction, AclSubject } from '../constants/acl';

type AclActionKeys = keyof typeof AclAction;
export type AclActionValues = (typeof AclAction)[AclActionKeys];

type AclSubjectKeys = keyof typeof AclSubject;
export type AclSubjectValues = (typeof AclSubject)[AclSubjectKeys];
