import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer, ValidationError } from 'class-validator';
import cookieParser from 'cookie-parser';
import { useGlobalPipes } from './common/pipes/global.pipe';
import { useGlobalFilters } from './common/filters/global.filters';
import { setupSwagger } from './config/swagger.config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors();
  app.use(cookieParser());

  setupSwagger(app);
  useGlobalPipes(app);
  useGlobalFilters(app);

  await app.listen(3500);
}
bootstrap();
