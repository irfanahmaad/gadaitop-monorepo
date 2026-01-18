import { IsIP, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class RegisterDeviceDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsIP(undefined, {
    message: 'IP address must be a valid IPv4 or IPv6 address',
  })
  ipAddress: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  deviceName: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  deviceType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  osInfo?: string;
}
