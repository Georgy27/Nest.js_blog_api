import {
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../../users.service';
import { UsersQueryRepository } from '../../users.query.repository';
import { CommandBus } from '@nestjs/cqrs';
import { BanUserByBloggerDto } from '../../dto/ban.user.blogger.dto';
import { BanOrUnbanUserByBloggerCommand } from '../../use-cases/ban-unban-user-blogger-use-case';
import { AuthGuard } from '@nestjs/passport';
import { GetJwtAtPayloadDecorator } from '../../../common/decorators/getJwtAtPayload.decorator';
import { JwtAtPayload } from '../../../auth/strategies';

@UseGuards(AuthGuard('jwt'))
@Controller('blogger/users')
export class UsersBloggerController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}
  @Put(':id/ban')
  @HttpCode(204)
  async banOrUnbanUser(
    @Param('id') id: string,
    @Body() banUserByBloggerDto: BanUserByBloggerDto,
    @GetJwtAtPayloadDecorator() jwtAtPayload: JwtAtPayload,
  ) {
    return this.commandBus.execute(
      new BanOrUnbanUserByBloggerCommand(
        id,
        banUserByBloggerDto,
        jwtAtPayload.userId,
      ),
    );
  }
}
