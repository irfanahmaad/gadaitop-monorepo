import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import { SoPriorityRuleEntity } from './entities/so-priority-rule.entity';
import { SoPriorityRuleDto } from './dto/so-priority-rule.dto';
import { CreateSoPriorityRuleDto } from './dto/create-so-priority-rule.dto';
import { UpdateSoPriorityRuleDto } from './dto/update-so-priority-rule.dto';
import { QuerySoPriorityRuleDto } from './dto/query-so-priority-rule.dto';

@Injectable()
export class SoPriorityRuleService {
  constructor(
    @InjectRepository(SoPriorityRuleEntity)
    private ruleRepository: Repository<SoPriorityRuleEntity>,
  ) {}

  async findAll(
    queryDto: QuerySoPriorityRuleDto,
    userPtId?: string,
  ): Promise<{ data: SoPriorityRuleDto[]; meta: PageMetaDto }> {
    const query = this.ruleRepository
      .createQueryBuilder('rule')
      .orderBy('rule.priorityLevel', 'ASC');

    const effectivePtId = queryDto.ptId ?? userPtId;
    if (effectivePtId) {
      query.andWhere('rule.ptId = :ptId', { ptId: effectivePtId });
    }

    query.skip(queryDto.getSkip());
    const take = queryDto.getTake();
    if (take !== undefined) {
      query.take(take);
    }

    const [rules, count] = await query.getManyAndCount();
    const data = rules.map((r) => new SoPriorityRuleDto(r));
    const meta = new PageMetaDto({
      pageOptionsDto: queryDto,
      itemCount: count,
    });
    return { data, meta };
  }

  async findOne(uuid: string): Promise<SoPriorityRuleDto> {
    const rule = await this.ruleRepository.findOne({ where: { uuid } });
    if (!rule) {
      throw new NotFoundException(`SO priority rule with UUID ${uuid} not found`);
    }
    return new SoPriorityRuleDto(rule);
  }

  async create(
    createDto: CreateSoPriorityRuleDto,
    createdBy: string | null,
  ): Promise<SoPriorityRuleDto> {
    const rule = this.ruleRepository.create({
      ptId: createDto.ptId,
      ruleName: createDto.ruleName,
      ruleType: createDto.ruleType,
      ruleConfig: createDto.ruleConfig,
      priorityLevel: createDto.priorityLevel,
      isActive: createDto.isActive ?? true,
      description: createDto.description ?? null,
      createdBy,
    });
    const saved = await this.ruleRepository.save(rule);
    return this.findOne(saved.uuid);
  }

  async update(
    uuid: string,
    updateDto: UpdateSoPriorityRuleDto,
  ): Promise<SoPriorityRuleDto> {
    const rule = await this.ruleRepository.findOne({ where: { uuid } });
    if (!rule) {
      throw new NotFoundException(`SO priority rule with UUID ${uuid} not found`);
    }
    Object.assign(rule, updateDto);
    await this.ruleRepository.save(rule);
    return this.findOne(uuid);
  }

  async remove(uuid: string): Promise<void> {
    const rule = await this.ruleRepository.findOne({ where: { uuid } });
    if (!rule) {
      throw new NotFoundException(`SO priority rule with UUID ${uuid} not found`);
    }
    await this.ruleRepository.softRemove(rule);
  }
}
