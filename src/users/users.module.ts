import { forwardRef, Inject, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersSuperAdminController } from './api/super-admin/users-super-admin.controller';
import { UsersService } from './users.service';
import { UsersQueryRepository } from './repositories/mongo/users.query.repository';
import { UsersRepository } from './repositories/mongo/users.repository';
import { CreateUserByAdminUseCase } from './use-cases/create-user-admin-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { BanOrUnbanUserByAdminUseCase } from './use-cases/ban-unban-user-admin-user-case';
import { SecurityDevicesModule } from '../security-devices/security.devices.module';
import { CommentsModule } from '../comments/comments.module';
import { ReactionsModule } from '../reactions/reactions.module';
import { DeleteUserByAdminUseCase } from './use-cases/delete-user-admin-use-case';
import { UsersBloggerController } from './api/blogger/users-blogger.controller';
import { BanOrUnbanUserByBloggerUseCase } from './use-cases/ban-unban-user-blogger-use-case';
import { BlogsModule } from '../blogs/blogs.module';
import { UsersSQLRepository } from './repositories/PostgreSQL/users.sql.repository';
import { UsersSQLQueryRepository } from './repositories/PostgreSQL/users.sql.query.repository';

const useCases = [
  CreateUserByAdminUseCase,
  BanOrUnbanUserByAdminUseCase,
  BanOrUnbanUserByBloggerUseCase,
  DeleteUserByAdminUseCase,
];
@Module({
  imports: [
    forwardRef(() => CommentsModule),
    forwardRef(() => BlogsModule),
    CqrsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SecurityDevicesModule,
    ReactionsModule,
  ],
  controllers: [UsersSuperAdminController, UsersBloggerController],
  providers: [
    UsersService,
    UsersQueryRepository,
    UsersRepository,
    UsersSQLRepository,
    UsersSQLQueryRepository,
    ...useCases,
  ],
  exports: [
    UsersRepository,
    UsersService,
    UsersQueryRepository,
    UsersSQLRepository,
    UsersSQLQueryRepository,
  ],
})
export class UsersModule {}
