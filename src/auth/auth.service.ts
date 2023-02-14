import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async registration(user: AuthDto) {
    const { login, email } = user;
    // check that user with the given login or email does not exist
    const checkUserLogin = await this.usersRepository.findUserByLogin(login);
    if (checkUserLogin)
      throw new BadRequestException([
        { message: 'This login already exists', field: 'login' },
      ]);
    const checkUserEmail = await this.usersRepository.findUserByEmail(email);
    if (checkUserEmail)
      throw new BadRequestException([
        { message: 'This email already exists', field: 'email' },
      ]);
    // create user
    const newUser: User = await this.usersService.createUser(user);

    // send email
    // const email = await this.sendEmailService
  }
}
