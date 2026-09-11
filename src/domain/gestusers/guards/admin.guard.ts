import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { UsersService } from '../services/gestusers.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authUser = request.user;

    if (!authUser?.id) {
      throw new ForbiddenException('No autorizado');
    }

    const user = await this.usersService.findById(authUser.id);

    if (!user || user.rol !== 'admin') {
      throw new ForbiddenException(
        'Solo el administrador puede gestionar usuarios',
      );
    }

    return true;
  }
}
