import { flatMap, map } from 'lodash';

import { createMongoAbility, ForbiddenError } from '@casl/ability';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PERMISSION_CHECKER_KEY } from '../decorators/permission.decorator';

import type {
  ForcedSubject,
  MongoAbility,
  RawRuleOf,
} from '@casl/ability';
import type {
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import type { IAbility } from '../interfaces/IAbility';
import type { RoleEntity } from '../modules/role/entities/role.entity';
import type { AclActionValues, AclSubjectValues } from '../types';

export type Abilities = [
  AclActionValues,
  AclSubjectValues | ForcedSubject<Exclude<AclSubjectValues, 'all'>>,
];

export type AppAbility = MongoAbility<Abilities>;

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  createAbility = (rules: Array<RawRuleOf<AppAbility>>) =>
    createMongoAbility<AppAbility>(rules);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules: IAbility[] = this.reflector.get<IAbility[]>(
      PERMISSION_CHECKER_KEY,
      context.getHandler(),
    );

    if (!rules || rules.length === 0) {
      return true;
    }

    const currentUser = context.switchToHttp().getRequest().user;
    const roles: RoleEntity[] = currentUser?.roles || [];

    const permissions: IAbility[] = flatMap(roles, 'permissions');

    const parsedUserPermissions = this.parseCondition(permissions);

    try {
      const ability = this.createAbility(parsedUserPermissions as any);

      for (const rule of rules) {
        ForbiddenError.from(ability)
          .setMessage('You are not allowed to perform this action')
          .throwUnlessCan(rule.action, rule.subject);
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }

      throw error;
    }
  }

  parseCondition(permissions: IAbility[]) {
    const data = map(permissions, (permission) => permission);

    return data;
  }
}
