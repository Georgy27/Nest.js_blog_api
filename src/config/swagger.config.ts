import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('Blogger_Api')
    .setDescription('The blogs API description')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      bearerFormat: 'jwt',
    })
    .addCookieAuth('refresh-token')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
}
