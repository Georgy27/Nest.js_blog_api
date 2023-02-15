import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create.user.dto';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly usersRepository: UsersRepository,
  ) {}
  async prepareUser(user: CreateUserDto, passwordHash: string): Promise<User> {
    return {
      id: randomUUID(),
      accountData: {
        login: user.login,
        email: user.email,
        passwordHash,
        createdAt: new Date().toISOString(),
      },
      passwordRecovery: {
        recoveryCode: null,
        expirationDate: null,
      },
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), {
          minutes: 1,
        }).toISOString(),
        isConfirmed: false,
      },
    };
  }
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { password } = createUserDto;
    // generate salt and hash
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, passwordSalt);
    // prepare user
    const preparedUser = await this.prepareUser(createUserDto, passwordHash);
    // create user
    return this.usersRepository.createUser(preparedUser);
  }
  async createUserByAdmin(createUserDto: CreateUserDto): Promise<string> {
    const { password, login, email } = createUserDto;
    // generate salt and hash
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, passwordSalt);
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
    // const newUser = new this.userModel();
    // newUser.createUser(createUserDto, passwordHash);
    //
    // return this.usersRepository.save(newUser);
    const preparedUser = await this.prepareUser(createUserDto, passwordHash);
    const newUser = await this.usersRepository.createUser(preparedUser);
    return newUser.id;
  }
  async deleteUserById(id: string): Promise<boolean> {
    return this.usersRepository.deleteUserById(id);
  }
  async updateConfirmation(user: UserDocument): Promise<string> {
    user.emailConfirmation.isConfirmed = true;
    return this.usersRepository.save(user);
  }
  async updateConfirmationCode(user: UserDocument): Promise<string> {
    user.emailConfirmation.confirmationCode = randomUUID();
    user.emailConfirmation.expirationDate = add(new Date(), {
      minutes: 1,
    }).toISOString();
    return this.usersRepository.save(user);
  }
}
