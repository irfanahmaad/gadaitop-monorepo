/**
 * Per-item auction status (Admin PT) – after batch is ready_for_auction.
 * FR-132: Update Auction Item Status (Ready, In Auction, Sold, Unsold).
 */
export enum AuctionItemStatusEnum {
  Ready = 'ready',
  InAuction = 'in_auction',
  Sold = 'sold',
  Unsold = 'unsold',
}
