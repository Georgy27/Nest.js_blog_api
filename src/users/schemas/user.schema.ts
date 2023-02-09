import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// @Schema({ versionKey: false })
// class AccountData {
//   @Prop({ required: true, unique: true, type: String })
//   login: string;
//   @Prop({ required: true, unique: true, type: String })
//   email: string;
//   @Prop({ required: true, type: String })
//   passwordHash: string;
//   @Prop({ required: true, type: String })
//   createdAt: string;
// }
// export const AccountDataSchema = SchemaFactory.createForClass(AccountData);
//
// @Schema({ versionKey: false })
// class PasswordRecovery {
//   @Prop({ required: true, type: String })
//   recoveryCode: string;
//   @Prop({ required: true, type: String })
//   expirationDate: string;
// }
// export const PasswordRecoverySchema =
//   SchemaFactory.createForClass(PasswordRecovery);
//
// @Schema({ versionKey: false })
// class EmailConfirmation {
//   @Prop({ required: true, type: String })
//   confirmationCode: string;
//   @Prop({ required: true, type: String })
//   expirationDate: string;
//   @Prop({ required: true, type: Boolean })
//   isConfirmed: boolean;
// }
// export const EmailConfirmationSchema =
//   SchemaFactory.createForClass(EmailConfirmation);

export type UserDocument = HydratedDocument<User>;

@Schema({ id: false, versionKey: false })
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
  accountData: Record<string, string>;
  @Prop(
    raw({
      recoveryCode: { required: true, type: String },
      expirationDate: { required: true, type: String },
    }),
  )
  passwordRecovery: Record<string, string>;
  @Prop(
    raw({
      confirmationCode: { required: true, type: String },
      expirationDate: { required: true, type: String },
      isConfirmed: { required: true, type: Boolean },
    }),
  )
  emailConfirmation: Record<string, string | boolean>;
}
export const UserSchema = SchemaFactory.createForClass(User);
