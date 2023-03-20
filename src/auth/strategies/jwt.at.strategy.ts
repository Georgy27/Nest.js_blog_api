import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtAtPayload } from './index';
import { SecurityDevicesSQLRepository } from '../../security-devices/repositories/security.devices.sql.repository';

@Injectable()
export class JwtAtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private securityDevicesSQLRepository: SecurityDevicesSQLRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_AT_SECRET'),
    });
  }
  async validate(payload: JwtAtPayload) {
    // const issuedAt = new Date(payload.iat * 1000).toISOString();
    const deviceId = payload.deviceId;
    const deviceSession =
      await this.securityDevicesSQLRepository.findSessionByDeviceId(deviceId);
    if (!deviceSession) throw new UnauthorizedException();
    // if (lastActiveDate.lastActiveDate !== issuedAt)
    //   throw new UnauthorizedException();
    return payload;
    // return { userId: payload.userId, deviceId: payload.deviceId };
  }
}
