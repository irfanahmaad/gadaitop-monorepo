import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { UpdateAuctionBatchDto } from './dto/update-auction-batch.dto';
import { UpdateBatchMarketingDto } from './dto/update-batch-marketing.dto';
import { UpdateBatchItemMarketingDto } from './dto/update-batch-item-marketing.dto';
import { UpdateAuctionItemStatusDto } from './dto/update-auction-item-status.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

function getReqUser(req: Request): { uuid?: string; companyId?: string; ownedCompanyId?: string } {
  return (req as any).user ?? {};
}

@Controller({ path: 'auction-batches', version: '1' })
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Get()
  @Auth([{ action: AclAction.READ, subject: AclSubject.AUCTION_BATCH }])
  async findAll(
    @Query() queryDto: QueryAuctionBatchDto,
    @Req() req: Request,
  ): Promise<{ data: AuctionBatchDto[]; meta: PageMetaDto }> {
    const user = getReqUser(req);
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.auctionService.findAll(queryDto, userPtId);
  }

  @Get(':id')
  @Auth([{ action: AclAction.READ, subject: AclSubject.AUCTION_BATCH }])
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<AuctionBatchDto> {
    const user = getReqUser(req);
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.auctionService.findOne(id, userPtId);
  }

  @Post()
  @Auth([{ action: AclAction.CREATE, subject: AclSubject.AUCTION_BATCH }])
  async create(
    @Body() createDto: CreateAuctionBatchDto,
    @Req() req: Request,
  ): Promise<AuctionBatchDto> {
    const user = getReqUser(req);
    const createdBy = user?.uuid ?? '';
    return this.auctionService.create(createDto, createdBy);
  }

  @Put(':id')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.AUCTION_BATCH }])
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAuctionBatchDto,
    @Req() req: Request,
  ): Promise<AuctionBatchDto> {
    const user = getReqUser(req);
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    const updatedBy = user?.uuid ?? '';
    return this.auctionService.update(id, updateDto, updatedBy, userPtId);
  }

  @Patch(':id/marketing')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.MARKETING_NOTE }])
  async updateBatchMarketing(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBatchMarketingDto,
    @Req() req: Request,
  ): Promise<AuctionBatchDto> {
    const user = getReqUser(req);
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.auctionService.updateBatchMarketing(id, dto, userPtId);
  }

  @Patch(':id/items/:itemId/marketing')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.MARKETING_NOTE }])
  async updateBatchItemMarketing(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateBatchItemMarketingDto,
    @Req() req: Request,
  ): Promise<AuctionBatchDto> {
    const user = getReqUser(req);
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.auctionService.updateBatchItemMarketing(id, itemId, dto, userPtId);
  }

  @Put(':id/assign')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.AUCTION_PICKUP }])
  async assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<AuctionBatchDto> {
    const user = getReqUser(req);
    const userId = user?.uuid ?? '';
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.auctionService.assign(id, userId, userPtId);
  }

  @Put(':id/items/:itemId/pickup')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.AUCTION_PICKUP }])
  async updateItemPickup(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdatePickupDto,
    @Req() req: Request,
  ): Promise<AuctionBatchDto> {
    const user = getReqUser(req);
    const userId = user?.uuid ?? '';
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.auctionService.updateItemPickup(id, itemId, dto, userId, userPtId);
  }

  @Put(':id/items/:itemId/auction-status')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.AUCTION_BATCH }])
  async updateItemAuctionStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateAuctionItemStatusDto,
    @Req() req: Request,
  ): Promise<AuctionBatchDto> {
    const user = getReqUser(req);
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.auctionService.updateItemAuctionStatus(id, itemId, dto, userPtId);
  }

  @Put(':id/items/:itemId/validation')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.AUCTION_VALIDATION }])
  async submitItemValidation(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: SubmitValidationDto,
    @Req() req: Request,
  ): Promise<AuctionBatchDto> {
    const user = getReqUser(req);
    const userId = user?.uuid ?? '';
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.auctionService.submitItemValidation(id, itemId, dto, userId, userPtId);
  }

  @Put(':id/finalize')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.AUCTION_VALIDATION }])
  async finalize(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<AuctionBatchDto> {
    const user = getReqUser(req);
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    const updatedBy = user?.uuid;
    return this.auctionService.finalizeBatch(id, userPtId, updatedBy);
  }

  @Put(':id/cancel')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.AUCTION_BATCH }])
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<AuctionBatchDto> {
    const user = getReqUser(req);
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    const updatedBy = user?.uuid;
    return this.auctionService.cancel(id, userPtId, updatedBy);
  }

  @Delete(':id/items/:itemId')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.AUCTION_BATCH }])
  async removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Req() req: Request,
  ): Promise<AuctionBatchDto> {
    const user = getReqUser(req);
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.auctionService.removeItemFromBatch(id, itemId, userPtId);
  }

  @Delete(':id')
  @Auth([{ action: AclAction.DELETE, subject: AclSubject.AUCTION_BATCH }])
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<void> {
    const user = getReqUser(req);
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.auctionService.remove(id, userPtId);
  }
}
