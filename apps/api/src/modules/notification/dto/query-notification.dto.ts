import { IsOptional, IsString } from 'class-validator';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';

export class QueryNotificationDto extends PageOptionsDto {
  /** Filter by read status: 'read' | 'unread' */
  @IsOptional()
  @IsString()
  read?: 'read' | 'unread';

  /** Search by title or body */
  @IsOptional()
  @IsString()
  search?: string;
}
