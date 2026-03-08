import { StockOpnameSessionStatusEnum } from '../../../constants/stock-opname-session-status';
import { StockOpnameSessionEntity } from '../entities/stock-opname-session.entity';
import { StockOpnameItemDto } from './stock-opname-item.dto';

export type StoreSummary = { uuid: string; shortName?: string; fullName?: string };
export type AssigneeSummary = { uuid: string; fullName?: string; name?: string; email?: string };
export type PawnTermSummary = {
  uuid: string;
  ruleName?: string | null;
  itemType?: { typeName?: string };
  tenorMin?: number;
  tenorMax?: number;
};

export class StockOpnameSessionDto {
  uuid: string;
  sessionCode: string;
  ptId: string;
  storeIds: string[];
  stores: StoreSummary[];
  pawnTermIds: string[];
  pawnTerms: PawnTermSummary[];
  mataItemCount: number | null;
  startDate: Date;
  endDate: Date | null;
  status: StockOpnameSessionStatusEnum;
  totalItemsSystem: number;
  totalItemsCounted: number;
  variancesCount: number;
  createdAt: Date;
  updatedAt: Date;
  notes: string | null;
  assignees: AssigneeSummary[];
  creatorFullName?: string;
  items?: StockOpnameItemDto[];

  constructor(
    session: StockOpnameSessionEntity & {
      items?: any[];
      sessionStores?: Array<{ store?: { uuid: string; shortName?: string; fullName?: string } }>;
      sessionAssignees?: Array<{
        user?: { uuid: string; fullName?: string; name?: string; email?: string };
      }>;
      sessionPawnTerms?: Array<{
        pawnTerm?: {
          uuid: string;
          ruleName?: string | null;
          itemType?: { typeName?: string };
          tenorMin?: number;
          tenorMax?: number;
        };
      }>;
      creator?: { fullName: string };
    },
  ) {
    this.uuid = session.uuid;
    this.sessionCode = session.sessionCode;
    this.ptId = session.ptId;
    this.storeIds = (session.sessionStores ?? [])
      .map((ss) => ss.store?.uuid)
      .filter((id): id is string => !!id);
    this.stores = (session.sessionStores ?? []).map((ss) => ({
      uuid: ss.store?.uuid ?? '',
      shortName: ss.store?.shortName,
      fullName: ss.store?.fullName,
    }));
    this.pawnTermIds = (session.sessionPawnTerms ?? [])
      .map((spt) => spt.pawnTerm?.uuid)
      .filter((id): id is string => !!id);
    this.pawnTerms = (session.sessionPawnTerms ?? []).map((spt) => {
      const pt = spt.pawnTerm;
      return {
        uuid: pt?.uuid ?? '',
        ruleName: pt?.ruleName,
        itemType: pt?.itemType,
        tenorMin: pt?.tenorMin,
        tenorMax: pt?.tenorMax,
      };
    });
    this.mataItemCount = session.mataItemCount ?? null;
    this.startDate = session.startDate;
    this.endDate = session.endDate ?? null;
    this.status = session.status;
    this.totalItemsSystem = session.totalItemsSystem ?? 0;
    this.totalItemsCounted = session.totalItemsCounted ?? 0;
    this.variancesCount = session.variancesCount ?? 0;
    this.createdAt = session.createdAt;
    this.updatedAt = session.updatedAt ?? session.createdAt;
    this.notes = session.notes ?? null;
    this.assignees = (session.sessionAssignees ?? []).map((sa) => {
      const u = sa.user;
      return {
        uuid: u?.uuid ?? '',
        fullName: u?.fullName ?? u?.name,
        name: u?.name ?? u?.fullName,
        email: u?.email,
      };
    });
    this.creatorFullName = session.creator?.fullName;
    if (session.items?.length) {
      this.items = session.items.map((i) => new StockOpnameItemDto(i));
    }
  }
}
