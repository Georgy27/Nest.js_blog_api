import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersSuperAdminController } from './api/super-admin/users-super-admin.controller';
import { UsersService } from './users.service';
import { UsersQueryRepository } from './users.query.repository';
import { UsersRepository } from './users.repository';
import { CreateUserByAdminUseCase } from './use-cases/create-user-admin-use-case';
import { CqrsModule } from '@nestjs/cqrs';

const useCases = [CreateUserByAdminUseCase];
@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersSuperAdminController],
  providers: [UsersService, UsersQueryRepository, UsersRepository, ...useCases],
  exports: [UsersRepository, UsersService, UsersQueryRepository],
})
export class UsersModule {}
