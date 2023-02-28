import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { Model } from 'mongoose';
import { UpdatePostForBloggerDto } from '../../blogs/dto/update.post.blogger.dto';
import { PostsRepository } from '../posts.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class UpdatePostCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public updatePostForBloggerDto: UpdatePostForBloggerDto,
  ) {}
}
@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    @InjectModel(Post.name)
    private postModel: Model<PostDocument>,
    private readonly postsRepository: PostsRepository,
  ) {}
  async execute(command: UpdatePostCommand) {
    // find post
    const post = await this.postsRepository.findPostById(command.postId);
    if (!post) throw new NotFoundException();
    // check for blogId
    if (command.blogId !== post.blogId) throw new ForbiddenException();
    post.updatePost(command.updatePostForBloggerDto);
    return this.postsRepository.save(post);
  }
}