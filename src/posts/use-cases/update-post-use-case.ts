import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { Model } from 'mongoose';
import { UpdatePostForBloggerDto } from '../../blogs/dto/update.post.blogger.dto';
import { PostsRepository } from '../posts.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../blogs/blogs.repository';

export class UpdatePostCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public updatePostForBloggerDto: UpdatePostForBloggerDto,
    public userId: string,
  ) {}
}
@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    @InjectModel(Post.name)
    private postModel: Model<PostDocument>,
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}
  async execute(command: UpdatePostCommand) {
    // check if blog exists
    const isBlog = await this.blogsRepository.findBlogById(command.blogId);
    if (!isBlog) throw new NotFoundException();
    // find post
    const post = await this.postsRepository.findPostById(command.postId);
    if (!post) throw new NotFoundException();
    // check user
    if (isBlog.blogOwnerInfo.userId !== command.userId)
      throw new ForbiddenException();
    // check for blogId
    if (command.blogId !== post.blogId) throw new ForbiddenException();
    post.updatePost(command.updatePostForBloggerDto);
    return this.postsRepository.save(post);
  }
}
