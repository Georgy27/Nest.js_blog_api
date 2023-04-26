import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { MailService } from '../../src/mail/mail.service';
import cookieParser from 'cookie-parser';
import { useGlobalPipes } from '../../src/common/pipes/global.pipe';
import { useGlobalFilters } from '../../src/common/filters/global.filters';
import { MailServiceMock } from '../mocks/mail-service.mock';

export const getApp = async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(MailService)
    .useValue(MailServiceMock)
    .compile();

  const app = moduleRef.createNestApplication();
  app.use(cookieParser());
  useGlobalPipes(app);
  useGlobalFilters(app);
  await app.init();

  return app;
};
