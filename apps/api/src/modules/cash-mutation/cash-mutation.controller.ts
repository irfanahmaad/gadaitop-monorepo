import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { Auth } from '../../decorators';
import { AclAction, AclSubject } from '../../constants/acl';
import { CashMutationService } from './cash-mutation.service';
import { CashMutationDto } from './dto/cash-mutation.dto';
import { CreateCashMutationDto } from './dto/create-cash-mutation.dto';
import { QueryCashMutationDto } from './dto/query-cash-mutation.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Controller({ path: 'cash-mutations', version: '1' })
export class CashMutationController {
  constructor(private readonly cashMutationService: CashMutationService) {}

  @Get('balance')
  @Auth([{ action: AclAction.READ, subject: AclSubject.MUTATION }])
  async getBalance(
    @Query('storeId') storeId: string,
  ): Promise<{ balance: number }> {
    if (!storeId) {
      throw new BadRequestException('storeId is required');
    }
    return this.cashMutationService.getBalance(storeId);
  }

  @Get()
  @Auth([{ action: AclAction.READ, subject: AclSubject.MUTATION }])
  async findAll(
    @Query() queryDto: QueryCashMutationDto,
    @Req() req: Request,
  ): Promise<{ data: CashMutationDto[]; meta: PageMetaDto }> {
    const user = (req as any).user;
    const storeId = user?.branchId ?? queryDto.storeId ?? undefined;
    return this.cashMutationService.findAll(queryDto, storeId);
  }

  @Post()
  @Auth([{ action: AclAction.CREATE, subject: AclSubject.MUTATION }])
  async create(
    @Body() createDto: CreateCashMutationDto,
    @Req() req: Request,
  ): Promise<CashMutationDto> {
    const user = (req as any).user;
    const createdBy = user?.uuid ?? '';
    return this.cashMutationService.create(createDto, createdBy);
  }
}
