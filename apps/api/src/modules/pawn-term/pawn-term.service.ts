import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PageMetaDto } from '../../common/dtos/page-meta.dto';
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
    const query = this.pawnTermRepository.createQueryBuilder('pawn_term');

    if (userPtId) {
      query.andWhere('pawn_term.ptId = :ptId', { ptId: userPtId });
    }

    if (queryDto.ptId) {
      query.andWhere('pawn_term.ptId = :ptId', { ptId: queryDto.ptId });
    }

    if (queryDto.itemTypeId) {
      query.andWhere('pawn_term.itemTypeId = :itemTypeId', {
        itemTypeId: queryDto.itemTypeId,
      });
    }

    if (queryDto.sortBy) {
      query.orderBy(`pawn_term.${queryDto.sortBy}`, queryDto.order || 'ASC');
    } else {
      query.orderBy('pawn_term.createdAt', 'DESC');
    }

    query.skip(queryDto.getSkip());
    const take = queryDto.getTake();
    if (take !== undefined) {
      query.take(take);
    }

    query.leftJoinAndSelect('pawn_term.itemType', 'itemType');
    query.leftJoinAndSelect('pawn_term.pt', 'pt');

    const [terms, count] = await query.getManyAndCount();

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
