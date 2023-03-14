import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../../users.service';
import { UsersQueryRepository } from '../../repositories/mongo/users.query.repository';
import { UsersPaginationQueryDto } from '../../../helpers/pagination/dto/users.pagination.query.dto';
import { CreateUserDto } from '../../dto/create.user.dto';
import { BasicAuthGuard } from '../../../common/guards/basic.auth.guard';
import { PaginationViewModel } from '../../../helpers/pagination/pagination.view.model.wrapper';
import { UserViewModel } from '../../types/user.view.model';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserByAdminCommand } from '../../use-cases/create-user-admin-use-case';
import { DeleteUserByAdminCommand } from '../../use-cases/delete-user-admin-use-case';
import { BanUserDto } from '../../dto/ban.user.dto';
import { BanOrUnbanUserByAdminCommand } from '../../use-cases/ban-unban-user-admin-user-case';
import { UsersSQLQueryRepository } from '../../repositories/PostgreSQL/users.sql.query.repository';

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class UsersSuperAdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersSQLQueryRepository: UsersSQLQueryRepository,
    private commandBus: CommandBus,
  ) {}
  @Get()
  async getAllUsers(@Query() usersPaginationDto: UsersPaginationQueryDto) {
    return this.usersSQLQueryRepository.findUsers(usersPaginationDto);
  }
  @Post()
  @HttpCode(201)
  async createUserByAdmin(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserViewModel> {
    return this.commandBus.execute(new CreateUserByAdminCommand(createUserDto));
  }
  @Put(':id/ban')
  @HttpCode(204)
  async banOrUnbanUser(
    @Param('id') id: string,
    @Body() banUserDto: BanUserDto,
  ) {
    return this.commandBus.execute(
      new BanOrUnbanUserByAdminCommand(id, banUserDto),
    );
  }
  @Delete(':id')
  @HttpCode(204)
  async deleteUserByAdmin(@Param('id') id: string): Promise<void> {
    const deletedUser: boolean = await this.commandBus.execute(
      new DeleteUserByAdminCommand(id),
    );
    if (!deletedUser) throw new NotFoundException();
    return;
  }
}
