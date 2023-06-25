import { Injectable } from '@nestjs/common';
import { BaseTransaction } from '../../common/abstract-transaction-class';
import { DataSource, EntityManager } from 'typeorm';
import { User } from '../entities/user.entity';
import { AuthWithHash } from '../types/auth-with-hash';
import { EmailConfirmation } from '../entities/emailConfirmation.entity';
import { add } from 'date-fns';
import { randomUUID } from 'crypto';
import { BanInfo } from '../entities/banInfo.entity';
import { Blogger } from '../entities/blogger.entity';
import { PasswordRecovery } from '../entities/passwordRecovery.entity';
import { UserViewModel } from '../types/user.view.model';

@Injectable()
export class CreateUserTransaction extends BaseTransaction<
  AuthWithHash,
  UserViewModel
> {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  protected async execute(
    { login, email, hash }: AuthWithHash,
    manager: EntityManager,
  ) {
    const newUser = manager.create(User, {
      login: login,
      email: email,
      hash: hash,
    });

    await manager.save(newUser);

    const emailConfirmation = manager.create(EmailConfirmation, {
      confirmationCode: randomUUID(),
      expirationDate: add(new Date(), {
        minutes: 1,
      }).toISOString(),
      isConfirmed: false,
      userId: newUser.id,
    });

    await manager.save(emailConfirmation);

    const banInfo = manager.create(BanInfo, {
      isBanned: false,
      userId: newUser.id,
    });

    await manager.save(banInfo);

    const blogger = manager.create(Blogger, {
      bloggerId: newUser.id,
    });

    await manager.save(blogger);

    const passwordRecovery = manager.create(PasswordRecovery, {
      userId: newUser.id,
    });

    await manager.save(passwordRecovery);

    return {
      id: newUser.id,
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt,
      banInfo: {
        isBanned: banInfo.isBanned,
        banDate: banInfo.banDate,
        banReason: banInfo.banReason,
      },
    };
  }
}
