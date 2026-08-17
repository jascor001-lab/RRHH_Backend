import {
  Entity,
  PrimaryColumn,
  Column,
} from 'typeorm';

@Entity('users')
export class User {

  @PrimaryColumn()
  id!: string;

  @Column({
    length: 100,
  })
  name!: string;

  @Column({
    unique: true,
  })
  email!: string;

  @Column()
  password!: string;
@Column({
  name: 'refresh_token',
  type: 'varchar',
  nullable: true,
})
refresh_token!: string | null;

}