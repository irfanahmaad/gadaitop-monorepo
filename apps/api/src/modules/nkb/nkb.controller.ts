import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { Auth } from '../../decorators';
import { AclAction, AclSubject } from '../../constants/acl';
import { NkbService } from './nkb.service';
import { NkbDto } from './dto/nkb.dto';
import { QueryNkbDto } from './dto/query-nkb.dto';
import { CreateNkbDto } from './dto/create-nkb.dto';
import { RejectNkbDto } from './dto/reject-nkb.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Controller({ path: 'nkb', version: '1' })
export class NkbController {
  constructor(private readonly nkbService: NkbService) {}

  @Get()
  @Auth([{ action: AclAction.READ, subject: AclSubject.NKB }])
  async findAll(
    @Query() queryDto: QueryNkbDto,
    @Req() req: Request,
  ): Promise<{ data: NkbDto[]; meta: PageMetaDto }> {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.nkbService.findAll(queryDto, userPtId);
  }

  @Post()
  @Auth([{ action: AclAction.CREATE, subject: AclSubject.NKB }])
  async create(
    @Body() createDto: CreateNkbDto,
    @Req() req: Request,
  ): Promise<NkbDto> {
    const user = (req as any).user;
    const createdBy = user?.uuid ?? null;
    return this.nkbService.create(createDto, createdBy);
  }

  @Put(':id/confirm')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.NKB }])
  async confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<NkbDto> {
    const user = (req as any).user;
    const confirmedBy = user?.uuid ?? '';
    return this.nkbService.confirm(id, confirmedBy);
  }

  @Put(':id/reject')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.NKB }])
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectNkbDto,
    @Req() req: Request,
  ): Promise<NkbDto> {
    const user = (req as any).user;
    const rejectedBy = user?.uuid ?? '';
    return this.nkbService.reject(id, dto, rejectedBy);
  }

  @Get(':id')
  @Auth([{ action: AclAction.READ, subject: AclSubject.NKB }])
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<NkbDto> {
    return this.nkbService.findOne(id);
  }
}
