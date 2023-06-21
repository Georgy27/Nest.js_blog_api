import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsModule } from './blogs/blogs.module';
import { CommentsModule } from './comments/comments.module';
import { UsersModule } from './users/users.module';
import { TestingModule } from './testingAllData/testing.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { PrismaModule } from './prisma/prisma.module';
import { TypeormModule } from './typeorm/typeorm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    // ThrottlerModule.forRoot({
    //   ttl: 10,
    //   limit: 5,
    // }),
    BlogsModule,
    PostsModule,
    CommentsModule,
    UsersModule,
    TestingModule,
    MailModule,
    AuthModule,
    DatabaseModule,
    PrismaModule,
    TypeormModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
