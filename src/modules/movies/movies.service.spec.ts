import {
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from '../../common/entities';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        results: [
          {
            title: 'A New Hope',
            episode_id: 4,
            opening_crawl: 'It is a period of civil war...',
            director: 'George Lucas',
            producer: 'Gary Kurtz, Rick McCallum',
            release_date: '1977-05-25',
          },
        ],
      }),
  }),
) as jest.Mock;

describe('MoviesService', () => {
  let moviesService: MoviesService;
  let movieRepository: Repository<Movie>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useClass: Repository,
        },
      ],
    }).compile();

    moviesService = module.get<MoviesService>(MoviesService);
    movieRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  describe('onApplicationBootstrap', () => {
    it('debe llamar a syncronize al iniciar', async () => {
      jest.spyOn(moviesService, 'syncronize').mockResolvedValue([]);
      await moviesService.onApplicationBootstrap();
      expect(moviesService.syncronize).toHaveBeenCalled();
    });
  });

  describe('syncronize', () => {
    it('debe sincronizar las películas correctamente', async () => {
      jest.spyOn(movieRepository, 'save').mockResolvedValue({
        title: 'A New Hope',
        episode_id: 4,
      } as Movie);

      const result = await moviesService.syncronize();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('A New Hope');
      expect(movieRepository.save).toHaveBeenCalled();
    });

    it('debe ignorar errores de duplicidad (código 23505)', async () => {
      jest.spyOn(movieRepository, 'save').mockRejectedValue({ code: '23505' });

      const result = await moviesService.syncronize();

      expect(result).toHaveLength(0);
    });

    it('debe lanzar una excepción en otros errores', async () => {
      const error = new Error('Database error');
      jest.spyOn(movieRepository, 'save').mockRejectedValue(error);

      await expect(moviesService.syncronize()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('debe retornar todas las películas ordenadas por episode_id', async () => {
      const movies: Movie[] = [{ title: 'A New Hope', episode_id: 4 } as Movie];
      jest.spyOn(movieRepository, 'find').mockResolvedValue(movies);

      const result = await moviesService.findAll();

      expect(result).toEqual(movies);
      expect(movieRepository.find).toHaveBeenCalledWith({
        order: { episode_id: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('debe retornar la película si existe', async () => {
      const movie: Movie = { id: '1', title: 'A New Hope' } as Movie;
      jest.spyOn(movieRepository, 'findOneBy').mockResolvedValue(movie);

      const result = await moviesService.findOne('1');

      expect(result).toEqual(movie);
    });

    it('debe lanzar NotFoundException si la película no existe', async () => {
      jest.spyOn(movieRepository, 'findOneBy').mockResolvedValue(null);

      await expect(moviesService.findOne('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('debe crear y retornar una nueva película', async () => {
      const dto = { title: 'A New Hope' } as Movie;
      jest.spyOn(movieRepository, 'save').mockResolvedValue(dto);

      const result = await moviesService.create(dto);

      expect(result).toEqual(dto);
      expect(movieRepository.save).toHaveBeenCalledWith(dto);
    });

    it('debe lanzar ConflictException si la película ya existe', async () => {
      jest.spyOn(movieRepository, 'save').mockRejectedValue({ code: '23505' });

      await expect(moviesService.create({} as Movie)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debe lanzar InternalServerErrorException en otros errores', async () => {
      const error = new Error('Database error');
      jest.spyOn(movieRepository, 'save').mockRejectedValue(error);

      await expect(moviesService.create({} as Movie)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('debe actualizar y retornar la película actualizada', async () => {
      const updatedMovie: Movie = { id: '1', title: 'Updated Title' } as Movie;
      jest.spyOn(movieRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(movieRepository, 'findOneBy').mockResolvedValue(updatedMovie);

      const result = await moviesService.update('1', {
        title: 'Updated Title',
      });

      expect(result).toEqual(updatedMovie);
      expect(movieRepository.update).toHaveBeenCalledWith('1', {
        title: 'Updated Title',
      });
      expect(movieRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('remove', () => {
    it('debe eliminar la película si existe', async () => {
      jest
        .spyOn(movieRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      const result = await moviesService.remove('1');

      expect(result).toBe('Done');
      expect(movieRepository.delete).toHaveBeenCalledWith('1');
    });

    it('debe lanzar NotFoundException si la película no existe', async () => {
      jest
        .spyOn(movieRepository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(moviesService.remove('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
