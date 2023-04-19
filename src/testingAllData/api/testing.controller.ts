import { Controller, Delete, HttpCode } from '@nestjs/common';
import { BlogsRepository } from '../../blogs/repositories/mongo/blogs.repository';
import { PostsRepository } from '../../posts/repositories/mongo/posts.repository';
import { UsersRepository } from '../../users/repositories/mongo/users.repository';
import { CommentsRepository } from '../../comments/repositories/mongo/comments.repository';
import { SkipThrottle } from '@nestjs/throttler';
import { SecurityDevicesRepository } from '../../security-devices/repositories/security.devices.repository';
import { ReactionsRepository } from '../../reactions/reactions.repository';
import { UsersSQLRepository } from '../../users/repositories/PostgreSQL/users.sql.repository';
import { SecurityDevicesSQLRepository } from '../../security-devices/repositories/security.devices.sql.repository';
import { BlogsSqlRepository } from '../../blogs/repositories/PostgreSQL/blogs.sql.repository';
import { PostsRepositoryAdapter } from '../../posts/repositories/adapters/posts-repository.adapter';

@SkipThrottle()
@Controller('testing/all-data')
export class TestingController {
  constructor(
    private readonly blogsSQLRepository: BlogsSqlRepository,
    private readonly postsRepositoryAdapter: PostsRepositoryAdapter,
    private readonly usersSQLRepository: UsersSQLRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly securityDevicesSQLRepository: SecurityDevicesSQLRepository,
    private readonly reactionsRepository: ReactionsRepository,
  ) {}
  @Delete()
  @HttpCode(204)
  async deleteAllData(): Promise<string | void> {
    await Promise.all([
      this.blogsSQLRepository.clearBlogs(),
      this.postsRepositoryAdapter.deleteAll(),
      this.usersSQLRepository.clearUsers(),
      this.commentsRepository.clearComments(),
      this.securityDevicesSQLRepository.clearSessions(),
      this.reactionsRepository.dropReactions(),
    ]);

    return;
  }
}
