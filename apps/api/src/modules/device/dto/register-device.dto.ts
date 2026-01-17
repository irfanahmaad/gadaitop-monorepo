import { IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';

export class RegisterDeviceDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, {
    message: 'MAC address must be in format XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX',
  })
  macAddress: string;

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
