import { CreateBlogDto } from '../../dto/create.blog.dto';
import { Blog } from '../../schemas/blog.schema';

export const blogStub = {
  blog: {
    id: '123',
    name: 'blog',
    description: 'description',
    websiteUrl: 'websiteUerl',
    createdAt: 'createdAt',
    isMembership: false,
  },
  createBlog(): CreateBlogDto {
    return {
      name: 'testBlog',
      description: 'testDescription',
      websiteUrl: 'test-example.com',
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
  getBlog() {
    return this.blog;
  },
};
