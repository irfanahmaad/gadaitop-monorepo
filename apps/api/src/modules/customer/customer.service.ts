import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, Repository } from 'typeorm';

import { generateHash } from '../../common/utils';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import {
  DynamicQueryBuilder,
  QueryBuilderOptionsType,
  sortAttribute,
} from '../../common/helpers/query-builder';
import { CustomerEntity } from './entities/customer.entity';
import { CustomerPinHistoryEntity } from './entities/customer-pin-history.entity';
import { CustomerDto } from './dto/customer.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { ChangePinDto } from './dto/change-pin.dto';
import { BlacklistCustomerDto } from './dto/blacklist-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
    @InjectRepository(CustomerPinHistoryEntity)
    private pinHistoryRepository: Repository<CustomerPinHistoryEntity>,
  ) {}

  async findAll(
    queryDto: QueryCustomerDto,
    userPtId?: string,
  ): Promise<{ data: CustomerDto[]; meta: PageMetaDto }> {
    const where: FindOptionsWhere<CustomerEntity> = {};

    if (userPtId) {
      where.ptId = userPtId;
    }
    if (queryDto.ptId) {
      where.ptId = queryDto.ptId;
    }

    const qbOptions: QueryBuilderOptionsType<CustomerEntity> = {
      ...queryDto,
      select: {
        name: true,
        nik: true,
        phone: true,
        email: true,
        city: true,
        isBlacklisted: true,
      },
      where,
      orderBy: sortAttribute(queryDto.sortBy, {
        name: { name: true },
        nik: { nik: true },
        email: { email: true },
      }) ?? { createdAt: 'DESC' } as any,
    };

    const dynamicQueryBuilder = new DynamicQueryBuilder(this.customerRepository.metadata);
    const [customers, count] = await dynamicQueryBuilder.buildDynamicQuery(
      CustomerEntity.createQueryBuilder('customer'),
      qbOptions,
    );

    const data = customers.map((c) => new CustomerDto(c));
    const meta = new PageMetaDto({
      pageOptionsDto: queryDto,
      itemCount: count,
    });

    return { data, meta };
  }

  async findOne(uuid: string): Promise<CustomerDto> {
    const customer = await this.customerRepository.findOne({
      where: { uuid },
      relations: ['pt', 'creator'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with UUID ${uuid} not found`);
    }

    return new CustomerDto(customer);
  }

  async create(createDto: CreateCustomerDto, createdBy: string): Promise<CustomerDto> {
    const existingNik = await this.customerRepository.findOne({
      where: { nik: createDto.nik },
    });

    if (existingNik) {
      throw new BadRequestException(`Customer with NIK ${createDto.nik} already exists`);
    }

    const existingEmail = await this.customerRepository.findOne({
      where: { email: createDto.email },
    });

    if (existingEmail) {
      throw new BadRequestException(`Customer with email ${createDto.email} already exists`);
    }

    const pinHash = await generateHash(createDto.pin);

    const customer = this.customerRepository.create({
      nik: createDto.nik,
      pinHash,
      passwordHash: null,
      name: createDto.name,
      dob: new Date(createDto.dob),
      gender: createDto.gender,
      address: createDto.address,
      city: createDto.city,
      phone: createDto.phone,
      email: createDto.email,
      ktpPhotoUrl: createDto.ktpPhotoUrl ?? null,
      selfiePhotoUrl: createDto.selfiePhotoUrl ?? null,
      ptId: createDto.ptId,
      createdBy,
      isBlacklisted: false,
    });

    const saved = await this.customerRepository.save(customer);

    await this.pinHistoryRepository.save(
      this.pinHistoryRepository.create({
        customerId: saved.uuid,
        oldPinHash: null,
        newPinHash: pinHash,
        changedBy: createdBy,
        changeReason: 'initial_setup',
      }),
    );

    return new CustomerDto(saved);
  }

  async update(uuid: string, updateDto: UpdateCustomerDto): Promise<CustomerDto> {
    const customer = await this.customerRepository.findOne({
      where: { uuid },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with UUID ${uuid} not found`);
    }

    Object.assign(customer, updateDto);
    const updated = await this.customerRepository.save(customer);

    return new CustomerDto(updated);
  }

  async changePin(
    uuid: string,
    changePinDto: ChangePinDto,
    changedBy: string | null,
    changeReason: string = 'admin_reset',
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { uuid },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with UUID ${uuid} not found`);
    }

    if (changePinDto.oldPin) {
      const { validateHash } = await import('../../common/utils');
      const isValid = await validateHash(changePinDto.oldPin, customer.pinHash);
      if (!isValid) {
        throw new BadRequestException('Old PIN is incorrect');
      }
    }

    const newPinHash = await generateHash(changePinDto.newPin);
    const oldPinHash = customer.pinHash;

    customer.pinHash = newPinHash;
    await this.customerRepository.save(customer);

    await this.pinHistoryRepository.save(
      this.pinHistoryRepository.create({
        customerId: customer.uuid,
        oldPinHash,
        newPinHash,
        changedBy,
        changeReason,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
      }),
    );
  }

  async blacklist(uuid: string, dto: BlacklistCustomerDto, blacklistedBy: string): Promise<CustomerDto> {
    const customer = await this.customerRepository.findOne({
      where: { uuid },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with UUID ${uuid} not found`);
    }

    if (customer.isBlacklisted) {
      throw new BadRequestException('Customer is already blacklisted');
    }

    customer.isBlacklisted = true;
    customer.blacklistedAt = new Date();
    customer.blacklistedBy = blacklistedBy;
    customer.blacklistReason = dto.reason ?? null;
    customer.unblacklistedAt = null;
    customer.unblacklistedBy = null;

    const updated = await this.customerRepository.save(customer);
    return new CustomerDto(updated);
  }

  async unblacklist(uuid: string, unblacklistedBy: string): Promise<CustomerDto> {
    const customer = await this.customerRepository.findOne({
      where: { uuid },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with UUID ${uuid} not found`);
    }

    if (!customer.isBlacklisted) {
      throw new BadRequestException('Customer is not blacklisted');
    }

    customer.isBlacklisted = false;
    customer.unblacklistedAt = new Date();
    customer.unblacklistedBy = unblacklistedBy;

    const updated = await this.customerRepository.save(customer);
    return new CustomerDto(updated);
  }

  async remove(uuid: string): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { uuid },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with UUID ${uuid} not found`);
    }

    await this.customerRepository.softDelete({ uuid });
  }

  async scanKtp(_dto: { imageBase64: string }): Promise<{
    nik: string;
    name: string;
    dob: string;
    address: string;
    extractedData: Record<string, unknown>;
  }> {
    // Placeholder for OCR KTP integration - return mock structure
    return {
      nik: '',
      name: '',
      dob: '',
      address: '',
      extractedData: {},
    };
  }

  async findByNik(nik: string): Promise<CustomerEntity | null> {
    return this.customerRepository.findOne({
      where: { nik },
    });
  }

  async findByUuid(uuid: string): Promise<CustomerEntity | null> {
    return this.customerRepository.findOne({
      where: { uuid },
    });
  }
}
