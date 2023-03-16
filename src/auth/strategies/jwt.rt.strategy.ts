import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtRtPayload } from './index';
import { Request as RequestType } from 'express';
import { SecurityDevicesRepository } from '../../security-devices/repositories/security.devices.repository';

@Injectable()
export class JwtRtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    config: ConfigService,
    private securityDevicesRepository: SecurityDevicesRepository,
  ) {
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
    const lastActiveDate = new Date(payload.iat * 1000).toISOString();
    const verifyToken = await this.securityDevicesRepository.findLastActiveDate(
      payload.userId,
      lastActiveDate,
    );
    if (!verifyToken) throw new UnauthorizedException();
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
