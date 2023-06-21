import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class PasswordRecovery {
  @PrimaryColumn({ unique: true })
  userId: string;
  @Column({ nullable: true })
  recoveryCode: string;
  @Column({ nullable: true })
  expirationDate: string;
  @OneToOne(() => User, (user) => user.passwordRecovery, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
