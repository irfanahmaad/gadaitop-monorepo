import { StockOpnameSessionStatusEnum } from '../../../constants/stock-opname-session-status';
import { StockOpnameSessionEntity } from '../entities/stock-opname-session.entity';
import { StockOpnameItemDto } from './stock-opname-item.dto';

export class StockOpnameSessionDto {
  uuid: string;
  sessionCode: string;
  ptId: string;
  storeId: string;
  startDate: Date;
  endDate: Date | null;
  status: StockOpnameSessionStatusEnum;
  totalItemsSystem: number;
  totalItemsCounted: number;
  variancesCount: number;
  createdAt: Date;
  items?: StockOpnameItemDto[];

  constructor(session: StockOpnameSessionEntity & { items?: any[] }) {
    this.uuid = session.uuid;
    this.sessionCode = session.sessionCode;
    this.ptId = session.ptId;
    this.storeId = session.storeId;
    this.startDate = session.startDate;
    this.endDate = session.endDate ?? null;
    this.status = session.status;
    this.totalItemsSystem = session.totalItemsSystem ?? 0;
    this.totalItemsCounted = session.totalItemsCounted ?? 0;
    this.variancesCount = session.variancesCount ?? 0;
    this.createdAt = session.createdAt;
    if (session.items?.length) {
      this.items = session.items.map((i) => new StockOpnameItemDto(i));
    }
  }
}
