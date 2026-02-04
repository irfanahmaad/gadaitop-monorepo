/**
 * SPK (Surat Perjanjian Kredit) record status.
 * State machine: draft → active → extended | redeemed | overdue | auctioned | closed
 */
export enum SpkStatusEnum {
  Draft = 'draft',
  Active = 'active',
  Extended = 'extended',
  Redeemed = 'redeemed',
  Overdue = 'overdue',
  Auctioned = 'auctioned',
  Closed = 'closed',
}
