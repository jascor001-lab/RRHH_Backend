import {
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {

  constructor(

    @InjectRepository(User)
    private readonly repository: Repository<User>,

  ) {}

  async findByEmail(email: string) {

    return this.repository.findOne({
      where: {
        email,
      },
    });

  }

  async create(data: Partial<User>) {

    const user = this.repository.create(data);

    return this.repository.save(user);

  }

  async findById(id: string) {

    return this.repository.findOne({
      where: {
        id,
      },
    });

  }

  async updateRefreshToken(
  id: string,
  refreshToken: string | null,
): Promise<void> {

  await this.repository.update(
    { id },
    {
      refresh_token: refreshToken,
    },
  );

}
  

}