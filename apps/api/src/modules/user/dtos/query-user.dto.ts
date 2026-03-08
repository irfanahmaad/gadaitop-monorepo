import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PageOptionsDto } from '../../../common/dtos/page-options.dto';

export class QueryUserDto extends PageOptionsDto {
  @IsOptional()
  @IsString()
  roleCode?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  /** When set, exclude users who have this role (e.g. "company_admin" to hide Admin PT). */
  @IsOptional()
  @IsString()
  excludeRoleCode?: string;
}
