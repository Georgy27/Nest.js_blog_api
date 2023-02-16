import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtRtPayload } from './index';
import { Request as RequestType } from 'express';

@Injectable()
export class JwtRtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtRtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_RT_SECRET'),
    });
  }
  async validate(payload: JwtRtPayload) {
    return payload;
    // return { userId: payload.userId, deviceId: payload.deviceId };
  }
  private static extractJWT(req: RequestType): string | null {
    let token = null;
    if (req.cookies) {
      token = req.cookies['refreshToken'];
    }
    return token;
  }
}
