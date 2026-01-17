import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';
import { AuditActionEnum } from '../../../constants/audit-action';

export class QueryAuditLogDto extends PageOptionsDto {
  @IsOptional()
  @IsString()
  entityName?: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsEnum(AuditActionEnum)
  @Type(() => String)
  action?: AuditActionEnum;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  search?: string; // For user name search
}
