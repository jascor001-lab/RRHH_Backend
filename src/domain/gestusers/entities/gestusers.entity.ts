import {
  Entity,
  Column,
  PrimaryColumn,
} from 'typeorm';

@Entity({
  name: 'users',
  schema: 'recursoshumanos',
})
export class UserEntity {

  @PrimaryColumn({
    name: 'id',
    type: 'varchar',
  })
  id!: string;

  @Column({
    name: 'dni',
    type: 'varchar',
    nullable: true,
  })
  dni?: string;

  @Column({
    name: 'nombre',
    type: 'varchar',
    nullable: true,
  })
  nombre?: string;

  @Column({
    name: 'id_reg',
    type: 'varchar',
    nullable: true,
  })
  id_reg?: string;

  @Column({
    name: 'sexo',
    type: 'varchar',
    nullable: true,
  })
  sexo?: string;

  @Column({
    name: 'fecha_nac',
    type: 'date',
    nullable: true,
  })
  fecha_nac?: string;

  @Column({
    name: 'cargo_contrato',
    type: 'varchar',
    nullable: true,
  })
  cargo_contrato?: string;

  @Column({
    name: 'password',
    type: 'varchar',
    nullable: true,
  })
  password?: string;

  @Column({
    name: 'email',
    type: 'varchar',
    nullable: true,
  })
  email?: string;
  
  @Column({
  name: 'refresh_token',
  type: 'varchar',
  nullable: true,
})
refresh_token!: string | null;

  @Column({
    name: 'rol',
    type: 'varchar',
    nullable: true,
    default: 'user',
  })
  rol?: string;

  @Column({
    name: 'cuenta_activa',
    type: 'boolean',
    nullable: true,
    default: true,
  })
  cuenta_activa?: boolean;

}