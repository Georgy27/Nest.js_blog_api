import { CreateBlogDto } from '../../dto/create.blog.dto';

export const blogStub = {
  createBlog(): CreateBlogDto {
    return {
      name: '',
      description: 'testDescription',
      websiteUrl: 'test-example.com',
    };
  },
};
