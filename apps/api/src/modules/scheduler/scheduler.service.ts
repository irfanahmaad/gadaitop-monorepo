import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, In, Repository } from 'typeorm';

import { SpkStatusEnum } from '../../constants/spk-status';
import { SpkRecordEntity } from '../spk/entities/spk-record.entity';

/**
 * Scheduler service for cron jobs: SPK overdue checker, etc.
 */
@Injectable()
export class SchedulerService {
  constructor(
    @InjectRepository(SpkRecordEntity)
    private spkRepository: Repository<SpkRecordEntity>,
  ) {}

  /**
   * Run daily at 00:05 (midnight + 5 min). Set SPK status to overdue when due_date < today
   * and status is active or extended.
   */
  @Cron('5 0 * * *', { name: 'spk-overdue-checker' })
  async markOverdueSpk(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.spkRepository.update(
      {
        status: In([SpkStatusEnum.Active, SpkStatusEnum.Extended]),
        dueDate: LessThan(today),
      },
      { status: SpkStatusEnum.Overdue },
    );

    if (result.affected && result.affected > 0) {
      // Optional: log or emit event for notifications
    }
  }
}
