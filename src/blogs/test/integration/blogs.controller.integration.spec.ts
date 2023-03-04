import { AppModule } from '../../../app.module';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { DatabaseService } from '../../../database/database.service';
import request from 'supertest';
import { blogStub } from '../stubs/blog.stub';
import { TrimPipe } from '../../../pipes/trim.pipe';
import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { prepareErrorResult } from '../../../pipes/validation.pipe';
import { HttpExceptionFilter } from '../../../http.exception-filter';
import { authStub } from '../stubs/auth.stub';
import { helperFunctionsForTesting } from '../helpers/helper-functions';

describe('BlogsController', () => {
  let dbConnection: Connection;
  let httpServer: any;
  let app: any;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new TrimPipe(),
      new ValidationPipe({
        whitelist: true,
        transform: true,
        stopAtFirstError: true,
        exceptionFactory: (errors: ValidationError[]) => {
          throw new BadRequestException(prepareErrorResult(errors));
        },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    dbConnection = moduleRef
      .get<DatabaseService>(DatabaseService)
      .getDbHandle();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });
  beforeAll(async () => {
    await dbConnection.collection('blogs').deleteMany({});
    await dbConnection.collection('users').deleteMany({});
  });
  //GET
  describe('GET METHODS', () => {
    describe('Get all blogs /blogs (GET)', () => {
      it('should return 200 and an empty array', async () => {
        const response = await request(httpServer).get('/blogs');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 0,
          items: [],
        });
      });
    });
    describe('Get blog /blogs/:id (GET)', () => {
      it('should return 404 if the blog doesnt exist', async () => {
        await request(httpServer).get('/blogs/1').expect(404);
      });
    });
    describe('Get all posts for specified blogID /blogs/:blogId/posts', () => {
      it('should create user, log user, create blog and posts as prepared data', async () => {
        // create user
        const user = await request(httpServer)
          .post('/auth/registration')
          .send(authStub.registration());
        expect(user.status).toBe(204);
        // login user
        const loggedUser = await request(httpServer)
          .post('/auth/login')
          .set('User-Agent', 'some spoofed agent')
          .send(authStub.login());
        expect(loggedUser.status).toBe(200);

        const accessToken = loggedUser.body.accessToken;
        // blogger creates blog
        const blog = await request(httpServer)
          .post('/blogger/blogs')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(blogStub.createBlog())
          .expect(201);

        blogStub.setBlog(blog.body);

        const isBlog = await request(httpServer).get(`/blogs/${blog.body.id}`);
        expect(isBlog.status).toBe(200);
        expect(isBlog.body).toStrictEqual(blogStub.getBlog());
        // create few posts for this blogId
        const post1 = await request(httpServer)
          .post(`/blogger/blogs/${blog.body.id}/posts`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(blogStub.createPost(isBlog.body.id));
        const post2 = await request(httpServer)
          .post(`/blogger/blogs/${blog.body.id}/posts`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(blogStub.createPost(isBlog.body.id));

        blogStub.setPost(post1.body, blog.body);
      });
      it('should return all the posts for blogId', async () => {
        // const { blog, post1, post2 } = expect.getState();
        const { statusCode, body } = await request(httpServer).get(
          `/blogs/${blogStub.blog.id}/posts`,
        );
        expect(statusCode).toBe(200);
        expect(body.items.length).toBe(2);
        expect(body.totalCount).toBe(2);
        expect(body).toStrictEqual({
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 2,
          items: expect.arrayContaining([
            blogStub.getPost(),
            blogStub.getPost(),
          ]),
        });
      });
    });
  });
  // POST
  describe('POST METHODS', () => {
    describe('check Blog input validation', () => {
      const errors = {
        errorsMessages: [
          { message: expect.any(String), field: 'name' },
          { message: expect.any(String), field: 'description' },
          { message: expect.any(String), field: 'websiteUrl' },
        ],
      };
      it('should prepare data', async () => {
        // create user
        const user = await request(httpServer)
          .post('/auth/registration')
          .send(authStub.registration());
        expect(user.status).toBe(204);
        // login user
        const loggedUser = await request(httpServer)
          .post('/auth/login')
          .set('User-Agent', 'some spoofed agent')
          .send(authStub.login());
        expect(loggedUser.status).toBe(200);

        const accessToken = loggedUser.body.accessToken;
        expect.setState({ accessToken });
      });

      it('should return 400 status code and array of error because the data was not sent', async () => {
        const { accessToken } = expect.getState();
        const { statusCode, body } = await request(httpServer)
          .post('/blogger/blogs')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({});

        expect(statusCode).toBe(400);
        expect(body).toEqual(errors);
      });

      it('should return 400 status code and array of error because the data is invalid', async () => {
        const { accessToken } = expect.getState();
        const { statusCode, body } = await request(httpServer)
          .post('/blogger/blogs')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ name: '', description: '', websiteUrl: '' });

        expect(statusCode).toBe(400);
        expect(body).toEqual(errors);
      });

      it('should return 400 status code and array of error because the data is invalid', async () => {
        const { accessToken } = expect.getState();
        const { statusCode, body } = await request(httpServer)
          .post('/blogger/blogs')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            name: '                            ',
            description: 23,
            websiteUrl: undefined,
          });

        expect(statusCode).toBe(400);
        expect(body).toEqual(errors);
      });
      it('should return 400 status code and array of error because the data exceeds the length requirement', async () => {
        const { accessToken } = expect.getState();
        const { statusCode, body } = await request(httpServer)
          .post('/blogger/blogs')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            name: helperFunctionsForTesting.generateString(16),
            description: helperFunctionsForTesting.generateString(501),
            websiteUrl: helperFunctionsForTesting.generateString(1001),
          });

        expect(statusCode).toBe(400);
        expect(body).toEqual(errors);
      });
    });

    describe('check Blog authorization', () => {
      it("shouldn't create a new blog when the user is not logged in ", async () => {
        await request(httpServer)
          .post('/blogger/blogs')
          .send(blogStub.createBlog())
          .expect(401);
      });
      it("shouldn't create a new blog when the user accessToken is incorrect", async () => {
        await request(httpServer)
          .post('/blogger/blogs')
          .set('Authorization', `Bearer 123`)
          .send(blogStub.createBlog())
          .expect(401);
      });
    });

    describe('Create blog /blogger/blogs (BLOG)', () => {
      it('should create a new blog when the data is correct', async () => {
        const { accessToken } = expect.getState();
        const blog1 = await request(httpServer)
          .post('/blogger/blogs')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(blogStub.createBlog())
          .expect(201);
        blogStub.setBlog(blog1.body);
        expect(blog1.body).toEqual(blogStub.getBlog());
      });
    });
  });
});
