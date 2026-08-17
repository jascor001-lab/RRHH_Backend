import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class RegisterDto {

  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(8)
  dni!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  nombre!: string;

  @IsOptional()
  @IsString()
  id_reg?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1)
  sexo?: string;

  @IsOptional()
  @IsDateString()
  fecha_nac?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  cargo_contrato?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  password!: string;

}