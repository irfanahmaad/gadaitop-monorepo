import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Patch,
  Body,
  Query,
} from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common/pipes';

import { PageOptionsDto } from '../../common/dtos/page-options.dto';
import { Auth } from '../../decorators';
import { AclAction, AclSubject } from '../../constants/acl';
import { CompanyService } from './company.service';
import { CompanyDto } from './dto/company.dto';
import { CreateCompanyWithAdminDto } from './dto/create-company-with-admin.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateCompanyConfigDto } from './dto/update-company-config.dto';

@Controller({ path: 'companies', version: '1' })
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @Auth([{ action: AclAction.READ, subject: AclSubject.PT }])
  async findAll(@Query() options: PageOptionsDto) {
    return this.companyService.findAll(options);
  }

  @Post()
  @Auth([{ action: AclAction.CREATE, subject: AclSubject.PT }])
  async create(@Body() createDto: CreateCompanyWithAdminDto): Promise<CompanyDto> {
    return this.companyService.create(createDto);
  }

  @Get(':id')
  @Auth([{ action: AclAction.READ, subject: AclSubject.PT }])
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CompanyDto> {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.PT }])
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCompanyDto,
  ): Promise<CompanyDto> {
    return this.companyService.update(id, updateDto);
  }

  @Patch(':id/config')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.PT }])
  async updateConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() configDto: UpdateCompanyConfigDto,
  ): Promise<CompanyDto> {
    return this.companyService.updateConfig(id, configDto);
  }

  @Get(':id/statistics')
  @Auth([{ action: AclAction.READ, subject: AclSubject.PT }])
  async getStatistics(@Param('id', ParseUUIDPipe) id: string) {
    return this.companyService.getStatistics(id);
  }

  @Delete(':id')
  @Auth([{ action: AclAction.DELETE, subject: AclSubject.PT }])
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.companyService.delete(id);
  }
}
