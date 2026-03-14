import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

import { AuctionPickupStatusEnum } from '../../../constants/auction-pickup-status';

export class UpdatePickupDto {
  @IsEnum(AuctionPickupStatusEnum)
  pickupStatus: AuctionPickupStatusEnum;

  /** Required when pickupStatus is 'failed'. */
  @ValidateIf((o) => o.pickupStatus === AuctionPickupStatusEnum.Failed)
  @IsNotEmpty({ message: 'failureReason is required when pickup status is failed' })
  @IsString()
  failureReason?: string;
}
