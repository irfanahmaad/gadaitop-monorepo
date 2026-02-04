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
import { AclAction, AclSubject } from '../../constants/acl';
import { CustomerService } from './customer.service';
import { CustomerDto } from './dto/customer.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { ChangePinDto } from './dto/change-pin.dto';
import { BlacklistCustomerDto } from './dto/blacklist-customer.dto';
import { ScanKtpDto } from './dto/scan-ktp.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Controller({ path: 'customers', version: '1' })
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('scan-ktp')
  @Auth([{ action: AclAction.CREATE, subject: AclSubject.CUSTOMER }])
  async scanKtp(@Body() dto: ScanKtpDto): Promise<{
    nik: string;
    name: string;
    dob: string;
    address: string;
    extractedData: Record<string, unknown>;
  }> {
    return this.customerService.scanKtp(dto);
  }

  @Get()
  @Auth([{ action: AclAction.READ, subject: AclSubject.CUSTOMER }])
  async findAll(
    @Query() queryDto: QueryCustomerDto,
    @Req() req: Request,
  ): Promise<{ data: CustomerDto[]; meta: PageMetaDto }> {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.customerService.findAll(queryDto, userPtId);
  }

  @Get(':id')
  @Auth([{ action: AclAction.READ, subject: AclSubject.CUSTOMER }])
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CustomerDto> {
    return this.customerService.findOne(id);
  }

  @Post()
  @Auth([{ action: AclAction.CREATE, subject: AclSubject.CUSTOMER }])
  async create(
    @Body() createDto: CreateCustomerDto,
    @Req() req: Request,
  ): Promise<CustomerDto> {
    const user = (req as any).user;
    const createdBy = user?.uuid ?? '';
    return this.customerService.create(createDto, createdBy);
  }

  @Put(':id')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.CUSTOMER }])
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCustomerDto,
  ): Promise<CustomerDto> {
    return this.customerService.update(id, updateDto);
  }

  @Put(':id/pin')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.CUSTOMER }])
  async changePin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changePinDto: ChangePinDto,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    const user = (req as any).user;
    const changedBy = user?.uuid ?? null;
    const ipAddress = (req.headers['x-forwarded-for'] as string) ?? req.socket?.remoteAddress ?? undefined;
    const userAgent = req.headers['user-agent'];
    await this.customerService.changePin(
      id,
      changePinDto,
      changedBy,
      changePinDto.oldPin ? 'customer_request' : 'admin_reset',
      ipAddress,
      userAgent,
    );
    return { success: true };
  }

  @Post(':id/blacklist')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.CUSTOMER }])
  async blacklist(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BlacklistCustomerDto,
    @Req() req: Request,
  ): Promise<CustomerDto> {
    const user = (req as any).user;
    const blacklistedBy = user?.uuid ?? '';
    return this.customerService.blacklist(id, dto, blacklistedBy);
  }

  @Delete(':id/blacklist')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.CUSTOMER }])
  async unblacklist(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<CustomerDto> {
    const user = (req as any).user;
    const unblacklistedBy = user?.uuid ?? '';
    return this.customerService.unblacklist(id, unblacklistedBy);
  }

  @Delete(':id')
  @Auth([{ action: AclAction.DELETE, subject: AclSubject.CUSTOMER }])
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.customerService.remove(id);
  }
}
