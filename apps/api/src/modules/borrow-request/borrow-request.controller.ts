import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  ParseUUIDPipe,
} from '@nestjs/common';

import { Auth } from '../../decorators';
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
  async findAll(@Query() query: PageOptionsDto): Promise<{
    data: BorrowRequestDto[];
    meta: PageMetaDto;
  }> {
    // TODO: Get requesterId/targetCompanyId from auth user
    return this.borrowRequestService.findAll(query);
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
    // TODO: Get requesterId from auth user
  ): Promise<BorrowRequestDto> {
    // TODO: Get requesterId from auth user
    return this.borrowRequestService.create(createDto, '');
  }

  @Patch(':id/approve')
  @Auth([])
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    // TODO: Get processorId from auth user
  ): Promise<BorrowRequestDto> {
    // TODO: Get processorId from auth user
    return this.borrowRequestService.approve(id, '');
  }

  @Patch(':id/reject')
  @Auth([])
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() rejectDto: RejectBorrowRequestDto,
    // TODO: Get processorId from auth user
  ): Promise<BorrowRequestDto> {
    // TODO: Get processorId from auth user
    return this.borrowRequestService.reject(id, '', rejectDto.rejectionReason);
  }
}
