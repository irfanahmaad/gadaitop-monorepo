import { IsObject, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PageOptionsDto {
  order?: Order = Order.ASC;

  @Type(() => Number)
  page: number = 0;

  @Type(() => Number)
  pageSize: number = 10;

  @Type(() => Number)
  skip?: number = this.page * this.pageSize;

  @IsObject()
  @IsOptional()
  filter?: Record<string, string | number>;

  sortBy?: string;

  query?: string;
}
