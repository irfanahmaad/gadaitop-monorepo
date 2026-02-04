import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Request } from 'express';

import { Auth } from '../../decorators';
import { AclAction, AclSubject } from '../../constants/acl';
import { AuctionService } from './auction.service';
import { AuctionBatchDto } from './dto/auction-batch.dto';
import { CreateAuctionBatchDto } from './dto/create-auction-batch.dto';
import { QueryAuctionBatchDto } from './dto/query-auction-batch.dto';
import { UpdatePickupDto } from './dto/update-pickup.dto';
import { SubmitValidationDto } from './dto/submit-validation.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Controller({ path: 'auction-batches', version: '1' })
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Get()
  @Auth([{ action: AclAction.READ, subject: AclSubject.AUCTION_BATCH }])
  async findAll(
    @Query() queryDto: QueryAuctionBatchDto,
    @Req() req: Request,
  ): Promise<{ data: AuctionBatchDto[]; meta: PageMetaDto }> {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.auctionService.findAll(queryDto, userPtId);
  }

  @Get(':id')
  @Auth([{ action: AclAction.READ, subject: AclSubject.AUCTION_BATCH }])
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AuctionBatchDto> {
    return this.auctionService.findOne(id);
  }

  @Post()
  @Auth([{ action: AclAction.CREATE, subject: AclSubject.AUCTION_BATCH }])
  async create(
    @Body() createDto: CreateAuctionBatchDto,
    @Req() req: Request,
  ): Promise<AuctionBatchDto> {
    const user = (req as any).user;
    const createdBy = user?.uuid ?? '';
    return this.auctionService.create(createDto, createdBy);
  }

  @Put(':id/assign')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.AUCTION_BATCH }])
  async assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<AuctionBatchDto> {
    const user = (req as any).user;
    const userId = user?.uuid ?? '';
    return this.auctionService.assign(id, userId);
  }

  @Put(':id/items/:itemId/pickup')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.AUCTION_PICKUP }])
  async updateItemPickup(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdatePickupDto,
    @Req() req: Request,
  ): Promise<AuctionBatchDto> {
    const user = (req as any).user;
    const userId = user?.uuid ?? '';
    return this.auctionService.updateItemPickup(id, itemId, dto, userId);
  }

  @Put(':id/items/:itemId/validation')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.AUCTION_VALIDATION }])
  async submitItemValidation(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: SubmitValidationDto,
    @Req() req: Request,
  ): Promise<AuctionBatchDto> {
    const user = (req as any).user;
    const userId = user?.uuid ?? '';
    return this.auctionService.submitItemValidation(id, itemId, dto, userId);
  }

  @Put(':id/finalize')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.AUCTION_VALIDATION }])
  async finalize(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AuctionBatchDto> {
    return this.auctionService.finalizeBatch(id);
  }

  @Put(':id/cancel')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.AUCTION_BATCH }])
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AuctionBatchDto> {
    return this.auctionService.cancel(id);
  }
}
