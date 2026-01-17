import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyEntity } from './entities/company.entity';
import { CompanyDto } from './dto/company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateCompanyConfigDto } from './dto/update-company-config.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
  ) {}

  async findOne(uuid: string): Promise<CompanyDto> {
    const company = await this.companyRepository.findOne({
      where: { uuid },
      relations: ['owner', 'branches'],
    });

    if (!company) {
      throw new NotFoundException(`Company with UUID ${uuid} not found`);
    }

    return new CompanyDto(company);
  }

  async update(uuid: string, updateDto: UpdateCompanyDto): Promise<CompanyDto> {
    const company = await this.companyRepository.findOne({
      where: { uuid },
    });

    if (!company) {
      throw new NotFoundException(`Company with UUID ${uuid} not found`);
    }

    Object.assign(company, updateDto);
    const updated = await this.companyRepository.save(company);

    return new CompanyDto(updated);
  }

  async updateConfig(
    uuid: string,
    configDto: UpdateCompanyConfigDto,
  ): Promise<CompanyDto> {
    const company = await this.companyRepository.findOne({
      where: { uuid },
    });

    if (!company) {
      throw new NotFoundException(`Company with UUID ${uuid} not found`);
    }

    Object.assign(company, configDto);
    const updated = await this.companyRepository.save(company);

    return new CompanyDto(updated);
  }

  async getStatistics(uuid: string): Promise<{
    totalBranches: number;
    totalUsers: number;
    activeBranches: number;
  }> {
    const company = await this.companyRepository.findOne({
      where: { uuid },
      relations: ['branches', 'users'],
    });

    if (!company) {
      throw new NotFoundException(`Company with UUID ${uuid} not found`);
    }

    return {
      totalBranches: company.branches?.length || 0,
      totalUsers: company.users?.length || 0,
      activeBranches:
        company.branches?.filter((b) => b.status === 'active').length || 0,
    };
  }
}
