import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class EmailConfirmation {
  @PrimaryColumn({ unique: true })
  userId: string;
  @Column()
  confirmationCode: string;
  @Column()
  expirationDate: string;
  @Column()
  isConfirmed: boolean;
  @OneToOne(() => User, (user) => user, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
