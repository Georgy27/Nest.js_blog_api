import { Module } from '@nestjs/common';
import { TestingController } from './api/testing.controller';
import { BlogsModule } from '../blogs/blogs.module';
import { PostsModule } from '../posts/posts.module';
import { CommentsModule } from '../comments/comments.module';
import { UsersModule } from '../users/users.module';
import { SecurityDevicesModule } from '../security-devices/security.devices.module';

@Module({
  imports: [
    BlogsModule,
    PostsModule,
    CommentsModule,
    UsersModule,
    SecurityDevicesModule,
  ],
  controllers: [TestingController],
})
export class TestingModule {}
