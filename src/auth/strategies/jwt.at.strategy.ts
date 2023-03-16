import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtAtPayload } from './index';
import { SecurityDevicesRepository } from '../../security-devices/repositories/security.devices.repository';

@Injectable()
export class JwtAtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private securityDevicesRepository: SecurityDevicesRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_AT_SECRET'),
    });
  }
  async validate(payload: JwtAtPayload) {
    const lastActiveDate = new Date(payload.iat * 1000).toISOString();
    const verifyToken = await this.securityDevicesRepository.findLastActiveDate(
      payload.userId,
      lastActiveDate,
    );
    if (!verifyToken) throw new UnauthorizedException();
    return payload;
    // return { userId: payload.sub, username: payload.username };
  }
}
