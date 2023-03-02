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
  beforeEach(async () => {
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

      // // create few posts for this blogId
      // const post1 = await request(httpServer)
      //   .post(`/blogs/${blog1.body.id}/posts`)
      //   .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
      //   .send(constants.createPost1);
      // const post2 = await request(httpServer)
      //   .post(`/blogs/${blog1.body.id}/posts`)
      //   .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
      //   .send(constants.createPost2);
      //
      // expect.setState({ blog1, post1, post2 });
    });
    // it('should return all the posts for blogId', async () => {
    //   const { blog1, post1, post2 } = expect.getState();
    //   const { statusCode, body } = await request(app).get(
    //     `/blogs/${blog1.body.id}/posts`,
    //   );
    //   expect(statusCode).toBe(200);
    //   expect(body.items.length).toBe(2);
    //   expect(body.totalCount).toBe(2);
    //   expect(body).toStrictEqual({
    //     pagesCount: 1,
    //     page: 1,
    //     pageSize: 10,
    //     totalCount: 2,
    //     items: expect.arrayContaining([
    //       {
    //         id: expect.any(String),
    //         title: post1.body.title,
    //         shortDescription: post1.body.shortDescription,
    //         content: post1.body.content,
    //         blogId: blog1.body.id,
    //         blogName: blog1.body.name,
    //         createdAt: expect.any(String),
    //       },
    //       {
    //         id: expect.any(String),
    //         title: post2.body.title,
    //         shortDescription: post2.body.shortDescription,
    //         content: post2.body.content,
    //         blogId: blog1.body.id,
    //         blogName: blog1.body.name,
    //         createdAt: expect.any(String),
    //       },
    //     ]),
    //   });
    // });
  });
});
