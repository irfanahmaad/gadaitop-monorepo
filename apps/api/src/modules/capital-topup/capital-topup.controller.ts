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
import { CapitalTopupService } from './capital-topup.service';
import { CapitalTopupDto } from './dto/capital-topup.dto';
import { CreateCapitalTopupDto } from './dto/create-capital-topup.dto';
import { UpdateCapitalTopupDto } from './dto/update-capital-topup.dto';
import { QueryCapitalTopupDto } from './dto/query-capital-topup.dto';
import { RejectCapitalTopupDto } from './dto/reject-capital-topup.dto';
import { DisburseCapitalTopupDto } from './dto/disburse-capital-topup.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Controller({ path: 'capital-topups', version: '1' })
export class CapitalTopupController {
  constructor(private readonly capitalTopupService: CapitalTopupService) {}

  @Get()
  @Auth([{ action: AclAction.READ, subject: AclSubject.ADD_CAPITAL }])
  async findAll(
    @Query() queryDto: QueryCapitalTopupDto,
    @Req() req: Request,
  ): Promise<{ data: CapitalTopupDto[]; meta: PageMetaDto }> {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.capitalTopupService.findAll(queryDto, userPtId);
  }

  @Post()
  @Auth([{ action: AclAction.CREATE, subject: AclSubject.ADD_CAPITAL }])
  async create(
    @Body() createDto: CreateCapitalTopupDto,
    @Req() req: Request,
  ): Promise<CapitalTopupDto> {
    const user = (req as any).user;
    const requestedBy = user?.uuid ?? '';
    return this.capitalTopupService.create(createDto, requestedBy);
  }

  @Put(':id')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.ADD_CAPITAL }])
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCapitalTopupDto,
  ): Promise<CapitalTopupDto> {
    return this.capitalTopupService.update(id, updateDto);
  }

  @Put(':id/approve')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.ADD_CAPITAL }])
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<CapitalTopupDto> {
    const user = (req as any).user;
    const approvedBy = user?.uuid ?? '';
    return this.capitalTopupService.approve(id, approvedBy);
  }

  @Put(':id/reject')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.ADD_CAPITAL }])
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectCapitalTopupDto,
    @Req() req: Request,
  ): Promise<CapitalTopupDto> {
    const user = (req as any).user;
    const rejectedBy = user?.uuid ?? '';
    return this.capitalTopupService.reject(id, dto, rejectedBy);
  }

  @Put(':id/disburse')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.ADD_CAPITAL }])
  async disburse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DisburseCapitalTopupDto,
  ): Promise<CapitalTopupDto> {
    return this.capitalTopupService.disburse(id, dto);
  }

  @Get(':id')
  @Auth([{ action: AclAction.READ, subject: AclSubject.ADD_CAPITAL }])
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CapitalTopupDto> {
    return this.capitalTopupService.findOne(id);
  }
}
