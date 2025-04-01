import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '../../common/entities';
import { RegisterDTO, LoginDTO } from './dtos';
import { Roles } from '../../common/guards';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('debe registrar un usuario correctamente', async () => {
      const dto: RegisterDTO = {
        username: 'testuser',
        password: 'password123',
        role: Roles.STANDARD,
      };
      const user = {
        id: '1',
        username: dto.username,
        password: 'hashedpassword',
      } as User;
      jest.spyOn(authService, 'register').mockResolvedValue(user);

      const result = await authController.register(dto);

      expect(result).toEqual(user);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('debe retornar tokens si las credenciales son correctas', async () => {
      const dto: LoginDTO = { username: 'testuser', password: 'password123' };
      const tokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };
      jest.spyOn(authService, 'login').mockResolvedValue(tokens);

      const result = await authController.login(dto);

      expect(result).toEqual(tokens);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      const dto: LoginDTO = {
        username: 'nonexistent',
        password: 'password123',
      };
      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new NotFoundException());

      await expect(authController.login(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      const dto: LoginDTO = { username: 'testuser', password: 'wrongpassword' };
      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException());

      await expect(authController.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    it('debe retornar un nuevo accessToken', () => {
      const req = { user: { id: '123', role: Roles } };
      const newToken = { accessToken: 'new_access_token' };
      jest.spyOn(authService, 'refreshToken').mockReturnValue(newToken);

      const result = authController.refreshToken(req);

      expect(result).toEqual(newToken);
      expect(authService.refreshToken).toHaveBeenCalledWith(req.user);
    });
  });
});
