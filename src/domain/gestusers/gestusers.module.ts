import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './controllers/gestusers.controller';
import { UsersService } from './services/gestusers.service';
import { UserEntity } from './entities/gestusers.entity';
import { AdminGuard } from './guards/admin.guard';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([
      UserEntity,
    ]),
  ],
  controllers: [
    UsersController,
  ],
  providers: [
    UsersService,
    AdminGuard,
  ],
  exports: [
    UsersService,
    AdminGuard,
  ],
})
export class GestUsersModule {}
