import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';

import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import type { PageOptionsDto } from '../../common/dtos/page-options.dto';
import {
  DynamicQueryBuilder,
  QueryBuilderOptionsType,
  sortAttribute,
} from '../../common/helpers/query-builder';
import { RoleDto } from './dtos/role.dto';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {}

  async findByUser(userId: number) {
    return this.roleRepository
      .createQueryBuilder('role')
      .innerJoin('user_roles', 'ur', 'ur.role_id = role.id')
      .where('ur.user_id = :userId', { userId })
      .andWhere('role.deleted_at IS NULL')
      .getMany();
  }

  async findByids(ids: number[]) {
    return this.roleRepository.findBy({ id: In(ids) });
  }

  async findAll(options: PageOptionsDto): Promise<{
    data: RoleDto[];
    meta: PageMetaDto;
  }> {
    const qbOptions: QueryBuilderOptionsType<RoleEntity> = {
      ...options,
      select: {
        name: true,
        code: true,
        description: true,
        permissions: true,
        isSystemRole: true,
        isActive: true,
      },
      where: {
        id: Not(1), // 1 = Super Admin
      },
      orderBy: sortAttribute(options.sortBy, {
        name: { name: true },
        code: { code: true },
      }) ?? { id: 'ASC' } as any,
    };

    const dynamicQueryBuilder = new DynamicQueryBuilder(this.roleRepository.metadata);
    const [res, count] = await dynamicQueryBuilder.buildDynamicQuery(
      RoleEntity.createQueryBuilder('roles'),
      qbOptions,
    );

    const data = res.map((role) => new RoleDto(role));
    const meta = new PageMetaDto({ pageOptionsDto: options, itemCount: count });

    return { data, meta };
  }

  async findOne(id: number) {
    return this.roleRepository.findOneBy({ id });
  }

  async findByCode(code: string) {
    return this.roleRepository.findOneBy({ code });
  }
}
