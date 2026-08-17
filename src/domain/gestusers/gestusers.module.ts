import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './controllers/gestusers.controller';

import { UsersService } from './services/gestusers.service';

import { UserEntity } from './entities/gestusers.entity';

@Module({

  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
    ]),
  ],

  controllers: [
    UsersController,
  ],

  providers: [
    UsersService,
  ],

   exports: [
    UsersService,
  ],

})
export class GestUsersModule {}