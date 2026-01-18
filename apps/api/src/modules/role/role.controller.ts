import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';

import { Auth } from '../../decorators';
import { RoleService } from './role.service';
import { RoleDto } from './dtos/role.dto';
import { PageOptionsDto } from '../../common/dtos/page-options.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Controller({ path: 'roles', version: '1' })
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @Auth([])
  async findAll(@Query() query: PageOptionsDto): Promise<{
    data: RoleDto[];
    meta: PageMetaDto;
  }> {
    return this.roleService.findAll(query);
  }

  @Get('code/:code')
  @Auth([])
  async findByCode(@Param('code') code: string): Promise<RoleDto | null> {
    const role = await this.roleService.findByCode(code);
    return role ? new RoleDto(role) : null;
  }
}
