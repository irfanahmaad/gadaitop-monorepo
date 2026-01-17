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
import { ItemTypeService } from './item-type.service';
import { ItemTypeDto } from './dto/item-type.dto';
import { CreateItemTypeDto } from './dto/create-item-type.dto';
import { UpdateItemTypeDto } from './dto/update-item-type.dto';
import { PageOptionsDto } from '../../common/dtos/page-options.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Controller({ path: 'item-types', version: '1' })
export class ItemTypeController {
  constructor(private readonly itemTypeService: ItemTypeService) {}

  @Get()
  @Auth([])
  async findAll(@Query() query: PageOptionsDto): Promise<{
    data: ItemTypeDto[];
    meta: PageMetaDto;
  }> {
    return this.itemTypeService.findAll(query);
  }

  @Get(':id')
  @Auth([])
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ItemTypeDto> {
    return this.itemTypeService.findOne(id);
  }

  @Post()
  @Auth([])
  async create(@Body() createDto: CreateItemTypeDto): Promise<ItemTypeDto> {
    return this.itemTypeService.create(createDto);
  }

  @Patch(':id')
  @Auth([])
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateItemTypeDto,
  ): Promise<ItemTypeDto> {
    return this.itemTypeService.update(id, updateDto);
  }

  @Delete(':id')
  @Auth([])
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.itemTypeService.remove(id);
  }
}
