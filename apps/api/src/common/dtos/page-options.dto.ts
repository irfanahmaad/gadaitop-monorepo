import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PageOptionsDto {
  @IsOptional()
  @IsEnum(Order)
  @Type(() => String)
  order?: Order = Order.ASC;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pageSize: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number;

  @IsObject()
  @IsOptional()
  filter?: Record<string, string | number>;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  query?: string;
  
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  relation?: Record<string, any>;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  select?: Record<string, any>;

  /**
   * Get the skip value, calculating it from page and pageSize if not provided
   * Page starts from 1, so skip = (page - 1) * pageSize
   */
  getSkip(): number {
    if (this.skip !== undefined) {
      return this.skip;
    }
    return (this.page - 1) * this.pageSize;
  }

  /**
   * Get the take value for pagination. Returns undefined if pageSize is 0 (load all)
   */
  getTake(): number | undefined {
    return this.pageSize === 0 ? undefined : this.pageSize;
  }
}
