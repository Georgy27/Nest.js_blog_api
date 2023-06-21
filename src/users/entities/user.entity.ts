import {
  Column,
  Entity,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PasswordRecovery } from './passwordRecovery.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ unique: true })
  login: string;
  @Column({ unique: true })
  email: string;
  @Column()
  hash: string;
  @Column()
  createdAt: string;
  @OneToOne(() => PasswordRecovery, (passwordRecovery) => passwordRecovery.user)
  passwordRecovery: PasswordRecovery;
}
