import { CreateBlogDto } from '../../dto/create.blog.dto';
import { Blog } from '../../schemas/blog.schema';
import { CreatePostDto } from '../../../posts/dto/create.post.dto';
import { Post } from '../../../posts/schemas/post.schema';

export const blogStub = {
  blog: {
    id: '123',
    name: 'blog',
    description: 'description',
    websiteUrl: 'websiteUrl',
    createdAt: 'createdAt',
    isMembership: false,
  },
  post: {
    id: '123',
    title: 'title',
    shortDescription: 'description',
    content: 'content',
    blogId: 'blogId',
    blogName: 'blogName',
    createdAt: 'createdAt',
    extendedLikesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    },
  },
  createBlog(): CreateBlogDto {
    return {
      name: 'testBlog',
      description: 'testDescription',
      websiteUrl: 'test-example.com',
    };
  },
  createPost(blogId: string): CreatePostDto {
    return {
      title: 'title',
      shortDescription: 'title description',
      content: 'post content',
      blogId: blogId,
    };
  },
  setBlog(blog: Blog) {
    (this.blog.id = blog.id),
      (this.blog.name = blog.name),
      (this.blog.description = blog.description),
      (this.blog.websiteUrl = blog.websiteUrl),
      (this.blog.createdAt = blog.createdAt),
      (this.blog.isMembership = blog.isMembership);
  },
  setPost(post: Post, blog: Blog) {
    this.post.id = post.id;
    this.post.title = post.title;
    this.post.shortDescription = post.shortDescription;
    this.post.content = post.content;
    this.post.blogId = blog.id;
    this.post.blogName = blog.name;
    this.post.createdAt = post.createdAt;
    this.post.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    };
  },
  getBlog() {
    return this.blog;
  },
  getPost() {
    return this.post;
  },
};
