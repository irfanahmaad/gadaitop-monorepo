import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  Req,
  Headers,
} from '@nestjs/common';
import { Request } from 'express';

import { Auth } from '../../decorators';
import { AclAction, AclSubject } from '../../constants/acl';
import { CashDepositService } from './cash-deposit.service';
import { CashDepositDto } from './dto/cash-deposit.dto';
import { CreateCashDepositDto } from './dto/create-cash-deposit.dto';
import { QueryCashDepositDto } from './dto/query-cash-deposit.dto';
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

  /** Xendit webhook — public endpoint, no auth guard */
  @Post('webhook')
  @Auth([], { public: true })
  async webhook(
    @Body() payload: Record<string, unknown>,
    @Headers('x-callback-token') callbackToken: string,
  ): Promise<{ received: boolean }> {
    return this.cashDepositService.webhook(payload, callbackToken ?? '');
  }

  @Get(':id')
  @Auth([{ action: AclAction.READ, subject: AclSubject.DEPOSIT_MONEY }])
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CashDepositDto> {
    return this.cashDepositService.findOne(id);
  }
}
