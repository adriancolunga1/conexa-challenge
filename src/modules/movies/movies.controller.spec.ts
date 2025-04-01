import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { Movie } from '../../common/entities';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateMovieDto, UpdateMovieDto } from './dtos';

describe('MoviesController', () => {
  let moviesController: MoviesController;
  let moviesService: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            syncronize: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    moviesController = module.get<MoviesController>(MoviesController);
    moviesService = module.get<MoviesService>(MoviesService);
  });

  describe('findAll', () => {
    it('debe retornar todas las películas', async () => {
      const movies: Movie[] = [{ title: 'A New Hope', episode_id: 4 } as Movie];
      jest.spyOn(moviesService, 'findAll').mockResolvedValue(movies);

      const result = await moviesController.findAll();

      expect(result).toEqual(movies);
      expect(moviesService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debe retornar una película por id', async () => {
      const movie: Movie = { id: '1', title: 'A New Hope' } as Movie;
      jest.spyOn(moviesService, 'findOne').mockResolvedValue(movie);

      const result = await moviesController.findOne('1');

      expect(result).toEqual(movie);
      expect(moviesService.findOne).toHaveBeenCalledWith('1');
    });

    it('debe lanzar NotFoundException si la película no existe', async () => {
      jest
        .spyOn(moviesService, 'findOne')
        .mockRejectedValue(new NotFoundException());

      await expect(moviesController.findOne('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('debe crear una nueva película', async () => {
      const dto: CreateMovieDto = { title: 'A New Hope' } as CreateMovieDto;
      const movie: Movie = { id: '1', ...dto } as Movie;
      jest.spyOn(moviesService, 'create').mockResolvedValue(movie);

      const result = await moviesController.create(dto);
      expect(result).toEqual(movie);
      expect(moviesService.create).toHaveBeenCalledWith(dto);
    });

    it('debe lanzar ConflictException si la película ya existe', async () => {
      jest
        .spyOn(moviesService, 'create')
        .mockRejectedValue(new ConflictException());

      await expect(
        moviesController.create({} as CreateMovieDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('syncronize', () => {
    it('debe sincronizar películas', async () => {
      const movies: Movie[] = [{ title: 'A New Hope' } as Movie];
      jest.spyOn(moviesService, 'syncronize').mockResolvedValue(movies);

      const result = await moviesController.syncronize();
      expect(result).toEqual(movies);
      expect(moviesService.syncronize).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('debe actualizar una película', async () => {
      const dto: UpdateMovieDto = {
        title: 'The Empire Strikes Back',
      } as UpdateMovieDto;
      const movie: Movie = { id: '1', ...dto } as Movie;
      jest.spyOn(moviesService, 'update').mockResolvedValue(movie);

      const result = await moviesController.update('1', dto);
      expect(result).toEqual(movie);
      expect(moviesService.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('debe eliminar una película', async () => {
      jest.spyOn(moviesService, 'remove').mockResolvedValue('Done');

      const result = await moviesController.remove('1');
      expect(result).toBe('Done');
      expect(moviesService.remove).toHaveBeenCalledWith('1');
    });

    it('debe lanzar NotFoundException si la película no existe', async () => {
      jest
        .spyOn(moviesService, 'remove')
        .mockRejectedValue(new NotFoundException());

      await expect(moviesController.remove('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
