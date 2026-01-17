import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';

import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import type { PageOptionsDto } from '../../common/dtos/page-options.dto';
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
    const findOptions: any = {
      where: {
        id: Not(1), // 1 = Super Admin
      },
      skip: options.getSkip(),
      order: options.sortBy
        ? { [options.sortBy]: options.order }
        : { id: 'ASC' },
    };

    // Only add take if pageSize is not 0 (0 means load all)
    const take = options.getTake();
    if (take !== undefined) {
      findOptions.take = take;
    }

    const [res, count] = await this.roleRepository.findAndCount(findOptions);

    const data = res.map((role) => new RoleDto(role));
    const meta = new PageMetaDto({ pageOptionsDto: options, itemCount: count });

    return { data, meta };
  }

  async findOne(id: number) {
    return this.roleRepository.findOneBy({ id });
  }
}
