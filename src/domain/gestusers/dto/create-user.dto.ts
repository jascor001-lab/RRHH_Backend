import {
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {

  @IsString()
  dni!: string;

  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  id_reg?: string;

  @IsOptional()
  @IsString()
  sexo?: string;

  @IsOptional()
  fecha_nac?: string;

  @IsOptional()
  @IsString()
  cargo_contrato?: string;

  @IsOptional()
  @IsString()
  password?: string;
}