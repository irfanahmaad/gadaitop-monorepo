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
import { CashDepositService } from './cash-deposit.service';
import { CashDepositDto } from './dto/cash-deposit.dto';
import { CreateCashDepositDto } from './dto/create-cash-deposit.dto';
import { QueryCashDepositDto } from './dto/query-cash-deposit.dto';
import { RejectCashDepositDto } from './dto/reject-cash-deposit.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Controller({ path: 'cash-deposits', version: '1' })
export class CashDepositController {
  constructor(private readonly cashDepositService: CashDepositService) {}

  @Get()
  @Auth([{ action: AclAction.READ, subject: AclSubject.DEPOSIT_MONEY }])
  async findAll(
    @Query() queryDto: QueryCashDepositDto,
    @Req() req: Request,
  ): Promise<{ data: CashDepositDto[]; meta: PageMetaDto }> {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.cashDepositService.findAll(queryDto, userPtId);
  }

  @Post('webhook')
  @Auth([], { public: true })
  async webhook(@Body() payload: Record<string, unknown>): Promise<{ received: boolean }> {
    return this.cashDepositService.webhook(payload);
  }

  @Post()
  @Auth([{ action: AclAction.CREATE, subject: AclSubject.DEPOSIT_MONEY }])
  async create(
    @Body() createDto: CreateCashDepositDto,
    @Req() req: Request,
  ): Promise<CashDepositDto> {
    const user = (req as any).user;
    const requestedBy = user?.uuid ?? '';
    return this.cashDepositService.create(createDto, requestedBy);
  }

  @Put(':id/approve')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.DEPOSIT_MONEY }])
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<CashDepositDto> {
    const user = (req as any).user;
    const approvedBy = user?.uuid ?? '';
    return this.cashDepositService.approve(id, approvedBy);
  }

  @Put(':id/reject')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.DEPOSIT_MONEY }])
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectCashDepositDto,
    @Req() req: Request,
  ): Promise<CashDepositDto> {
    const user = (req as any).user;
    const rejectedBy = user?.uuid ?? '';
    return this.cashDepositService.reject(id, dto, rejectedBy);
  }

  @Get(':id')
  @Auth([{ action: AclAction.READ, subject: AclSubject.DEPOSIT_MONEY }])
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CashDepositDto> {
    return this.cashDepositService.findOne(id);
  }
}
