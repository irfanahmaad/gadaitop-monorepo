import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common/pipes';

import { Auth } from '../../decorators';
import { CompanyService } from './company.service';
import { CompanyDto } from './dto/company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateCompanyConfigDto } from './dto/update-company-config.dto';

@Controller({ path: 'companies', version: '1' })
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get(':id')
  @Auth([])
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CompanyDto> {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  @Auth([])
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCompanyDto,
  ): Promise<CompanyDto> {
    return this.companyService.update(id, updateDto);
  }

  @Patch(':id/config')
  @Auth([])
  async updateConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() configDto: UpdateCompanyConfigDto,
  ): Promise<CompanyDto> {
    return this.companyService.updateConfig(id, configDto);
  }

  @Get(':id/statistics')
  @Auth([])
  async getStatistics(@Param('id', ParseUUIDPipe) id: string) {
    return this.companyService.getStatistics(id);
  }
}
