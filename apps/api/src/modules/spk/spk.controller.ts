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
import { SpkService } from './spk.service';
import { SpkDto } from './dto/spk.dto';
import { CreateSpkDto } from './dto/create-spk.dto';
import { QuerySpkDto } from './dto/query-spk.dto';
import { ConfirmSpkDto } from './dto/confirm-spk.dto';
import { ExtendSpkDto } from './dto/extend-spk.dto';
import { RedeemSpkDto } from './dto/redeem-spk.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Controller({ path: 'spk', version: '1' })
export class SpkController {
  constructor(private readonly spkService: SpkService) {}

  @Get()
  @Auth([{ action: AclAction.READ, subject: AclSubject.SPK }])
  async findAll(
    @Query() queryDto: QuerySpkDto,
    @Req() req: Request,
  ): Promise<{ data: SpkDto[]; meta: PageMetaDto }> {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.spkService.findAll(queryDto, userPtId);
  }

  @Post()
  @Auth([{ action: AclAction.CREATE, subject: AclSubject.SPK }])
  async create(
    @Body() createDto: CreateSpkDto,
    @Req() req: Request,
  ): Promise<SpkDto> {
    const user = (req as any).user;
    const createdBy = user?.uuid ?? '';
    return this.spkService.create(createDto, createdBy);
  }

  @Put(':id/confirm')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.SPK }])
  async confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmSpkDto,
  ): Promise<SpkDto> {
    return this.spkService.confirm(id, dto);
  }

  @Get(':id/history')
  @Auth([{ action: AclAction.READ, subject: AclSubject.SPK }])
  async getHistory(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<unknown[]> {
    return this.spkService.getHistory(id);
  }

  @Get(':id/nkb')
  @Auth([{ action: AclAction.READ, subject: AclSubject.SPK }])
  async getNkb(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<unknown[]> {
    return this.spkService.getNkb(id);
  }

  @Put(':id/extend')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.SPK }])
  async extend(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ExtendSpkDto,
    @Req() req: Request,
  ): Promise<{ nkbNumber: string }> {
    const user = (req as any).user;
    const createdBy = user?.uuid ?? null;
    return this.spkService.extend(id, dto, createdBy);
  }

  @Put(':id/redeem')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.SPK }])
  async redeem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RedeemSpkDto,
    @Req() req: Request,
  ): Promise<{ nkbNumber: string }> {
    const user = (req as any).user;
    const createdBy = user?.uuid ?? null;
    return this.spkService.redeem(id, dto.amountPaid, createdBy);
  }

  @Get(':id')
  @Auth([{ action: AclAction.READ, subject: AclSubject.SPK }])
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<SpkDto> {
    return this.spkService.findOne(id);
  }
}
