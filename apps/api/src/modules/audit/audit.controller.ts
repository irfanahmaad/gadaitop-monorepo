import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';

import { Auth } from '../../decorators';
import { AuditService } from './audit.service';
import { AuditLogDto } from './dto/audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Controller({ path: 'audit-logs', version: '1' })
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Auth([])
  async findAll(@Query() queryDto: QueryAuditLogDto): Promise<{
    data: AuditLogDto[];
    meta: PageMetaDto;
  }> {
    return this.auditService.findAll(queryDto);
  }

  @Get(':id')
  @Auth([])
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AuditLogDto> {
    return this.auditService.findOne(id);
  }

  @Get('export')
  @Auth([])
  async export(@Query() queryDto: QueryAuditLogDto): Promise<AuditLogDto[]> {
    return this.auditService.export(queryDto);
  }
}
