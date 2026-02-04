import { IsEnum, IsOptional, IsString } from 'class-validator';

import { AuctionPickupStatusEnum } from '../../../constants/auction-pickup-status';

export class UpdatePickupDto {
  @IsEnum(AuctionPickupStatusEnum)
  pickupStatus: AuctionPickupStatusEnum;

  /** Required when pickupStatus is 'failed'. */
  @IsOptional()
  @IsString()
  failureReason?: string;
}
