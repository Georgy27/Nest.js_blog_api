import { AuthDto } from '../../../auth/dto/auth.dto';
import { LoginDto } from '../../../auth/dto/login.dto';

export const authStub = {
  registration(): AuthDto {
    return {
      login: 'George123',
      password: 'George123',
      email: 'Georgetest@yandex.ru',
    };
  },
  login(): LoginDto {
    return {
      loginOrEmail: 'George123',
      password: 'George123',
    };
  },
  getUser() {},
};
