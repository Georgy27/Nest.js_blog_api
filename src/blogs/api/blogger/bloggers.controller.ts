import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from '../../blogs.service';
import { BlogsQueryRepository } from '../../blogs.query.repository';
import { CreateBlogDto } from '../../dto/create.blog.dto';
import { UpdateBlogDto } from '../../dto/update.blog.dto';
import { Blog } from '../../schemas/blog.schema';
import { BlogsPaginationQueryDto } from '../../../helpers/pagination/dto/blogs.pagination.query.dto';
import { PaginationViewModel } from '../../../helpers/pagination/pagination.view.model.wrapper';
import { PostsQueryRepository } from '../../../posts/posts.query.repository';
import { CreatePostByBlogIdDto } from '../../dto/create.post.blogId.dto';
import { PostsService } from '../../../posts/posts.service';
import { JwtService } from '@nestjs/jwt';
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
import { CommentsPaginationQueryDto } from '../../../helpers/pagination/dto/comments.pagination.dto';
import { CommentsQueryRepository } from '../../../comments/comments.query.repository';

@SkipThrottle()
@Controller('blogger/blogs')
export class BloggersController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private jwtService: JwtService,
    private commandBus: CommandBus,
  ) {}
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllBlogsForBlogger(
    @Query() blogsPaginationDto: BlogsPaginationQueryDto,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ): Promise<PaginationViewModel<Blog[]>> {
    return this.blogsQueryRepository.findBlogs(
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
    // find all blogs made by blogger
    const allBlogs = await this.blogsQueryRepository.findBlogsWithoutPagination(
      jwtAtPayload.userId,
    );
    // find all posts made by blogger
    const allPosts = await this.postsQueryRepository.findPostsForBlogger(
      jwtAtPayload.userId,
    );
    // return all comments for posts
    return this.commentsQueryRepository.getAllCommentsForAllPostsByBlogger(
      allPosts,
      allBlogs,
      commentsForPostsPaginationDto,
      jwtAtPayload.userId,
    );
  }
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(201)
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ): Promise<Blog> {
    const blogId: string = await this.commandBus.execute(
      new CreateBlogCommand(createBlogDto, jwtAtPayload),
    );
    const blog = await this.blogsQueryRepository.findBlog(blogId);
    if (!blog) throw new NotFoundException();
    return blog;
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
    const newPostId: string | null = await this.commandBus.execute(
      new CreatePostForSpecifiedBlogCommand(newCreatePostDto, jwtAtPayload),
    );
    if (!newPostId) throw new NotFoundException();
    // return post to user
    return this.postsQueryRepository.getMappedPost(newPostId);
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
