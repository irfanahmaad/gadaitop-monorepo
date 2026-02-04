import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { Auth } from '../../decorators';
import { AclAction, AclSubject } from '../../constants/acl';
import { CatalogService } from './catalog.service';
import { CatalogDto } from './dto/catalog.dto';
import { CatalogPriceHistoryDto } from './dto/catalog-price-history.dto';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { QueryCatalogDto } from './dto/query-catalog.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Controller({ path: 'catalogs', version: '1' })
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @Auth([{ action: AclAction.READ, subject: AclSubject.CATALOG }])
  async findAll(
    @Query() queryDto: QueryCatalogDto,
    @Req() req: Request,
  ): Promise<{ data: CatalogDto[]; meta: PageMetaDto }> {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.catalogService.findAll(queryDto, userPtId);
  }

  @Get(':id/price-history')
  @Auth([{ action: AclAction.READ, subject: AclSubject.CATALOG }])
  async getPriceHistory(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CatalogPriceHistoryDto[]> {
    return this.catalogService.getPriceHistory(id);
  }

  @Get(':id')
  @Auth([{ action: AclAction.READ, subject: AclSubject.CATALOG }])
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CatalogDto> {
    return this.catalogService.findOne(id);
  }

  @Post()
  @Auth([{ action: AclAction.CREATE, subject: AclSubject.CATALOG }])
  async create(
    @Body() createDto: CreateCatalogDto,
    @Req() req: Request,
  ): Promise<CatalogDto> {
    const user = (req as any).user;
    const createdBy = user?.uuid ?? null;
    return this.catalogService.create(createDto, createdBy);
  }

  @Put(':id')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.CATALOG }])
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCatalogDto,
    @Req() req: Request,
  ): Promise<CatalogDto> {
    const user = (req as any).user;
    const updatedBy = user?.uuid ?? null;
    return this.catalogService.update(id, updateDto, updatedBy);
  }

  @Delete(':id')
  @Auth([{ action: AclAction.DELETE, subject: AclSubject.CATALOG }])
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.catalogService.remove(id);
  }

  @Post('import')
  @Auth([{ action: AclAction.CREATE, subject: AclSubject.CATALOG }])
  async import(
    @Body() body: { ptId: string },
    @Req() req: Request,
  ): Promise<{ importedCount: number; errors: string[] }> {
    const user = (req as any).user;
    const createdBy = user?.uuid ?? null;
    return this.catalogService.importFromFile(body.ptId, (req as any).file, createdBy);
  }
}
