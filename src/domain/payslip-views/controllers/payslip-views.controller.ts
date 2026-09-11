import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PayslipViewsService } from '../services/payslip-views.service';
import { LogPayslipViewDto } from '../dto/log-payslip-view.dto';
import { AdminGuard } from '../../gestusers/guards/admin.guard';

@Controller('payslip-views')
export class PayslipViewsController {
  constructor(
    private readonly payslipViewsService: PayslipViewsService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  logView(@Request() req, @Body() dto: LogPayslipViewDto) {
    return this.payslipViewsService.logView(req.user.id, dto);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get('report')
  getReport(
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('dni') dni?: string,
    @Query('search') search?: string,
  ) {
    return this.payslipViewsService.getReport({
      year,
      month,
      dni,
      search,
    });
  }
}
