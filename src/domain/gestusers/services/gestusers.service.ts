import {
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

import { UserEntity } from '../entities/gestusers.entity';

import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {

  constructor(

    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,

  ) {}

  /**
   * GET ALL USERS
   */
  async findAll(): Promise<UserEntity[]> {

    return await this.usersRepository.find({

      order: {
        nombre: 'ASC',
      },

    });

  }

  /**
   * CREATE USER
   */
  async create(
    createUserDto: CreateUserDto,
  ): Promise<UserEntity> {

    const newUser =
      this.usersRepository.create({

        id: uuidv4(),

        ...createUserDto,

      });

    return await this.usersRepository.save(
      newUser,
    );

  }

  async findByEmail(email: string): Promise<UserEntity | null> {

  return this.usersRepository.findOne({
    where: {
      email,
    },
  });

  }

  async findById(id: string): Promise<UserEntity | null> {

  return this.usersRepository.findOne({
    where: { id },
  });

}

async updateRefreshToken(
  id: string,
  refreshToken: string | null,
): Promise<void> {

  await this.usersRepository.update(
    { id },
    {
      refresh_token: refreshToken,
    },
  );

}

}