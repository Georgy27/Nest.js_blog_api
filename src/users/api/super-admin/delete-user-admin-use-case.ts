import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../users.repository';

export class DeleteUserByAdminCommand {
  constructor(public userId: string) {}
}
@CommandHandler(DeleteUserByAdminCommand)
export class DeleteUserByAdminUseCase
  implements ICommandHandler<DeleteUserByAdminCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}
  async execute(command: DeleteUserByAdminCommand): Promise<boolean> {
    return this.usersRepository.deleteUserById(command.userId);
  }
}
