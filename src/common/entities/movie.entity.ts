import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['title'])
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  title: string;

  @Column()
  @ApiProperty()
  episode_id: number;

  @Column()
  @ApiProperty()
  opening_crawl: string;

  @Column()
  @ApiProperty()
  director: string;

  @Column()
  @ApiProperty()
  producer: string;

  @Column()
  @ApiProperty()
  release_date: string;
}
