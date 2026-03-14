import { IsIn, IsOptional } from 'class-validator';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';

export const BorrowRequestListView = {
  Incoming: 'incoming',
  Outgoing: 'outgoing',
} as const;
export type BorrowRequestListViewType =
  (typeof BorrowRequestListView)[keyof typeof BorrowRequestListView];

export class QueryBorrowRequestDto extends PageOptionsDto {
  /** When 'incoming', filter by targetCompanyId only (requests for my PT to approve). When 'outgoing', filter by requesterId only (my requests). */
  @IsOptional()
  @IsIn([BorrowRequestListView.Incoming, BorrowRequestListView.Outgoing])
  view?: BorrowRequestListViewType;
}
