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
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { UsersQueryRepository } from '../users.query.repository';
import { UsersPaginationQueryDto } from '../../helpers/pagination/dto/users.pagination.query.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination.view.model.wrapper';
import { User } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/create.user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}
  @Get()
  async getAllUsers(@Query() usersPaginationDto: UsersPaginationQueryDto) {
    return this.usersQueryRepository.findUsers(usersPaginationDto);
  }
  @Post()
  @HttpCode(201)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const userId = await this.usersService.createUser(createUserDto);
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