import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create.user.dto';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly usersRepository: UsersRepository,
  ) {}
  async createUser(createUserDto: CreateUserDto): Promise<string> {
    const { password } = createUserDto;
    // generate salt and hash
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, passwordSalt);
    // create user
    const newUser = new this.userModel();
    newUser.createUser(createUserDto, passwordHash);

    return this.usersRepository.save(newUser);
  }
  async deleteUserById(id: string): Promise<boolean> {
    return this.usersRepository.deleteUserById(id);
  }
}
