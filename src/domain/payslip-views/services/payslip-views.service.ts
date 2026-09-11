import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { PayslipViewEntity } from '../entities/payslip-view.entity';
import { LogPayslipViewDto } from '../dto/log-payslip-view.dto';
import { UsersService } from '../../gestusers/services/gestusers.service';

@Injectable()
export class PayslipViewsService {
  constructor(
    @InjectRepository(PayslipViewEntity)
    private readonly viewsRepository: Repository<PayslipViewEntity>,
    private readonly usersService: UsersService,
  ) {}

  async logView(
    userId: string,
    dto: LogPayslipViewDto,
  ) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const parts = dto.objectKey.split('/');
    const year = parts[2] || '';
    const month = parts[3] || '';

    if (!year || !month) {
      throw new BadRequestException(
        'La clave del archivo no tiene un periodo válido',
      );
    }

    const entry = this.viewsRepository.create({
      userId: user.id,
      dni: user.dni || '',
      nombre: user.nombre,
      objectKey: dto.objectKey,
      year,
      month,
      action: dto.action,
    });

    await this.viewsRepository.save(entry);

    return {
      success: true,
      id: entry.id,
      viewedAt: entry.viewedAt,
    };
  }

  async getReport(filters: {
    year?: string;
    month?: string;
    dni?: string;
    search?: string;
  }) {
    const qb = this.viewsRepository
      .createQueryBuilder('view')
      .orderBy('view.viewed_at', 'DESC');

    if (filters.year) {
      qb.andWhere('view.year = :year', { year: filters.year });
    }

    if (filters.month) {
      qb.andWhere('view.month = :month', { month: filters.month });
    }

    if (filters.dni) {
      qb.andWhere('view.dni = :dni', { dni: filters.dni });
    }

    if (filters.search) {
      const term = `%${filters.search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(view.nombre) LIKE :term OR view.dni LIKE :term)',
        { term },
      );
    }

    const rows = await qb.getMany();

    const summaryMap = new Map<
      string,
      {
        dni: string;
        nombre?: string;
        year: string;
        month: string;
        firstViewAt?: Date;
        lastViewAt?: Date;
        viewCount: number;
        downloadCount: number;
      }
    >();

    for (const row of rows) {
      const key = `${row.dni}-${row.year}-${row.month}`;
      const current = summaryMap.get(key) || {
        dni: row.dni,
        nombre: row.nombre,
        year: row.year,
        month: row.month,
        viewCount: 0,
        downloadCount: 0,
      };

      if (!current.firstViewAt || row.viewedAt < current.firstViewAt) {
        current.firstViewAt = row.viewedAt;
      }

      if (!current.lastViewAt || row.viewedAt > current.lastViewAt) {
        current.lastViewAt = row.viewedAt;
      }

      if (row.action === 'download') {
        current.downloadCount += 1;
      } else {
        current.viewCount += 1;
      }

      summaryMap.set(key, current);
    }

    return {
      totalEvents: rows.length,
      summary: Array.from(summaryMap.values()).sort((a, b) => {
        const periodDiff =
          `${b.year}${b.month}`.localeCompare(`${a.year}${a.month}`);
        if (periodDiff !== 0) {
          return periodDiff;
        }
        return (a.nombre || '').localeCompare(b.nombre || '', 'es');
      }),
      events: rows.map((row) => ({
        id: row.id,
        dni: row.dni,
        nombre: row.nombre,
        year: row.year,
        month: row.month,
        action: row.action,
        objectKey: row.objectKey,
        viewedAt: row.viewedAt,
      })),
    };
  }
}
