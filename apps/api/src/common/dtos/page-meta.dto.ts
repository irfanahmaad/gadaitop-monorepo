import type { PageOptionsDto } from './page-options.dto';

interface IPageMetaDtoParameters {
  pageOptionsDto: PageOptionsDto;
  itemCount: number;
}

export class PageMetaDto {
  readonly page: number;

  readonly pageSize: number;

  readonly count: number;

  readonly pageCount: number;

  readonly hasPreviousPage: boolean;

  readonly hasNextPage: boolean;

  constructor({ pageOptionsDto, itemCount }: IPageMetaDtoParameters) {
    this.count = itemCount;
    this.page = pageOptionsDto.page;
    this.pageSize = pageOptionsDto.pageSize;
    // If pageSize is 0, it means load all data, so pageCount is 1
    this.pageCount = this.pageSize === 0 ? 1 : Math.ceil(this.count / this.pageSize);
    this.hasPreviousPage = this.page > 1;
    // If pageSize is 0, there's no next page since all data is loaded
    this.hasNextPage = this.pageSize === 0 ? false : this.page < this.pageCount;
  }
}
