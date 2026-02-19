import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, Repository } from 'typeorm';

import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import {
  DynamicQueryBuilder,
  QueryBuilderOptionsType,
  sortAttribute,
} from '../../common/helpers/query-builder';
import { CatalogEntity } from './entities/catalog.entity';
import { CatalogPriceHistoryEntity } from './entities/catalog-price-history.entity';
import { CatalogDto } from './dto/catalog.dto';
import { CatalogPriceHistoryDto } from './dto/catalog-price-history.dto';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { QueryCatalogDto } from './dto/query-catalog.dto';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(CatalogEntity)
    private catalogRepository: Repository<CatalogEntity>,
    @InjectRepository(CatalogPriceHistoryEntity)
    private priceHistoryRepository: Repository<CatalogPriceHistoryEntity>,
  ) {}

  async findAll(
    queryDto: QueryCatalogDto,
    userPtId?: string,
  ): Promise<{ data: CatalogDto[]; meta: PageMetaDto }> {
    const where: FindOptionsWhere<CatalogEntity> = {};

    if (userPtId) {
      where.ptId = userPtId;
    }
    if (queryDto.ptId) {
      where.ptId = queryDto.ptId;
    }
    if (queryDto.itemTypeId) {
      where.itemTypeId = queryDto.itemTypeId;
    }

    const qbOptions: QueryBuilderOptionsType<CatalogEntity> = {
      ...queryDto,
      relation: {
        itemType: true,
      },
      where,
      orderBy: sortAttribute(queryDto.sortBy, {
        code: { code: true },
        name: { name: true },
        createdAt: { createdAt: true },
      }) ?? { createdAt: 'DESC' } as any,
    };

    const dynamicQueryBuilder = new DynamicQueryBuilder(this.catalogRepository.metadata);
    const [catalogs, count] = await dynamicQueryBuilder.buildDynamicQuery(
      CatalogEntity.createQueryBuilder('catalog'),
      qbOptions,
    );

    const data = catalogs.map((c) => new CatalogDto(c));
    const meta = new PageMetaDto({
      pageOptionsDto: queryDto,
      itemCount: count,
    });

    return { data, meta };
  }

  async findOne(uuid: string): Promise<CatalogDto> {
    const catalog = await this.catalogRepository.findOne({
      where: { uuid },
      relations: ['pt', 'itemType'],
    });

    if (!catalog) {
      throw new NotFoundException(`Catalog with UUID ${uuid} not found`);
    }

    return new CatalogDto(catalog);
  }

  async create(createDto: CreateCatalogDto, createdBy: string | null): Promise<CatalogDto> {
    const existing = await this.catalogRepository.findOne({
      where: { ptId: createDto.ptId, code: createDto.code },
    });

    if (existing) {
      throw new BadRequestException(
        `Catalog with code ${createDto.code} already exists for this PT`,
      );
    }

    const catalog = this.catalogRepository.create({
      code: createDto.code,
      name: createDto.name,
      ptId: createDto.ptId,
      itemTypeId: createDto.itemTypeId,
      basePrice: String(createDto.basePrice),
      pawnValueMin: String(createDto.pawnValueMin),
      pawnValueMax: String(createDto.pawnValueMax),
      tenorOptions: createDto.tenorOptions ?? null,
      description: createDto.description ?? null,
      createdBy,
    });

    const saved = await this.catalogRepository.save(catalog);

    await this.priceHistoryRepository.save(
      this.priceHistoryRepository.create({
        catalogId: saved.uuid,
        basePrice: saved.basePrice,
        pawnValueMin: saved.pawnValueMin,
        pawnValueMax: saved.pawnValueMax,
        effectiveFrom: new Date(),
        effectiveUntil: null,
        changeReason: 'initial',
        createdBy,
      }),
    );

    return new CatalogDto(saved);
  }

  async update(
    uuid: string,
    updateDto: UpdateCatalogDto,
    updatedBy: string | null,
  ): Promise<CatalogDto> {
    const catalog = await this.catalogRepository.findOne({
      where: { uuid },
    });

    if (!catalog) {
      throw new NotFoundException(`Catalog with UUID ${uuid} not found`);
    }

    const priceChanged =
      (updateDto.basePrice !== undefined && Number(catalog.basePrice) !== updateDto.basePrice) ||
      (updateDto.pawnValueMin !== undefined &&
        Number(catalog.pawnValueMin) !== updateDto.pawnValueMin) ||
      (updateDto.pawnValueMax !== undefined &&
        Number(catalog.pawnValueMax) !== updateDto.pawnValueMax);

    if (priceChanged) {
      await this.priceHistoryRepository
        .createQueryBuilder()
        .update(CatalogPriceHistoryEntity)
        .set({ effectiveUntil: new Date() })
        .where('catalog_id = :catalogId', { catalogId: uuid })
        .andWhere('effective_until IS NULL')
        .execute();

      await this.priceHistoryRepository.save(
        this.priceHistoryRepository.create({
          catalogId: uuid,
          basePrice: String(
            updateDto.basePrice ?? catalog.basePrice,
          ),
          pawnValueMin: String(
            updateDto.pawnValueMin ?? catalog.pawnValueMin,
          ),
          pawnValueMax: String(
            updateDto.pawnValueMax ?? catalog.pawnValueMax,
          ),
          effectiveFrom: new Date(),
          effectiveUntil: null,
          changeReason: 'price_update',
          createdBy: updatedBy,
        }),
      );
    }

    Object.assign(catalog, {
      ...updateDto,
      basePrice: updateDto.basePrice !== undefined ? String(updateDto.basePrice) : catalog.basePrice,
      pawnValueMin:
        updateDto.pawnValueMin !== undefined
          ? String(updateDto.pawnValueMin)
          : catalog.pawnValueMin,
      pawnValueMax:
        updateDto.pawnValueMax !== undefined
          ? String(updateDto.pawnValueMax)
          : catalog.pawnValueMax,
      updatedBy,
    });

    const updated = await this.catalogRepository.save(catalog);
    return new CatalogDto(updated);
  }

  async remove(uuid: string): Promise<void> {
    const catalog = await this.catalogRepository.findOne({
      where: { uuid },
    });

    if (!catalog) {
      throw new NotFoundException(`Catalog with UUID ${uuid} not found`);
    }

    await this.catalogRepository.softDelete({ uuid });
  }

  async getPriceHistory(catalogId: string): Promise<CatalogPriceHistoryDto[]> {
    const history = await this.priceHistoryRepository.find({
      where: { catalogId },
      order: { effectiveFrom: 'DESC' },
    });

    return history.map((h) => new CatalogPriceHistoryDto(h));
  }

  async importFromFile(
    _ptId: string,
    _file: unknown,
    _createdBy: string | null,
  ): Promise<{ importedCount: number; errors: string[] }> {
    // Placeholder for Excel bulk import
    return { importedCount: 0, errors: [] };
  }

  async findByUuid(uuid: string): Promise<CatalogEntity | null> {
    return this.catalogRepository.findOne({
      where: { uuid },
      relations: ['itemType'],
    });
  }
}
