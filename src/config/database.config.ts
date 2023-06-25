import { registerAs } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { EmailConfirmation } from '../users/entities/emailConfirmation.entity';
import { PasswordRecovery } from '../users/entities/passwordRecovery.entity';
import { BanInfo } from '../users/entities/banInfo.entity';
import { Blogger } from '../users/entities/blogger.entity';
import { DeviceSessions } from '../security-devices/entities/deviceSessions.entity';

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  port: process.env.TYPEORM_PORT,
  entities: [
    User,
    EmailConfirmation,
    PasswordRecovery,
    BanInfo,
    Blogger,
    DeviceSessions,
  ],
  logging: process.env.IS_PROD === 'false',
  synchronize: false,
  migrations: [`${__dirname}/../../db/migrations/*{.ts,.js}`],
  migrationsTableName: 'migrations',
}));
