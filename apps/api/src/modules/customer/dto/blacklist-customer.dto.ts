import { IsOptional, IsString } from 'class-validator';

export class BlacklistCustomerDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
