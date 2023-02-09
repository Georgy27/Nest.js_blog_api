import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CreateUserDto } from '../dto/create.user.dto';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { IAccountData, IEmailConfirmation, IPasswordRecovery } from './index';

export type UserDocument = HydratedDocument<User>;

@Schema({ versionKey: false })
export class User {
  @Prop({ required: true, unique: true })
  id: string;
  @Prop(
    raw({
      login: { required: true, unique: true, type: String },
      email: { required: true, unique: true, type: String },
      passwordHash: { required: true, type: String },
      createdAt: { required: true, type: String },
    }),
  )
  accountData: IAccountData;
  @Prop(
    raw({
      recoveryCode: { type: String },
      expirationDate: { type: String },
    }),
  )
  passwordRecovery: IPasswordRecovery;
  @Prop(
    raw({
      confirmationCode: { required: true, type: String },
      expirationDate: { required: true, type: String },
      isConfirmed: { required: true, type: Boolean },
    }),
  )
  emailConfirmation: IEmailConfirmation;

  createUser(createUserDto: CreateUserDto, passwordHash: string) {
    this.id = randomUUID();
    this.accountData = {
      login: createUserDto.login,
      email: createUserDto.email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    this.passwordRecovery = {
      recoveryCode: null,
      expirationDate: null,
    };
    this.emailConfirmation = {
      confirmationCode: randomUUID(),
      expirationDate: add(new Date(), {
        minutes: 1,
      }).toISOString(),
      isConfirmed: false,
    };
  }
}
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.methods = {
  createUser: User.prototype.createUser,
};
