import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { Auth } from '../../decorators';
import { AclAction, AclSubject } from '../../constants/acl';
import { BranchService } from './branch.service';
import { BranchDto } from './dto/branch.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { QueryBranchDto } from './dto/query-branch.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Controller({ path: 'branches', version: '1' })
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get()
  @Auth([{ action: AclAction.READ, subject: AclSubject.STORE }])
  async findAll(
    @Query() queryDto: QueryBranchDto,
    @Req() req: Request,
  ): Promise<{
    data: BranchDto[];
    meta: PageMetaDto;
  }> {
    const user = (req as any).user;
    const userCompanyId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.branchService.findAll(queryDto, userCompanyId);
  }

  @Get(':id')
  @Auth([{ action: AclAction.READ, subject: AclSubject.STORE }])
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<BranchDto> {
    return this.branchService.findOne(id);
  }

  @Post()
  @Auth([{ action: AclAction.CREATE, subject: AclSubject.STORE }])
  async create(
    @Body() createDto: CreateBranchDto,
    @Req() req: Request,
  ): Promise<BranchDto> {
    const user = (req as any).user;
    const ownerId = user?.uuid ?? '';
    return this.branchService.create(createDto, ownerId);
  }

  @Patch(':id')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.STORE }])
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBranchDto,
  ): Promise<BranchDto> {
    return this.branchService.update(id, updateDto);
  }

  @Delete(':id')
  @Auth([{ action: AclAction.DELETE, subject: AclSubject.STORE }])
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.branchService.remove(id);
  }

  @Patch(':id/approve')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.STORE }])
  async approveBorrowRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<BranchDto> {
    const user = (req as any).user;
    const approverId = user?.uuid ?? '';
    return this.branchService.approveBorrowRequest(id, approverId);
  }

  @Patch(':id/reject')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.STORE }])
  async rejectBorrowRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { rejectionReason: string },
    @Req() req: Request,
  ): Promise<BranchDto> {
    const user = (req as any).user;
    const approverId = user?.uuid ?? '';
    return this.branchService.rejectBorrowRequest(id, approverId, body.rejectionReason);
  }
}
