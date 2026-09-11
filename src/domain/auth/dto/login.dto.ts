import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(8)
  dni!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}