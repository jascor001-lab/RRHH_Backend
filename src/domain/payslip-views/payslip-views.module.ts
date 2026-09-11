import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { PayslipViewEntity } from './entities/payslip-view.entity';
import { PayslipViewsService } from './services/payslip-views.service';
import { PayslipViewsController } from './controllers/payslip-views.controller';
import { GestUsersModule } from '../gestusers/gestusers.module';

@Module({
  imports: [
    PassportModule,
    GestUsersModule,
    TypeOrmModule.forFeature([PayslipViewEntity]),
  ],
  controllers: [PayslipViewsController],
  providers: [PayslipViewsService],
})
export class PayslipViewsModule {}
