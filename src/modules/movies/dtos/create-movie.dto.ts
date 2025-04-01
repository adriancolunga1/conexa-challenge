import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @ApiProperty({ example: 'A New Hope' })
  title: string;

  @IsInt()
  @ApiProperty({ example: 4 })
  episode_id: number;

  @IsString()
  @ApiProperty({ example: 'It is a period of civil war...' })
  opening_crawl: string;

  @IsString()
  @ApiProperty({ example: 'George Lucas' })
  director: string;

  @IsString()
  @ApiProperty({ example: 'Gary Kurtz, Rick McCallum' })
  producer: string;

  @IsString()
  @ApiProperty({ example: '1977-05-25' })
  release_date: string;
}
