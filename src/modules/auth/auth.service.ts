import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDTO, RegisterDTO } from './dtos';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IEnvs } from 'src/common/interfaces';
import { log } from 'console';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../common/entities';
import { Repository } from 'typeorm';
import { compareSync, hashSync } from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Roles } from 'src/common/guards';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<IEnvs>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async register(dto: RegisterDTO): Promise<User> {
    let user: User;
    try {
      user = await this.userRepository.save({
        ...dto,
        password: hashSync(dto.password, 10),
      });
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username already exists');
      } else throw new InternalServerErrorException(error);
    }

    return plainToInstance(User, user);
  }

  async login(
    dto: LoginDTO,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findOneBy({
      username: dto.username,
    });
    if (!user) throw new NotFoundException('User not found');

    if (!compareSync(dto.password, user.password))
      throw new UnauthorizedException('Invalid username or password');

    const accessToken = this.jwtService.sign(
      { id: user.id, role: user.role },
      {
        secret: this.configService.get('ACCESSTOKEN_SECRET'),
        expiresIn: this.configService.get('ACCESSTOKEN_EXPIRATION'),
      },
    );

    const refreshToken = this.jwtService.sign(
      { id: user.id, role: user.role },
      {
        secret: this.configService.get('REFRESHTOKEN_SECRET'),
        expiresIn: this.configService.get('REFRESHTOKEN_EXPIRATION'),
      },
    );

    return { accessToken, refreshToken };
  }

  refreshToken(user: { id: string; role: Roles }): { accessToken: string } {
    const accessToken = this.jwtService.sign(
      { id: user.id, role: user.role },
      {
        secret: this.configService.get('ACCESSTOKEN_SECRET'),
        expiresIn: this.configService.get('ACCESSTOKEN_EXPIRATION'),
      },
    );

    return { accessToken };
  }
}
