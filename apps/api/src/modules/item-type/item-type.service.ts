import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ItemTypeEntity } from './entities/item-type.entity';
import { ItemTypeDto } from './dto/item-type.dto';
import { CreateItemTypeDto } from './dto/create-item-type.dto';
import { UpdateItemTypeDto } from './dto/update-item-type.dto';
import { PageOptionsDto } from '../../common/dtos/page-options.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Injectable()
export class ItemTypeService {
  constructor(
    @InjectRepository(ItemTypeEntity)
    private itemTypeRepository: Repository<ItemTypeEntity>,
  ) {}

  async findAll(options: PageOptionsDto): Promise<{
    data: ItemTypeDto[];
    meta: PageMetaDto;
  }> {
    const [items, count] = await this.itemTypeRepository.findAndCount({
      skip: options.skip,
      take: options.pageSize,
      order: options.sortBy
        ? { [options.sortBy]: options.order }
        : { sortOrder: 'ASC', createdAt: 'DESC' },
    });

    const data = items.map((item) => new ItemTypeDto(item));
    const meta = new PageMetaDto({ pageOptionsDto: options, itemCount: count });

    return { data, meta };
  }

  async findOne(uuid: string): Promise<ItemTypeDto> {
    const item = await this.itemTypeRepository.findOne({
      where: { uuid },
    });

    if (!item) {
      throw new NotFoundException(`Item type with UUID ${uuid} not found`);
    }

    return new ItemTypeDto(item);
  }

  async create(createDto: CreateItemTypeDto): Promise<ItemTypeDto> {
    const existing = await this.itemTypeRepository.findOne({
      where: { typeCode: createDto.typeCode },
    });

    if (existing) {
      throw new BadRequestException(
        `Item type with code ${createDto.typeCode} already exists`,
      );
    }

    const item = this.itemTypeRepository.create({
      ...createDto,
      isActive: createDto.isActive ?? true,
      sortOrder: createDto.sortOrder ?? 0,
    });

    const saved = await this.itemTypeRepository.save(item);
    return new ItemTypeDto(saved);
  }

  async update(uuid: string, updateDto: UpdateItemTypeDto): Promise<ItemTypeDto> {
    const item = await this.itemTypeRepository.findOne({
      where: { uuid },
    });

    if (!item) {
      throw new NotFoundException(`Item type with UUID ${uuid} not found`);
    }

    Object.assign(item, updateDto);
    const updated = await this.itemTypeRepository.save(item);

    return new ItemTypeDto(updated);
  }

  async remove(uuid: string): Promise<void> {
    const item = await this.itemTypeRepository.findOne({
      where: { uuid },
    });

    if (!item) {
      throw new NotFoundException(`Item type with UUID ${uuid} not found`);
    }

    await this.itemTypeRepository.softDelete({ uuid });
  }
}
