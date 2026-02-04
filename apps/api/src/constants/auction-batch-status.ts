/**
 * Auction batch (BatchLelang) status.
 * Flow: draft → pickup_in_progress → validation_pending → ready_for_auction | cancelled
 */
export enum AuctionBatchStatusEnum {
  Draft = 'draft',
  PickupInProgress = 'pickup_in_progress',
  ValidationPending = 'validation_pending',
  ReadyForAuction = 'ready_for_auction',
  Cancelled = 'cancelled',
}
