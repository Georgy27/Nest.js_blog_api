import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { UsersQueryRepository } from '../users.query.repository';
import { UsersPaginationQueryDto } from '../../helpers/pagination/dto/users.pagination.query.dto';
import { CreateUserDto } from '../dto/create.user.dto';
import { BasicAuthGuard } from '../../guards/basic.auth.guard';
import { PaginationViewModel } from '../../helpers/pagination/pagination.view.model.wrapper';
import { UserViewModel } from '../types/user.view.model';

@UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}
  @Get()
  async getAllUsers(
    @Query() usersPaginationDto: UsersPaginationQueryDto,
  ): Promise<PaginationViewModel<UserViewModel[]>> {
    return this.usersQueryRepository.findUsers(usersPaginationDto);
  }
  @Post()
  @HttpCode(201)
  async createUserByAdmin(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserViewModel> {
    const userId = await this.usersService.createUserByAdmin(createUserDto);
    return this.usersQueryRepository.findUser(userId);
  }
  @Delete(':id')
  @HttpCode(204)
  async deleteUserById(@Param('id') id: string): Promise<void> {
    const deletedUser = await this.usersService.deleteUserById(id);
    if (!deletedUser) throw new NotFoundException();
    return;
  }
}
