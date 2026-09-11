import {
  IsIn,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class LogPayslipViewDto {
  @IsString()
  @IsNotEmpty()
  objectKey!: string;

  @IsString()
  @IsIn(['view', 'download'])
  action!: 'view' | 'download';
}
