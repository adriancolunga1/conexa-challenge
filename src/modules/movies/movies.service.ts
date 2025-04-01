import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { CreateMovieDto } from './dtos/create-movie.dto';
import { UpdateMovieDto } from './dtos/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from '../../common/entities';
import { Repository } from 'typeorm';
import { log } from 'console';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MoviesService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async onApplicationBootstrap() {
    await this.syncronize();
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async syncronize(): Promise<Movie[]> {
    const movies: Movie[] = [];
    const list = await (
      await fetch('https://swapi.dev/api/films', {
        method: 'GET',
      })
    ).json();

    const { results } = list;
    await Promise.all(
      results.map(async (movie) => {
        try {
          const theMovie = await this.movieRepository.save({
            title: movie.title,
            episode_id: movie.episode_id,
            opening_crawl: movie.opening_crawl,
            director: movie.director,
            producer: movie.producer,
            release_date: movie.release_date,
          });
          movies.push(theMovie);
        } catch (error) {
          if (error.code === '23505') return;
          else throw new InternalServerErrorException(error);
        }
      }),
    );

    return movies;
  }

  async findAll(): Promise<Movie[]> {
    return await this.movieRepository.find({
      order: { episode_id: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Movie> {
    const movie = await this.movieRepository.findOneBy({ id });
    if (!movie) throw new NotFoundException('Movie not found');

    return movie;
  }

  async create(dto: CreateMovieDto): Promise<Movie> {
    let movie: Movie;
    try {
      movie = await this.movieRepository.save(dto);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Movie already exists');
      } else throw new InternalServerErrorException(error);
    }

    return movie;
  }

  async update(id: string, dto: UpdateMovieDto): Promise<Movie> {
    await this.movieRepository.update(id, dto);
    return await this.movieRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<string> {
    const movie = await this.movieRepository.delete(id);
    if (movie.affected === 0) throw new NotFoundException('Movie not found');
    else return 'Done';
  }
}
