import { IsOptional, IsUUID } from 'class-validator';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';

export class QuerySoPriorityRuleDto extends PageOptionsDto {
  @IsOptional()
  @IsUUID()
  ptId?: string;
}
