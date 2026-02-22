import { RoleEntity } from '../../role/entities/role.entity';

export class LogedUserDto {
  userId: number;

  uuid: string;

  roles: RoleEntity[];

  companyId: string | null;

  ownedCompanyId: string | null;

  branchId: string | null;

  constructor(
    userId: number,
    uuid: string,
    roles: RoleEntity[],
    companyId: string | null = null,
    ownedCompanyId: string | null = null,
    branchId: string | null = null,
  ) {
    this.userId = userId;
    this.uuid = uuid;
    this.roles = roles;
    this.companyId = companyId;
    this.ownedCompanyId = ownedCompanyId;
    this.branchId = branchId;
  }
}
