import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

import { UserEntity } from '../entities/gestusers.entity';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  hashPasswordFromDni,
  newUserId,
  parseUsersWorkbook,
} from '../utils/user-import.util';

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
      select: [
        'id',
        'dni',
        'nombre',
        'id_reg',
        'sexo',
        'fecha_nac',
        'cargo_contrato',
        'email',
        'rol',
        'cuenta_activa',
      ],
    });

  }

  /**
   * CREATE USER
   */
  async create(
    createUserDto: CreateUserDto,
  ): Promise<UserEntity> {
    const dni = createUserDto.dni?.trim();

    if (!dni) {
      throw new BadRequestException('El DNI es obligatorio');
    }

    const existing = await this.findByDni(dni);

    if (existing) {
      throw new ConflictException(
        'Ya existe un usuario con ese DNI',
      );
    }

    const rawPassword = createUserDto.password || dni;
    const password = rawPassword.startsWith('$2')
      ? rawPassword
      : await bcrypt.hash(rawPassword, 10);

    const newUser = this.usersRepository.create({
      id: uuidv4(),
      ...createUserDto,
      dni,
      fecha_nac: createUserDto.fecha_nac || undefined,
      rol: createUserDto.rol === 'admin' ? 'admin' : 'user',
      cuenta_activa: createUserDto.cuenta_activa !== false,
      password,
    });

    return await this.usersRepository.save(newUser);
  }

  async update(
    id: string,
    dto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (dto.dni !== undefined) {
      const dni = dto.dni.trim();

      if (!dni) {
        throw new BadRequestException('El DNI es obligatorio');
      }

      const existing = await this.findByDni(dni);

      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Ya existe un usuario con ese DNI',
        );
      }

      user.dni = dni;
    }

    if (dto.nombre !== undefined) {
      user.nombre = dto.nombre.trim();
    }

    if (dto.id_reg !== undefined) {
      user.id_reg = dto.id_reg;
    }

    if (dto.sexo !== undefined) {
      user.sexo = dto.sexo;
    }

    if (dto.fecha_nac !== undefined) {
      user.fecha_nac = dto.fecha_nac || undefined;
    }

    if (dto.cargo_contrato !== undefined) {
      user.cargo_contrato = dto.cargo_contrato.trim();
    }

    if (dto.rol !== undefined) {
      const nextRole = dto.rol === 'admin' ? 'admin' : 'user';

      if (user.rol === 'admin' && nextRole === 'user') {
        const admins = await this.usersRepository.count({
          where: { rol: 'admin' },
        });

        if (admins <= 1) {
          throw new BadRequestException(
            'Debe quedar al menos un administrador en el sistema',
          );
        }
      }

      user.rol = nextRole;
    }

    if (dto.cuenta_activa !== undefined) {
      user.cuenta_activa = dto.cuenta_activa;
    }

    return this.usersRepository.save(user);
  }

  async importFromExcel(fileBuffer: Buffer) {
    const rows = parseUsersWorkbook(fileBuffer);

    if (rows.length === 0) {
      throw new BadRequestException(
        'No se encontraron usuarios válidos en el Excel (se espera hoja Alta con DNI y NOMBRE_COMPLETO)',
      );
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        const existing = await this.findByDni(row.dni);

        if (existing) {
          existing.nombre = row.nombre;
          existing.id_reg = row.id_reg;
          existing.sexo = row.sexo;
          existing.fecha_nac = row.fecha_nac;
          existing.cargo_contrato = row.cargo_contrato;
          existing.rol = row.rol;
          existing.cuenta_activa = true;
          await this.usersRepository.save(existing);
          updated += 1;
          continue;
        }

        const password = await hashPasswordFromDni(row.dni);
        const newUser = this.usersRepository.create({
          id: newUserId(),
          dni: row.dni,
          nombre: row.nombre,
          id_reg: row.id_reg,
          sexo: row.sexo,
          fecha_nac: row.fecha_nac,
          cargo_contrato: row.cargo_contrato,
          rol: row.rol,
          cuenta_activa: true,
          password,
        });

        await this.usersRepository.save(newUser);
        created += 1;
      } catch (error) {
        skipped += 1;
        const message =
          error instanceof Error ? error.message : 'Error desconocido';
        errors.push(`${row.dni}: ${message}`);
      }
    }

    return {
      total: rows.length,
      created,
      updated,
      skipped,
      errors: errors.slice(0, 20),
    };
  }

  async updateRole(
    id: string,
    rol: 'admin' | 'user',
  ): Promise<UserEntity> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const nextRole = rol === 'admin' ? 'admin' : 'user';

    if (user.rol === 'admin' && nextRole === 'user') {
      const admins = await this.usersRepository.count({
        where: { rol: 'admin' },
      });

      if (admins <= 1) {
        throw new BadRequestException(
          'Debe quedar al menos un administrador en el sistema',
        );
      }
    }

    user.rol = nextRole;
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  async findByDni(dni: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: {
        dni,
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

  async updatePassword(
    id: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const password = await bcrypt.hash(newPassword, 10);

    await this.usersRepository.update(
      { id },
      {
        password,
        refresh_token: null,
      },
    );
  }

}