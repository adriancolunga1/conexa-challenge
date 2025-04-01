import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Roles } from '../guards';

@Entity()
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: Roles })
  @ApiProperty()
  role: Roles;
}
