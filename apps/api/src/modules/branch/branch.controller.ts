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
} from '@nestjs/common';

import { Auth } from '../../decorators';
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
  @Auth([])
  async findAll(@Query() queryDto: QueryBranchDto): Promise<{
    data: BranchDto[];
    meta: PageMetaDto;
  }> {
    // TODO: Get userCompanyId from auth user
    return this.branchService.findAll(queryDto);
  }

  @Get(':id')
  @Auth([])
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<BranchDto> {
    return this.branchService.findOne(id);
  }

  @Post()
  @Auth([])
  async create(
    @Body() createDto: CreateBranchDto,
    // TODO: Get ownerId from auth user
  ): Promise<BranchDto> {
    // TODO: Get ownerId from auth user
    return this.branchService.create(createDto, '');
  }

  @Patch(':id')
  @Auth([])
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBranchDto,
  ): Promise<BranchDto> {
    return this.branchService.update(id, updateDto);
  }

  @Delete(':id')
  @Auth([])
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.branchService.remove(id);
  }

  @Patch(':id/approve')
  @Auth([])
  async approveBorrowRequest(
    @Param('id', ParseUUIDPipe) id: string,
    // TODO: Get approverId from auth user
  ): Promise<BranchDto> {
    // TODO: Get approverId from auth user
    return this.branchService.approveBorrowRequest(id, '');
  }

  @Patch(':id/reject')
  @Auth([])
  async rejectBorrowRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { rejectionReason: string },
    // TODO: Get approverId from auth user
  ): Promise<BranchDto> {
    // TODO: Get approverId from auth user
    return this.branchService.rejectBorrowRequest(id, '', body.rejectionReason);
  }
}
