import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSQLRepository } from '../repositories/PostgreSQL/users.sql.repository';

export class DeleteUserByAdminCommand {
  constructor(public userId: string) {}
}
@CommandHandler(DeleteUserByAdminCommand)
export class DeleteUserByAdminUseCase
  implements ICommandHandler<DeleteUserByAdminCommand>
{
  constructor(private readonly usersSQLRepository: UsersSQLRepository) {}
  async execute(command: DeleteUserByAdminCommand) {
    return this.usersSQLRepository.deleteUserById(command.userId);
  }
}
