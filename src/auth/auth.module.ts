import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { JwtAtStrategy } from './strategies/jwt.at.strategy';
import { JwtRtStrategy } from './strategies/jwt.rt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { SecurityDevicesModule } from '../security-devices/security.devices.module';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterUserUseCase } from './use-cases/register-user-use-case';
import { ConfirmEmailUseCase } from './use-cases/confirm-emal-use-case';
import { RegistrationEmailResendingUseCase } from './use-cases/registration-email-resending-use-case';
import { LoginUserUseCase } from './use-cases/login-user-use-case';
import { LogoutUserUseCase } from './use-cases/logout-user-use-case';
import { PasswordRecoveryUseCase } from './use-cases/user-password-recovery-use-case';

const useCases = [
  RegisterUserUseCase,
  ConfirmEmailUseCase,
  RegistrationEmailResendingUseCase,
  LoginUserUseCase,
  LogoutUserUseCase,
  PasswordRecoveryUseCase,
];
@Module({
  imports: [
    CqrsModule,
    UsersModule,
    SecurityDevicesModule,
    MailModule,
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAtStrategy, JwtRtStrategy, ...useCases],
  exports: [],
})
export class AuthModule {}
