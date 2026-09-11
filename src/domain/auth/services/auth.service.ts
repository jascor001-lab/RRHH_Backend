import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

import { UsersService } from '../../gestusers/services/gestusers.service';

@Injectable()
export class AuthService {

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) { }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByDni(dto.dni.trim());

    if (!user) {
      throw new UnauthorizedException(
        'Usuario no encontrado',
      );
    }

    const passwordCorrect = await this.verifyPassword(
      user.password,
      dto.password,
      user.dni,
    );

    if (!passwordCorrect) {
      throw new UnauthorizedException(
        'Credenciales incorrectas',
      );
    }

    if (user.cuenta_activa === false) {
      throw new UnauthorizedException(
        'La cuenta está inactiva. Contacta al administrador.',
      );
    }

    const payload = {
      id: user.id,
      dni: user.dni,
      email: user.email,
      rol: user.rol || 'user',
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    await this.usersService.updateRefreshToken(
      user.id,
      refreshToken,
    );

    return {
      accessToken,
      refreshToken,
      user: this.toPublicUser(user),
    };
  }

  async register(dto: RegisterDto) {
    await this.usersService.create({
      ...dto,
      password: dto.password,
    });

    return {
      message: 'Registro exitoso',
    };
  }

  async refresh(dto: RefreshDto) {

    // Verificar que el JWT sea válido
    const payload = this.jwtService.verify(dto.refreshToken);

    // Buscar el usuario
    const user = await this.usersService.findById(payload.id);

    if (!user) {
      throw new UnauthorizedException(
        'Usuario no encontrado',
      );
    }

    // Comparar con el token almacenado
    if (user.refresh_token !== dto.refreshToken) {
      throw new UnauthorizedException(
        'Refresh token inválido',
      );
    }

    // Generar un nuevo access token
    const accessToken = this.jwtService.sign(
      {
        id: user.id,
        dni: user.dni,
        email: user.email,
        rol: user.rol || 'user',
      },
      {
        expiresIn: '15m',
      },
    );

    return {
      accessToken,
    };
  }

  async logout(userId: string) {

    await this.usersService.updateRefreshToken(
      userId,
      null,
    );

    return {
      message: 'Logout exitoso',
    };

  }

  async profile(user: any) {
    const dbUser = await this.usersService.findById(user.id);

    if (!dbUser) {
      throw new UnauthorizedException(
        'Usuario no encontrado',
      );
    }

    return this.toPublicUser(dbUser);
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException(
        'Usuario no encontrado',
      );
    }

    const currentValid = await this.verifyPassword(
      user.password,
      dto.currentPassword,
      user.dni,
    );

    if (!currentValid) {
      throw new UnauthorizedException(
        'La contraseña actual no es correcta',
      );
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la actual',
      );
    }

    await this.usersService.updatePassword(
      userId,
      dto.newPassword,
    );

    await this.usersService.updateRefreshToken(userId, null);

    return {
      message: 'Contraseña actualizada correctamente',
    };
  }

  private toPublicUser(user: {
    id: string;
    dni?: string;
    nombre?: string;
    email?: string;
    cargo_contrato?: string;
    id_reg?: string;
    sexo?: string;
    fecha_nac?: string;
    rol?: string;
  }) {
    return {
      id: user.id,
      dni: user.dni,
      nombre: user.nombre,
      email: user.email,
      cargo_contrato: user.cargo_contrato,
      id_reg: user.id_reg,
      sexo: user.sexo,
      fecha_nac: user.fecha_nac,
      rol: user.rol || 'user',
    };
  }

  private async verifyPassword(
    storedPassword: string | undefined,
    password: string,
    dni?: string,
  ) {
    if (!storedPassword) {
      return Boolean(dni && password === dni);
    }

    if (
      storedPassword.startsWith('$2a$') ||
      storedPassword.startsWith('$2b$') ||
      storedPassword.startsWith('$2y$')
    ) {
      return bcrypt.compare(password, storedPassword);
    }

    return password === storedPassword;
  }

}