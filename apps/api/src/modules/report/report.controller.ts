import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  DefaultValuePipe,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { Auth } from '../../decorators';
import { AclAction, AclSubject } from '../../constants/acl';
import { ReportService } from './report.service';
import { QueryReportDto } from './dto/query-report.dto';

@Controller({ path: 'reports', version: '1' })
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('mutation-by-branch')
  @Auth([{ action: AclAction.READ, subject: AclSubject.REPORT }])
  async getMutationByBranch(
    @Query() queryDto: QueryReportDto,
    @Query('format', new DefaultValuePipe('json')) format: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    const result = await this.reportService.getMutationByBranch(queryDto, userPtId);
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="mutation-by-branch.csv"');
      return this.reportService.toCsv(result.data as unknown as Record<string, unknown>[]);
    }
    return result;
  }

  @Get('mutation-by-pt')
  @Auth([{ action: AclAction.READ, subject: AclSubject.REPORT }])
  async getMutationByPt(
    @Query() queryDto: QueryReportDto,
    @Query('format', new DefaultValuePipe('json')) format: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    const result = await this.reportService.getMutationByPt(queryDto, userPtId);
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="mutation-by-pt.csv"');
      return this.reportService.toCsv(result.data as unknown as Record<string, unknown>[]);
    }
    return result;
  }

  @Get('spk')
  @Auth([{ action: AclAction.READ, subject: AclSubject.REPORT }])
  async getSpkReport(
    @Query() queryDto: QueryReportDto,
    @Query('format', new DefaultValuePipe('json')) format: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    const spkQuery = {
      ...queryDto,
      ptId: queryDto.ptId,
      branchId: queryDto.storeId,
      dateFrom: queryDto.dateFrom,
      dateTo: queryDto.dateTo,
    } as any;
    const result = await this.reportService.getSpkReport(spkQuery, userPtId);
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="spk-report.csv"');
      return this.reportService.toCsv(result.data as unknown as Record<string, unknown>[]);
    }
    return result;
  }

  @Get('nkb-payments')
  @Auth([{ action: AclAction.READ, subject: AclSubject.REPORT }])
  async getNkbPaymentsReport(
    @Query() queryDto: QueryReportDto,
    @Query('format', new DefaultValuePipe('json')) format: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    const nkbQuery = {
      ...queryDto,
      ptId: queryDto.ptId,
      branchId: queryDto.storeId,
    } as any;
    const result = await this.reportService.getNkbPaymentsReport(nkbQuery, userPtId);
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="nkb-payments.csv"');
      return this.reportService.toCsv(result.data as unknown as Record<string, unknown>[]);
    }
    return result;
  }

  @Get('stock-opname')
  @Auth([{ action: AclAction.READ, subject: AclSubject.REPORT }])
  async getStockOpnameReport(
    @Query() queryDto: QueryReportDto,
    @Query('format', new DefaultValuePipe('json')) format: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = (req as any).user;
    const userPtId = user?.companyId ?? user?.ownedCompanyId ?? undefined;
    const soQuery = {
      ...queryDto,
      ptId: queryDto.ptId,
      storeId: queryDto.storeId,
    } as any;
    const result = await this.reportService.getStockOpnameReport(soQuery, userPtId);
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="stock-opname-report.csv"');
      return this.reportService.toCsv(result.data as unknown as Record<string, unknown>[]);
    }
    return result;
  }
}
