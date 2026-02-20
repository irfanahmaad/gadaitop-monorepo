import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, Repository } from 'typeorm';

import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import {
  DynamicQueryBuilder,
  QueryBuilderOptionsType,
  sortAttribute,
} from '../../common/helpers/query-builder';
import { PawnTermEntity } from './entities/pawn-term.entity';
import { PawnTermDto } from './dto/pawn-term.dto';
import { CreatePawnTermDto } from './dto/create-pawn-term.dto';
import { UpdatePawnTermDto } from './dto/update-pawn-term.dto';
import { QueryPawnTermDto } from './dto/query-pawn-term.dto';

@Injectable()
export class PawnTermService {
  constructor(
    @InjectRepository(PawnTermEntity)
    private pawnTermRepository: Repository<PawnTermEntity>,
  ) {}

  async findAll(
    queryDto: QueryPawnTermDto,
    userPtId?: string,
  ): Promise<{ data: PawnTermDto[]; meta: PageMetaDto }> {
    const search = queryDto.search?.trim();

    if (search) {
      return this.findAllWithSearch(queryDto, userPtId, search);
    }

    const where: FindOptionsWhere<PawnTermEntity> = {};

    if (userPtId) {
      where.ptId = userPtId;
    }
    if (queryDto.ptId) {
      where.ptId = queryDto.ptId;
    }
    if (queryDto.itemTypeId) {
      where.itemTypeId = queryDto.itemTypeId;
    }

    const qbOptions: QueryBuilderOptionsType<PawnTermEntity> = {
      ...queryDto,
      relation: {
        itemType: true,
        pt: true,
      },
      where,
      orderBy: sortAttribute(queryDto.sortBy, {
        createdAt: { createdAt: true },
      }) ?? { createdAt: 'DESC' } as any,
    };

    const dynamicQueryBuilder = new DynamicQueryBuilder(this.pawnTermRepository.metadata);
    const [terms, count] = await dynamicQueryBuilder.buildDynamicQuery(
      PawnTermEntity.createQueryBuilder('pawn_term'),
      qbOptions,
    );

    const data = terms.map((t) => new PawnTermDto(t));
    const meta = new PageMetaDto({
      pageOptionsDto: queryDto,
      itemCount: count,
    });

    return { data, meta };
  }

  private async findAllWithSearch(
    queryDto: QueryPawnTermDto,
    userPtId: string | undefined,
    search: string,
  ): Promise<{ data: PawnTermDto[]; meta: PageMetaDto }> {
    const qb = this.pawnTermRepository
      .createQueryBuilder('pawn_term')
      .leftJoinAndSelect('pawn_term.itemType', 'itemType')
      .leftJoinAndSelect('pawn_term.pt', 'pt')
      .where('itemType.typeName ILIKE :search', { search: `%${search}%` });

    if (userPtId) {
      qb.andWhere('pawn_term.ptId = :userPtId', { userPtId });
    }
    if (queryDto.ptId) {
      qb.andWhere('pawn_term.ptId = :ptId', { ptId: queryDto.ptId });
    }
    if (queryDto.itemTypeId) {
      qb.andWhere('pawn_term.itemTypeId = :itemTypeId', { itemTypeId: queryDto.itemTypeId });
    }

    qb.orderBy('pawn_term.createdAt', 'DESC');

    const skip = queryDto.getSkip();
    const take = queryDto.getTake();
    if (take !== undefined) {
      qb.take(take);
    }
    qb.skip(skip);

    const [terms, count] = await qb.getManyAndCount();

    const data = terms.map((t) => new PawnTermDto(t));
    const meta = new PageMetaDto({
      pageOptionsDto: queryDto,
      itemCount: count,
    });

    return { data, meta };
  }

  async findOne(uuid: string): Promise<PawnTermDto> {
    const term = await this.pawnTermRepository.findOne({
      where: { uuid },
      relations: ['pt', 'itemType'],
    });

    if (!term) {
      throw new NotFoundException(`Pawn term with UUID ${uuid} not found`);
    }

    return new PawnTermDto(term);
  }

  async create(createDto: CreatePawnTermDto, createdBy: string | null): Promise<PawnTermDto> {
    const existing = await this.pawnTermRepository.findOne({
      where: { ptId: createDto.ptId, itemTypeId: createDto.itemTypeId },
    });

    if (existing) {
      throw new BadRequestException(
        `Pawn term for this PT and item type already exists`,
      );
    }

    if (createDto.loanLimitMin > createDto.loanLimitMax) {
      throw new BadRequestException('loanLimitMin must be less than or equal to loanLimitMax');
    }

    const term = this.pawnTermRepository.create({
      ptId: createDto.ptId,
      itemTypeId: createDto.itemTypeId,
      loanLimitMin: String(createDto.loanLimitMin),
      loanLimitMax: String(createDto.loanLimitMax),
      tenorDefault: createDto.tenorDefault,
      interestRate: String(createDto.interestRate),
      adminFee: String(createDto.adminFee ?? 0),
      itemCondition: createDto.itemCondition ?? 'present_and_matching',
      createdBy,
    });

    const saved = await this.pawnTermRepository.save(term);
    return new PawnTermDto(saved);
  }

  async update(uuid: string, updateDto: UpdatePawnTermDto): Promise<PawnTermDto> {
    const term = await this.pawnTermRepository.findOne({
      where: { uuid },
    });

    if (!term) {
      throw new NotFoundException(`Pawn term with UUID ${uuid} not found`);
    }

    if (
      updateDto.loanLimitMin !== undefined &&
      updateDto.loanLimitMax !== undefined &&
      updateDto.loanLimitMin > updateDto.loanLimitMax
    ) {
      throw new BadRequestException('loanLimitMin must be less than or equal to loanLimitMax');
    }

    Object.assign(term, {
      ...updateDto,
      loanLimitMin: updateDto.loanLimitMin !== undefined ? String(updateDto.loanLimitMin) : term.loanLimitMin,
      loanLimitMax: updateDto.loanLimitMax !== undefined ? String(updateDto.loanLimitMax) : term.loanLimitMax,
      interestRate: updateDto.interestRate !== undefined ? String(updateDto.interestRate) : term.interestRate,
      adminFee: updateDto.adminFee !== undefined ? String(updateDto.adminFee) : term.adminFee,
      ...(updateDto.itemCondition !== undefined && { itemCondition: updateDto.itemCondition }),
    });

    const updated = await this.pawnTermRepository.save(term);
    return new PawnTermDto(updated);
  }

  async remove(uuid: string): Promise<void> {
    const term = await this.pawnTermRepository.findOne({
      where: { uuid },
    });

    if (!term) {
      throw new NotFoundException(`Pawn term with UUID ${uuid} not found`);
    }

    await this.pawnTermRepository.softDelete({ uuid });
  }

  async findByPtAndItemType(ptId: string, itemTypeId: string): Promise<PawnTermEntity | null> {
    return this.pawnTermRepository.findOne({
      where: { ptId, itemTypeId },
      relations: ['itemType'],
    });
  }
}
