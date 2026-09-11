import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  dni?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  id_reg?: string;

  @IsOptional()
  @IsString()
  sexo?: string;

  @IsOptional()
  fecha_nac?: string | null;

  @IsOptional()
  @IsString()
  cargo_contrato?: string;

  @IsOptional()
  @IsString()
  @IsIn(['admin', 'user'])
  rol?: 'admin' | 'user';

  @IsOptional()
  @IsBoolean()
  cuenta_activa?: boolean;
}
