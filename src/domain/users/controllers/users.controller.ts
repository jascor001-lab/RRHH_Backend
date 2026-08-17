import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {

  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get(':id')
  async findById(
    @Param('id') id: string,
  ) {
    return this.usersService.findById(String(id));
  }

}