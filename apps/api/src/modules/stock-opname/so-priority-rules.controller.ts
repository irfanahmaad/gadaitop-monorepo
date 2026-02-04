import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { Auth } from '../../decorators';
import { SoPriorityRuleService } from './so-priority-rule.service';
import { SoPriorityRuleDto } from './dto/so-priority-rule.dto';
import { CreateSoPriorityRuleDto } from './dto/create-so-priority-rule.dto';
import { UpdateSoPriorityRuleDto } from './dto/update-so-priority-rule.dto';
import { QuerySoPriorityRuleDto } from './dto/query-so-priority-rule.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Controller({ path: 'so-priority-rules', version: '1' })
export class SoPriorityRulesController {
  constructor(private readonly soPriorityRuleService: SoPriorityRuleService) {}

  @Get()
  @Auth([])
  async findAll(
    @Query() queryDto: QuerySoPriorityRuleDto,
    @Req() req: Request,
  ): Promise<{ data: SoPriorityRuleDto[]; meta: PageMetaDto }> {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.soPriorityRuleService.findAll(queryDto, userPtId);
  }

  @Get(':id')
  @Auth([])
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SoPriorityRuleDto> {
    return this.soPriorityRuleService.findOne(id);
  }

  @Post()
  @Auth([])
  async create(
    @Body() createDto: CreateSoPriorityRuleDto,
    @Req() req: Request,
  ): Promise<SoPriorityRuleDto> {
    const user = (req as any).user;
    const createdBy = user?.uuid ?? null;
    return this.soPriorityRuleService.create(createDto, createdBy);
  }

  @Put(':id')
  @Auth([])
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateSoPriorityRuleDto,
  ): Promise<SoPriorityRuleDto> {
    return this.soPriorityRuleService.update(id, updateDto);
  }

  @Delete(':id')
  @Auth([])
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.soPriorityRuleService.remove(id);
  }
}
