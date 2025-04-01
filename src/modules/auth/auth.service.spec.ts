import {
  ConflictException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../common/entities';
import { LoginDTO, RegisterDTO } from './dtos';
import { Roles } from '../../common/guards';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        ConfigService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('register', () => {
    it('debe registrar un usuario correctamente', async () => {
      const dto: RegisterDTO = {
        username: 'testuser',
        password: 'password123',
        role: Roles.ADMIN,
      };
      const hashedPassword = bcrypt.hashSync(dto.password, 10);
      const savedUser = {
        id: '1',
        username: dto.username,
        password: hashedPassword,
        role: Roles.ADMIN,
      } as User;

      jest.spyOn(userRepository, 'save').mockResolvedValue(savedUser);

      const result = await authService.register(dto);

      expect(result).toEqual({
        id: '1',
        username: dto.username,
        role: Roles.ADMIN,
      });
      // expect(userRepository.save).toHaveBeenCalledWith({
      //   username: dto.username,
      //   password: expect.any(String),
      //   role: Roles.ADMIN,
      // });

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          username: dto.username,
          password: expect.stringMatching(/^\$2[aby]\$.{56}$/), // Expresión regular para hashes bcrypt
        }),
      );
    });

    it('debe lanzar ConflictException si el username ya existe', async () => {
      const dto: RegisterDTO = {
        username: 'existingUser',
        password: 'password123',
        role: Roles.ADMIN,
      };
      const error = { code: '23505' };
      jest.spyOn(userRepository, 'save').mockRejectedValue(error);
      await expect(authService.register(dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debe lanzar InternalServerErrorException en otros errores', async () => {
      const dto: RegisterDTO = {
        username: 'testuser',
        password: 'password123',
        role: Roles.ADMIN,
      };
      const error = new Error('Database error');
      jest.spyOn(userRepository, 'save').mockRejectedValue(error);
      await expect(authService.register(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('login', () => {
    it('debe retornar tokens si las credenciales son correctas', async () => {
      const dto: LoginDTO = { username: 'testuser', password: 'password123' };
      const user = {
        id: '1',
        username: dto.username,
        password: bcrypt.hashSync(dto.password, 10),
      } as User;
      const accessToken = 'access_token';
      const refreshToken = 'refresh_token';

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        return key.includes('SECRET') ? 'secret' : '1h';
      });

      const result = await authService.login(dto);

      expect(result).toEqual({ accessToken, refreshToken });
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        username: dto.username,
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      const dto: LoginDTO = {
        username: 'nonexistent',
        password: 'password123',
      };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);
      await expect(authService.login(dto)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      const dto: LoginDTO = { username: 'testuser', password: 'wrongpassword' };
      const user = {
        id: '1',
        username: dto.username,
        password: bcrypt.hashSync('password123', 10),
      } as User;
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
      await expect(authService.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    it('debe generar un nuevo accessToken', () => {
      const payload = { id: '123', role: Roles.ADMIN };
      const accessToken = 'new_access_token';
      jest.spyOn(jwtService, 'sign').mockReturnValue(accessToken);
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        return key.includes('SECRET') ? 'secret' : '1h';
      });

      const result = authService.refreshToken(payload);

      expect(result).toEqual({ accessToken });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { id: payload.id, role: Roles.ADMIN },
        { secret: 'secret', expiresIn: '1h' },
      );
    });
  });
});
