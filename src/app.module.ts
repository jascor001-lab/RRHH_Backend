import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { typeOrmConfig } from './config/typeorm.config';

import { GestUsersModule } from './domain/gestusers/gestusers.module';
import { AuthModule } from './domain/auth/auth.module';
import { PayslipViewsModule } from './domain/payslip-views/payslip-views.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => typeOrmConfig(config),
    }),

    AuthModule,
    GestUsersModule,
    PayslipViewsModule,
  ],
})

/*
export class AppModule {
  constructor() {
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
  }
}
*/

export class AppModule {
}