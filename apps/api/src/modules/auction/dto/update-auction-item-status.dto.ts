import { IsEnum } from 'class-validator';

import { AuctionItemStatusEnum } from '../../../constants/auction-item-status';

export class UpdateAuctionItemStatusDto {
  @IsEnum(AuctionItemStatusEnum)
  auctionItemStatus: AuctionItemStatusEnum;
}
