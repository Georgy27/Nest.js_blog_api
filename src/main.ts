import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { useContainer, ValidationError } from 'class-validator';
import { prepareErrorResult } from './common/pipes/validation.pipe';
import { HttpExceptionFilter } from './http.exception-filter';
import cookieParser from 'cookie-parser';
import { TrimPipe } from './common/pipes/trim.pipe';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { useGlobalPipes } from "./common/pipes/global.pipe";
import { useGlobalFilters } from "./common/filters/global.filters";
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors();
  app.use(cookieParser());

  useGlobalPipes(app)
useGlobalFilters(app)


  const config = new DocumentBuilder()
    .setTitle('Blogger_Api')
    .setDescription('The blogs API description')
    .setVersion('1.0')
    .addTag('blogs')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
