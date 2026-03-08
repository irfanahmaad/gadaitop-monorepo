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
  updatedAt: Date;
  notes: string | null;
  items?: StockOpnameItemDto[];
  /** Assigned staff (petugas SO) — from session creator */
  assignedTo?: { uuid: string; fullName?: string; name?: string; email?: string } | null;

  constructor(
    session: StockOpnameSessionEntity & { items?: any[]; creator?: any },
  ) {
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
    this.updatedAt = session.updatedAt;
    this.notes = session.notes ?? null;
    if (session.items?.length) {
      this.items = session.items.map((i) => new StockOpnameItemDto(i));
    }
    if (session.creator) {
      const c = session.creator;
      this.assignedTo = {
        uuid: c.uuid,
        fullName: c.fullName ?? c.name,
        name: c.name ?? c.fullName,
        email: c.email,
      };
    } else {
      this.assignedTo = null;
    }
  }
}
