import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { Auth, AuthUser, RequestCompanyId } from '../../decorators';
import { UserEntity } from '../user/entities/user.entity';
import { BorrowRequestService } from './borrow-request.service';
import { BorrowRequestDto } from './dto/borrow-request.dto';
import { CreateBorrowRequestDto } from './dto/create-borrow-request.dto';
import { RejectBorrowRequestDto } from './dto/reject-borrow-request.dto';
import { PageOptionsDto } from '../../common/dtos/page-options.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Controller({ path: 'borrow-requests', version: '1' })
export class BorrowRequestController {
  constructor(private readonly borrowRequestService: BorrowRequestService) {}

  @Get()
  @Auth([])
  async findAll(
    @Query() query: PageOptionsDto,
    @AuthUser() user: UserEntity,
    @RequestCompanyId() targetCompanyId: string | undefined,
  ): Promise<{
    data: BorrowRequestDto[];
    meta: PageMetaDto;
  }> {
    console.log('targetCompanyId', targetCompanyId);
    const requesterId = user?.uuid ?? undefined;
    return this.borrowRequestService.findAll(query, requesterId, targetCompanyId);
  }

  @Get(':id')
  @Auth([])
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<BorrowRequestDto> {
    return this.borrowRequestService.findOne(id);
  }

  @Post()
  @Auth([])
  async create(
    @Body() createDto: CreateBorrowRequestDto,
    @AuthUser() user: UserEntity,
  ): Promise<BorrowRequestDto> {
    const requesterId = user?.uuid ?? '';
    return this.borrowRequestService.create(createDto, requesterId);
  }

  @Patch(':id/approve')
  @Auth([])
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserEntity,
  ): Promise<BorrowRequestDto> {
    const processorId = user?.uuid ?? '';
    return this.borrowRequestService.approve(id, processorId);
  }

  @Patch(':id/reject')
  @Auth([])
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() rejectDto: RejectBorrowRequestDto,
    @AuthUser() user: UserEntity,
  ): Promise<BorrowRequestDto> {
    const processorId = user?.uuid ?? '';
    return this.borrowRequestService.reject(id, processorId, rejectDto.rejectionReason);
  }
}
