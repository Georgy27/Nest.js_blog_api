import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { User } from '../src/users/entities/user.entity';
import { EmailConfirmation } from '../src/users/entities/emailConfirmation.entity';
import { PasswordRecovery } from '../src/users/entities/passwordRecovery.entity';
import { BanInfo } from '../src/users/entities/banInfo.entity';
import { Blogger } from '../src/users/entities/blogger.entity';
import { DeviceSessions } from '../src/security-devices/entities/deviceSessions.entity';

config();

const configService = new ConfigService();
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get<string>('POSTGRES_HOST'),
  username: configService.get<string>('TYPEORM_USERNAME'),
  password: configService.get<string>('TYPEORM_PASSWORD'),
  database: configService.get<string>('TYPEORM_DATABASE'),
  port: configService.get<number>('TYPEORM_PORT'),
  entities: [
    User,
    EmailConfirmation,
    PasswordRecovery,
    BanInfo,
    Blogger,
    DeviceSessions,
  ],
  logging: configService.get('IS_PROD') === 'false',
  synchronize: false,
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
};

const typeormConfig = new DataSource(dataSourceOptions);
export default typeormConfig;
