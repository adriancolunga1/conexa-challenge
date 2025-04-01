import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IEnvs } from '../interfaces';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'auth') {
  constructor(private readonly configService: ConfigService<IEnvs>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('ACCESSTOKEN_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
