import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';

import { UsersService } from '../services/gestusers.service';

import { UserEntity } from '../entities/gestusers.entity';

import { CreateUserDto } from '../dto/create-user.dto';

@Controller('users')
export class UsersController {

  constructor(
    private readonly usersService: UsersService,
  ) {}

  /**
   * GET ALL
   */
  @Get()
  async findAll(): Promise<UserEntity[]> {

    return await this.usersService.findAll();

  }

  /**
   * CREATE
   */
  @Post()
  async create(

    @Body()
    createUserDto: CreateUserDto,

  ): Promise<UserEntity> {

    return await this.usersService.create(
      createUserDto,
    );

  }

}