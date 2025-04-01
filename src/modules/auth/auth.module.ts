import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { AuthStrategy, RefreshStrategy } from 'src/common/strategies';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/common/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, JwtService, AuthStrategy, RefreshStrategy],
})
export class AuthModule {}
