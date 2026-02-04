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
import { PawnTermService } from './pawn-term.service';
import { PawnTermDto } from './dto/pawn-term.dto';
import { CreatePawnTermDto } from './dto/create-pawn-term.dto';
import { UpdatePawnTermDto } from './dto/update-pawn-term.dto';
import { QueryPawnTermDto } from './dto/query-pawn-term.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Controller({ path: 'pawn-terms', version: '1' })
export class PawnTermController {
  constructor(private readonly pawnTermService: PawnTermService) {}

  @Get()
  @Auth([])
  async findAll(
    @Query() queryDto: QueryPawnTermDto,
    @Req() req: Request,
  ): Promise<{ data: PawnTermDto[]; meta: PageMetaDto }> {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.pawnTermService.findAll(queryDto, userPtId);
  }

  @Get(':id')
  @Auth([])
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PawnTermDto> {
    return this.pawnTermService.findOne(id);
  }

  @Post()
  @Auth([])
  async create(
    @Body() createDto: CreatePawnTermDto,
    @Req() req: Request,
  ): Promise<PawnTermDto> {
    const user = (req as any).user;
    const createdBy = user?.uuid ?? null;
    return this.pawnTermService.create(createDto, createdBy);
  }

  @Put(':id')
  @Auth([])
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePawnTermDto,
  ): Promise<PawnTermDto> {
    return this.pawnTermService.update(id, updateDto);
  }

  @Delete(':id')
  @Auth([])
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.pawnTermService.remove(id);
  }
}
