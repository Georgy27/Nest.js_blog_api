import { Controller, Delete, HttpCode } from '@nestjs/common';
import { BlogsRepository } from '../../blogs/blogs.repository';
import { PostsRepository } from '../../posts/posts.repository';
import { UsersRepository } from '../../users/users.repository';
import { CommentsRepository } from '../../comments/comments.repository';

@Controller('testing/all-data')
export class TestingController {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}
  @Delete()
  @HttpCode(204)
  async deleteAllData(): Promise<string | void> {
    await Promise.all([
      this.blogsRepository.clearBlogs(),
      this.postsRepository.clearPosts(),
      this.usersRepository.clearUsers(),
      this.commentsRepository.clearComments(),
    ]);

    return;
  }
}