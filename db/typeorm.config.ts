import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get<string>('POSTGRES_HOST'),
  username: configService.get<string>('TYPEORM_USERNAME'),
  password: configService.get<string>('TYPEORM_PASSWORD'),
  database: configService.get<string>('TYPEORM_DATABASE'),
  port: configService.get<number>('TYPEORM_PORT'),
  entities: [`${__dirname}/../src/**/*.entity{.ts,.js}`],
  logging: configService.get('IS_PROD') === 'false',
  synchronize: false,
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
};

const typeormConfig = new DataSource(dataSourceOptions);
export default typeormConfig;
