import { IsNotEmpty, IsString } from 'class-validator';

export class ScanKtpDto {
  @IsNotEmpty()
  @IsString()
  imageBase64: string;
}
