import {
  Controller,
  Delete,
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
import { StockOpnameService } from './stock-opname.service';
import { StockOpnameSessionDto } from './dto/stock-opname-session.dto';
import { CreateStockOpnameSessionDto } from './dto/create-stock-opname-session.dto';
import { QueryStockOpnameDto } from './dto/query-stock-opname.dto';
import { UpdateStockOpnameItemsDto } from './dto/update-stock-opname-items.dto';
import { RecordConditionDto } from './dto/record-condition.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import { UpdateStockOpnameSessionDto } from './dto/update-stock-opname-session.dto';

@Controller({ path: 'stock-opname', version: '1' })
export class StockOpnameController {
  constructor(private readonly stockOpnameService: StockOpnameService) {}

  @Get()
  @Auth([{ action: AclAction.READ, subject: AclSubject.STOCK_OPNAME_SCHEDULE }])
  async findAll(
    @Query() queryDto: QueryStockOpnameDto,
    @Req() req: Request,
  ): Promise<{ data: StockOpnameSessionDto[]; meta: PageMetaDto }> {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.stockOpnameService.findAll(queryDto, userPtId);
  }

  @Post()
  @Auth([{ action: AclAction.CREATE, subject: AclSubject.STOCK_OPNAME_SCHEDULE }])
  async create(
    @Body() createDto: CreateStockOpnameSessionDto,
    @Req() req: Request,
  ): Promise<StockOpnameSessionDto> {
    const user = (req as any).user;
    const createdBy = user?.uuid ?? '';
    return this.stockOpnameService.create(createDto, createdBy);
  }

  @Put(':id')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.STOCK_OPNAME_SCHEDULE }])
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateStockOpnameSessionDto,
    @Req() req: Request,
  ): Promise<StockOpnameSessionDto> {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.stockOpnameService.update(id, updateDto, userPtId);
  }

  @Put(':id/items')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.STOCK_OPNAME_EXECUTION }])
  async updateItems(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockOpnameItemsDto,
    @Req() req: Request,
  ): Promise<StockOpnameSessionDto> {
    const user = (req as any).user;
    const countedBy = user?.uuid ?? '';
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.stockOpnameService.updateItems(id, dto, countedBy, userPtId);
  }

  @Post(':id/items/:itemId/condition')
  @Auth([{ action: AclAction.CREATE, subject: AclSubject.STOCK_OPNAME_EXECUTION }])
  async recordCondition(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: RecordConditionDto,
    @Req() req: Request,
  ): Promise<void> {
    const user = (req as any).user;
    const countedBy = user?.uuid ?? '';
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.stockOpnameService.recordCondition(
      id,
      itemId,
      dto,
      countedBy,
      userPtId,
    );
  }

  @Put(':id/complete')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.STOCK_OPNAME_EXECUTION }])
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<StockOpnameSessionDto> {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.stockOpnameService.complete(id, userPtId);
  }

  @Put(':id/approve')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.STOCK_OPNAME_SCHEDULE }])
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<StockOpnameSessionDto> {
    const user = (req as any).user;
    const approvedBy = user?.uuid ?? '';
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.stockOpnameService.approve(id, approvedBy, userPtId);
  }

  @Put(':id/reopen')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.STOCK_OPNAME_SCHEDULE }])
  async reopen(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<StockOpnameSessionDto> {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.stockOpnameService.reopen(id, userPtId);
  }

  @Get(':id')
  @Auth([{ action: AclAction.READ, subject: AclSubject.STOCK_OPNAME_SCHEDULE }])
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<StockOpnameSessionDto> {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.stockOpnameService.findOne(id, userPtId);
  }

  @Delete(':id')
  @Auth([{ action: AclAction.DELETE, subject: AclSubject.STOCK_OPNAME_SCHEDULE }])
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<void> {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.stockOpnameService.remove(id, userPtId);
  }
}
