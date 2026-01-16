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
    return this.roleRepository.findBy({ users: { id: userId } });
  }

  async findByids(ids: number[]) {
    return this.roleRepository.findBy({ id: In(ids) });
  }

  async findAll(options: PageOptionsDto): Promise<{
    data: RoleDto[];
    meta: PageMetaDto;
  }> {
    const [res, count] = await this.roleRepository.findAndCount({
      where: {
        id: Not(1), // 1 = Super Admin
      },
      skip: options.skip,
      take: options.pageSize,
      order: options.sortBy
        ? { [options.sortBy]: options.order }
        : { id: 'ASC' },
    });

    const data = res.map((role) => new RoleDto(role));
    const meta = new PageMetaDto({ pageOptionsDto: options, itemCount: count });

    return { data, meta };
  }

  async findOne(id: number) {
    return this.roleRepository.findOneBy({ id });
  }
}
