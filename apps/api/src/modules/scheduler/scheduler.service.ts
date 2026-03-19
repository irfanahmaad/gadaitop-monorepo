import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, In, Repository } from 'typeorm';

import { SpkStatusEnum } from '../../constants/spk-status';
import { SpkRecordEntity } from '../spk/entities/spk-record.entity';
import { CashDepositService } from '../cash-deposit/cash-deposit.service';

/**
 * Scheduler service for cron jobs: SPK overdue checker, deposit expiry, etc.
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(SpkRecordEntity)
    private spkRepository: Repository<SpkRecordEntity>,
    private cashDepositService: CashDepositService,
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
      this.logger.log(`Marked ${result.affected} SPK(s) as overdue`);
    }
  }

  /**
   * Run daily at 00:01. Expire all pending cash deposits where expiresAt < now.
   * VA validity is end-of-day WIB; this job runs just after midnight to catch them.
   */
  @Cron('1 0 * * *', { name: 'deposit-expiry-checker' })
  async expirePendingDeposits(): Promise<void> {
    const count = await this.cashDepositService.expirePendingDeposits();
    if (count > 0) {
      this.logger.log(`Expired ${count} pending cash deposit(s)`);
    }
  }
}
