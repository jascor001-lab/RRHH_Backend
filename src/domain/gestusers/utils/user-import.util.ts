import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

export type ImportedUserRow = {
  dni: string;
  nombre: string;
  id_reg?: string;
  sexo?: string;
  fecha_nac?: string;
  cargo_contrato?: string;
  rol: 'admin' | 'user';
};

function normalizeHeader(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, '_')
    .trim();
}

function pick(row: Record<string, unknown>, keys: string[]) {
  const normalized = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      normalizeHeader(String(key)),
      value,
    ]),
  );

  for (const key of keys) {
    const value = normalized[normalizeHeader(key)];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }

  return undefined;
}

function normalizeDni(value: unknown) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  return digits.padStart(8, '0').slice(-8);
}

function normalizeSexo(value: unknown) {
  const raw = String(value ?? '').trim().toUpperCase();
  if (!raw) {
    return undefined;
  }
  if (raw.startsWith('M')) {
    return 'Masculino';
  }
  if (raw.startsWith('F')) {
    return 'Femenino';
  }
  return String(value).trim();
}

function normalizeRol(value: unknown): 'admin' | 'user' {
  const raw = String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  if (raw.includes('admin')) {
    return 'admin';
  }

  return 'user';
}

function excelSerialToDate(serial: number) {
  const utcDays = Math.floor(serial - 25569);
  const date = new Date(utcDays * 86400 * 1000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeFecha(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return excelSerialToDate(value);
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const match = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (!match) {
    return undefined;
  }

  let month = Number(match[1]);
  let day = Number(match[2]);
  let year = Number(match[3]);

  // Excel US style M/D/YY (e.g. 5/12/72)
  if (year < 100) {
    year += year >= 70 ? 1900 : 2000;
  }

  if (month > 12 && day <= 12) {
    const temp = month;
    month = day;
    day = temp;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return undefined;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseUsersWorkbook(buffer: Buffer): ImportedUserRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const preferred =
    workbook.SheetNames.find((name) => name.toLowerCase() === 'alta') ||
    workbook.SheetNames[0];

  if (!preferred) {
    return [];
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    workbook.Sheets[preferred],
    { defval: '', raw: true },
  );

  const parsed: ImportedUserRow[] = [];

  for (const row of rows) {
    const dni = normalizeDni(pick(row, ['DNI', 'DOCUMENTO', 'NRO_DNI']));
    const nombre = String(
      pick(row, [
        'NOMBRE_COMPLETO',
        'NOMBRE',
        'APELLIDOS_Y_NOMBRES',
        'NOMBRES',
      ]) ?? '',
    )
      .replace(/\s+/g, ' ')
      .trim();

    if (!dni || !nombre) {
      continue;
    }

    parsed.push({
      dni,
      nombre,
      id_reg: String(
        pick(row, ['REGIMEN', 'ID_REG', 'REGIMEN_LABORAL']) ?? '',
      ).trim() || undefined,
      sexo: normalizeSexo(pick(row, ['SEXO', 'GENERO'])),
      fecha_nac: normalizeFecha(
        pick(row, ['FECHA_NAC', 'FECHA_NACIMIENTO', 'FEC_NAC']),
      ),
      cargo_contrato: String(
        pick(row, ['CARGO_CONTRATO', 'CARGO', 'PUESTO']) ?? '',
      ).trim() || undefined,
      rol: normalizeRol(
        pick(row, ['CATEGORIA', 'CATEGORÍA', 'ROL', 'TIPO']),
      ),
    });
  }

  return parsed;
}

export async function hashPasswordFromDni(dni: string) {
  return bcrypt.hash(dni, 10);
}

export function newUserId() {
  return uuidv4();
}
