import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, RegisterDTO } from './dtos';
import { RefreshGuard } from '../../common/guards';
import { unauthorizedResponse } from '../../common/api-unauthorized-response';
import { log } from 'console';
import { User } from '../../common/entities';

@Controller('auth')
@ApiTags('auth')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized Request',
  example: unauthorizedResponse,
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOkResponse({
    description: 'OK',
    type: User,
  })
  register(@Body() dto: RegisterDTO): Promise<User> {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOkResponse({
    description: 'OK',
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  })
  login(
    @Body() dto: LoginDTO,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @UseGuards(RefreshGuard)
  @ApiOkResponse({
    description: 'OK',
    example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
  })
  refreshToken(@Req() req): { accessToken: string } {
    return this.authService.refreshToken(req.user);
  }
}
