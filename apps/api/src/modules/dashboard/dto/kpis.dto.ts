export class DashboardKpisDto {
  activeSpkCount: number;
  overdueSpkCount: number;
  nkbCountThisMonth: number;
  /** Balance per store (store uuid -> balance) */
  balanceByStore: Record<string, number>;
  /** Total balance across stores */
  totalBalance: number;
}
