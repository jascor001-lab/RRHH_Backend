import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshDto } from '../dto/refresh.dto';

import { UsersService } from '../../gestusers/services/gestusers.service';

@Injectable()
export class AuthService {

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) { }

  async login(dto: LoginDto) {

    // Buscar usuario en la base de datos
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException(
        'Usuario no encontrado',
      );
    }

    const passwordCorrect = await bcrypt.compare(
      dto.password,
      user.password!,
    );

    if (!passwordCorrect) {
      throw new UnauthorizedException(
        'Credenciales incorrectas',
      );
    }

    const payload = {
      id: user.id,
      dni: user.dni,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    // Guardar el refresh token en la base de datos
    await this.usersService.updateRefreshToken(
      user.id,
      refreshToken,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async register(dto: RegisterDto) {

    const hashedPassword = await bcrypt.hash(
      dto.password,
      10,
    );

    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    });

    return {
      message: 'Registro exitoso'
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
        email: user.email,
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

    return user;

  }

}