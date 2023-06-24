import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer, ValidationError } from 'class-validator';
import cookieParser from 'cookie-parser';
import { useGlobalPipes } from './common/pipes/global.pipe';
import { useGlobalFilters } from './common/filters/global.filters';
import { setupSwagger } from './config/swagger.config';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors();
  app.use(cookieParser());

  setupSwagger(app);
  useGlobalPipes(app);
  useGlobalFilters(app);

  const config = await app.get(ConfigService);
  const port = config.get<number>('API_PORT');
  console.log('PORT', port);
  await app.listen(port || 3000, () => {
    console.log(`App started on port: ${port}`);
  });
}
bootstrap();
