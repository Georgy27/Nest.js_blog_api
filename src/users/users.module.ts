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
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordRecovery } from './entities/passwordRecovery.entity';
import { BanInfo } from './entities/banInfo.entity';
import { Blogger } from './entities/blogger.entity';
import { EmailConfirmation } from './entities/emailConfirmation.entity';
import { CreateUserTransaction } from './transactions/create-user.transaction';
import { BaseTransaction } from '../common/abstract-transaction-class';
import { User as UserEntity } from './entities/user.entity';

const useCases = [
  CreateUserByAdminUseCase,
  BanOrUnbanUserByAdminUseCase,
  BanOrUnbanUserByBloggerUseCase,
  DeleteUserByAdminUseCase,
];
// const CreateUserTransactionProvider = {
//   provide: BaseTransaction,
//   useClass: CreateUserTransaction,
// };
// const adapters = [CreateUserTransactionProvider];
@Module({
  imports: [
    forwardRef(() => CommentsModule),
    forwardRef(() => BlogsModule),
    CqrsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    TypeOrmModule.forFeature([
      UserEntity,
      PasswordRecovery,
      BanInfo,
      Blogger,
      EmailConfirmation,
    ]),
    SecurityDevicesModule,
    ReactionsModule,
    BlogsModule,
  ],
  controllers: [UsersSuperAdminController, UsersBloggerController],
  providers: [
    UsersService,
    UsersQueryRepository,
    UsersRepository,
    UsersSQLRepository,
    UsersSQLQueryRepository,
    CreateUserTransaction,
    ...useCases,
  ],
  exports: [
    UsersRepository,
    UsersService,
    UsersQueryRepository,
    UsersSQLRepository,
    UsersSQLQueryRepository,
    CreateUserTransaction,
  ],
})
export class UsersModule {}
