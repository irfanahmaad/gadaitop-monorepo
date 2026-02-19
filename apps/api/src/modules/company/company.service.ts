import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { generateHash } from '../../common/utils';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import { PageOptionsDto } from '../../common/dtos/page-options.dto';
import {
  DynamicQueryBuilder,
  QueryBuilderOptionsType,
  sortAttribute,
} from '../../common/helpers/query-builder';
import { ActiveStatusEnum } from '../../constants/active-status';
import { UserEntity } from '../user/entities/user.entity';
import { RoleEntity } from '../role/entities/role.entity';
import { CompanyEntity } from './entities/company.entity';
import { CompanyDto } from './dto/company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateCompanyConfigDto } from './dto/update-company-config.dto';
import { CreateCompanyWithAdminDto } from './dto/create-company-with-admin.dto';

const OWNER_ROLE_CODE = 'owner';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    private dataSource: DataSource,
  ) {}

  async findAll(options: PageOptionsDto): Promise<{
    data: CompanyDto[];
    meta: PageMetaDto;
  }> {
    const qbOptions: QueryBuilderOptionsType<CompanyEntity> = {
      ...options,
      select: {
        companyName: true,
        companyCode: true,
        phoneNumber: true,
        address: true,
        activeStatus: true,
        owner: {
          id: true,
          fullName: true,
          email: true,
        },
      } as any,
      relation: {
        owner: true,
      },
      orderBy: sortAttribute(options.sortBy, {
        companyName: { companyName: true },
        companyCode: { companyCode: true },
      }) ?? { id: 'ASC' } as any,
    };

    const dynamicQueryBuilder = new DynamicQueryBuilder(this.companyRepository.metadata);
    const [res, count] = await dynamicQueryBuilder.buildDynamicQuery(
      CompanyEntity.createQueryBuilder('company'),
      qbOptions,
    );

    const data = res.map((company) => new CompanyDto(company));
    const meta = new PageMetaDto({ pageOptionsDto: options, itemCount: count });

    return { data, meta };
  }

  async create(createDto: CreateCompanyWithAdminDto): Promise<CompanyDto> {
    // Check if company code already exists
    const existingCompany = await this.companyRepository.findOne({
      where: { companyCode: createDto.companyCode },
    });
    if (existingCompany) {
      throw new BadRequestException(
        `Company with code ${createDto.companyCode} already exists`,
      );
    }

    // Check if admin email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createDto.adminEmail },
    });
    if (existingUser) {
      throw new BadRequestException(
        `User with email ${createDto.adminEmail} already exists`,
      );
    }

    // Find the owner role
    const ownerRole = await this.roleRepository.findOne({
      where: { code: OWNER_ROLE_CODE },
    });
    if (!ownerRole) {
      throw new BadRequestException('Owner role not found in the system');
    }

    // Use transaction to create both user and company
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create the admin user (owner)
      const hashedPassword = await generateHash(createDto.password);
      const user = queryRunner.manager.create(UserEntity, {
        fullName: createDto.adminName,
        email: createDto.adminEmail,
        password: hashedPassword,
        phoneNumber: createDto.adminPhone || null,
        activeStatus: ActiveStatusEnum.Active,
        roles: [ownerRole],
      });
      const savedUser = await queryRunner.manager.save(user);

      // 2. Create the company linked to the user
      const company = queryRunner.manager.create(CompanyEntity, {
        companyCode: createDto.companyCode,
        companyName: createDto.companyName,
        phoneNumber: createDto.phoneNumber || null,
        address: createDto.address || null,
        ownerId: savedUser.uuid,
        activeStatus: ActiveStatusEnum.Active,
      });
      const savedCompany = await queryRunner.manager.save(company);

      // 3. Link user to the company they own
      savedUser.ownedCompanyId = savedCompany.uuid;
      savedUser.companyId = savedCompany.uuid;
      await queryRunner.manager.save(savedUser);

      await queryRunner.commitTransaction();

      // Fetch the complete company with relations
      return this.findOne(savedCompany.uuid);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

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

  async delete(uuid: string): Promise<void> {
    const company = await this.companyRepository.findOne({
      where: { uuid },
      relations: ['owner', 'branches', 'users'],
    });

    if (!company) {
      throw new NotFoundException(`Company with UUID ${uuid} not found`);
    }

    // Check if company has branches
    if (company.branches && company.branches.length > 0) {
      throw new BadRequestException(
        'Cannot delete company with existing branches. Please delete all branches first.',
      );
    }

    // Use transaction to delete company and optionally the owner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Remove company
      await queryRunner.manager.remove(company);

      // Optionally remove the owner if they only own this company
      if (company.owner) {
        await queryRunner.manager.remove(company.owner);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
