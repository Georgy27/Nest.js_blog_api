import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateBlogDto } from '../../dto/create.blog.dto';
import { UpdateBlogDto } from '../../dto/update.blog.dto';
import { BlogsPaginationQueryDto } from '../../../helpers/pagination/dto/blogs.pagination.query.dto';
import { CreatePostByBlogIdDto } from '../../dto/create.post.blogId.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../../use-cases/create-blog-use-case';
import { CreatePostForSpecifiedBlogCommand } from '../../../posts/use-cases/create-post-for-specified-blog-use-case';
import { UpdateBlogCommand } from '../../use-cases/update-blog-use-case';
import { DeleteBlogCommand } from '../../use-cases/delete-blog-use-case';
import { AuthGuard } from '@nestjs/passport';
import { JwtAtPayload } from '../../../auth/strategies';
import { UpdatePostForBloggerDto } from '../../dto/update.post.blogger.dto';
import { UpdatePostCommand } from '../../../posts/use-cases/update-post-use-case';
import { DeletePostCommand } from '../../../posts/use-cases/delete-post-use-case';
import { GetJwtAtPayloadDecorator } from '../../../common/decorators/getJwtAtPayload.decorator';
import { BlogsSQLQueryRepository } from '../../repositories/PostgreSQL/blogs.query.sql.repository';
import { PaginationViewModel } from '../../../helpers/pagination/pagination.view.model.wrapper';
import { BlogViewModel } from '../../types';
import { CreatePostModel } from '../../../posts/types';
import { PostReactionViewModel } from '../../../helpers/reaction/reaction.view.model.wrapper';
import { PostsQueryRepositoryAdapter } from '../../../posts/repositories/adapters/posts-query-repository.adapter';
import { CommentsPaginationQueryDto } from '../../../helpers/pagination/dto/comments.pagination.dto';
import { CommentsQueryRepositoryAdapter } from '../../../comments/repositories/adapters/comments-query-repository.adapter';

@SkipThrottle()
@Controller('blogger/blogs')
export class BloggersController {
  constructor(
    private readonly blogsSQLQueryRepository: BlogsSQLQueryRepository,

    private readonly postsQueryRepositoryAdapter: PostsQueryRepositoryAdapter,
    private readonly commentsQueryRepositoryAdapter: CommentsQueryRepositoryAdapter,

    private commandBus: CommandBus,
  ) {}
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllBlogsForBlogger(
    @Query() blogsPaginationDto: BlogsPaginationQueryDto,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ): Promise<PaginationViewModel<BlogViewModel[]>> {
    return this.blogsSQLQueryRepository.findBlogsForBlogger(
      blogsPaginationDto.searchNameTerm,
      blogsPaginationDto.pageSize,
      blogsPaginationDto.sortBy,
      blogsPaginationDto.pageNumber,
      blogsPaginationDto.sortDirection,
      jwtAtPayload,
    );
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('comments')
  async getAllCommentsForAllPostsByBlogger(
    @Query() commentsForPostsPaginationDto: CommentsPaginationQueryDto,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ) {
    // find all blogs that were not banned by admin and made by blogger
    // const allBlogs =
    //   await this.blogsSQLQueryRepository.findBlogsForBloggerWithoutPagination(
    //     jwtAtPayload.userId,
    //   );
    // console.log('ALL BLOGS', allBlogs);
    // // find all posts for all blogs made by blogger
    // const allPosts =
    //   await this.postsQueryRepositoryAdapter.findAllPostsForAllBloggerBlogs(
    //     allBlogs,
    //   );
    // console.log('ALL POSTS', allPosts);
    // return all comments for all posts

    return this.commentsQueryRepositoryAdapter.getAllCommentsForAllPostsByBlogger(
      jwtAtPayload.userId,
      commentsForPostsPaginationDto,
    );
    // return this.commentsQueryRepository.getAllCommentsForAllPostsByBlogger(
    //   allPosts,
    //   allBlogs,
    //   commentsForPostsPaginationDto,
    //   jwtAtPayload.userId,
    // );
  }
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(201)
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ) {
    return this.commandBus.execute(
      new CreateBlogCommand(createBlogDto, jwtAtPayload),
    );
  }
  @UseGuards(AuthGuard('jwt'))
  @Post(':blogId/posts')
  @HttpCode(201)
  async createPostForSpecifiedBlog(
    @Param('blogId') blogId: string,
    @Body() createPostDto: CreatePostByBlogIdDto,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ) {
    // create post
    const newCreatePostDto = { ...createPostDto, blogId: blogId };
    const newPost = await this.commandBus.execute<
      CreatePostForSpecifiedBlogCommand,
      CreatePostModel
    >(new CreatePostForSpecifiedBlogCommand(newCreatePostDto, jwtAtPayload));
    // return post to user
    return new PostReactionViewModel(newPost);
  }
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateBlogCommand(id, updateBlogDto, jwtAtPayload.userId),
    );
  }
  @UseGuards(AuthGuard('jwt'))
  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  async updatePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() updatePostForBloggerDto: UpdatePostForBloggerDto,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdatePostCommand(
        blogId,
        postId,
        updatePostForBloggerDto,
        jwtAtPayload.userId,
      ),
    );
  }
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(204)
  async deleteBlogById(
    @Param('id') blogId: string,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ): Promise<void> {
    return this.commandBus.execute(
      new DeleteBlogCommand(blogId, jwtAtPayload.userId),
    );
  }
  @UseGuards(AuthGuard('jwt'))
  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  async deletePostById(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ): Promise<void> {
    return this.commandBus.execute(
      new DeletePostCommand(blogId, postId, jwtAtPayload.userId),
    );
  }
}
