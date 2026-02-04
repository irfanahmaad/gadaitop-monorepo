import { IsString, Length } from 'class-validator';

/**
 * Customer PIN for SPK confirmation.
 */
export class ConfirmSpkDto {
  @IsString()
  @Length(6, 6, { message: 'PIN must be 6 digits' })
  pin: string;
}
