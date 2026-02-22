import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';

import { Auth, RequestCompanyId } from '../../decorators';
import { DashboardService } from './dashboard.service';
import { DashboardKpisDto } from './dto/kpis.dto';
import { SpkByStatusDto } from './dto/spk-by-status.dto';
import { MutationTrendsDto } from './dto/mutation-trends.dto';

@Controller({ path: 'dashboard', version: '1' })
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @Auth([])
  async getKpis(
    @RequestCompanyId() targetCompanyId: string | undefined,
    @Query('companyId') companyId?: string,
    @Query('branchId') branchId?: string,
  ): Promise<DashboardKpisDto> {
    const ptId = targetCompanyId || companyId;
    return this.dashboardService.getKpis(ptId, branchId);
  }

  @Get('charts/spk-by-status')
  @Auth([])
  async getSpkByStatus(
    @RequestCompanyId() targetCompanyId: string | undefined,
    @Query('companyId') companyId?: string,
    @Query('branchId') branchId?: string,
  ): Promise<SpkByStatusDto[]> {
    const ptId = targetCompanyId || companyId;
    return this.dashboardService.getSpkByStatus(ptId, branchId);
  }

  @Get('charts/mutation-trends')
  @Auth([])
  async getMutationTrends(
    @RequestCompanyId() targetCompanyId: string | undefined,
    @Query('companyId') companyId?: string,
    @Query('branchId') branchId?: string,
    @Query('days') days?: string,
    @Query('date') date?: string,
  ): Promise<MutationTrendsDto[]> {
    const ptId = targetCompanyId || companyId;
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.dashboardService.getMutationTrends(ptId, branchId, daysNum, date);
  }
}
