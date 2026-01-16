export enum AclAction {
  MANAGE = 'manage',
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
}

export enum AclSubject {
  ALL = 'All',
  USER = 'User',
  LOCK_UNLOCK_DATA = 'LockUnlockData',
}
