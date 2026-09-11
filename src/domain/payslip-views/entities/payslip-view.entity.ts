import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({
  name: 'payslip_views',
  schema: 'recursoshumanos',
})
export class PayslipViewEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId!: string;

  @Column({ name: 'dni', type: 'varchar' })
  dni!: string;

  @Column({ name: 'nombre', type: 'varchar', nullable: true })
  nombre?: string;

  @Column({ name: 'object_key', type: 'varchar' })
  objectKey!: string;

  @Column({ name: 'year', type: 'varchar' })
  year!: string;

  @Column({ name: 'month', type: 'varchar' })
  month!: string;

  @Column({ name: 'action', type: 'varchar' })
  action!: 'view' | 'download';

  @CreateDateColumn({ name: 'viewed_at', type: 'timestamptz' })
  viewedAt!: Date;
}
