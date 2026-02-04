import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';

import { Auth } from '../../decorators';
import { DashboardService } from './dashboard.service';
import { DashboardKpisDto } from './dto/kpis.dto';
import { SpkByStatusDto } from './dto/spk-by-status.dto';
import { MutationTrendsDto } from './dto/mutation-trends.dto';

@Controller({ path: 'dashboard', version: '1' })
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @Auth([])
  async getKpis(@Req() req: Request): Promise<DashboardKpisDto> {
    const user = (req as any).user;
    const ptId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.dashboardService.getKpis(ptId);
  }

  @Get('charts/spk-by-status')
  @Auth([])
  async getSpkByStatus(@Req() req: Request): Promise<SpkByStatusDto[]> {
    const user = (req as any).user;
    const ptId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    return this.dashboardService.getSpkByStatus(ptId);
  }

  @Get('charts/mutation-trends')
  @Auth([])
  async getMutationTrends(
    @Query('storeId') storeId?: string,
    @Query('days') days?: string,
    @Req() req?: Request,
  ): Promise<MutationTrendsDto[]> {
    const user = (req as any)?.user;
    const ptId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.dashboardService.getMutationTrends(ptId, storeId, daysNum);
  }
}
