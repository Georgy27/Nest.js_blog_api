import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtRtPayload } from './index';
import { Request as RequestType } from 'express';
import { SecurityDevicesSQLRepository } from '../../security-devices/repositories/security.devices.sql.repository';

@Injectable()
export class JwtRtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    config: ConfigService,
    private securityDevicesSQLRepository: SecurityDevicesSQLRepository,
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
    // const issuedAt = new Date(payload.iat * 1000).toISOString();
    const deviceId = payload.deviceId;
    const deviceSession =
      await this.securityDevicesSQLRepository.findSessionByDeviceId(deviceId);
    if (!deviceSession) throw new UnauthorizedException();
    // if (lastActiveDate !== issuedAt) throw new UnauthorizedException();
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
