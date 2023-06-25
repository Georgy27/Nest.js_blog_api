import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PasswordRecovery } from './passwordRecovery.entity';
import { EmailConfirmation } from './emailConfirmation.entity';
import { BanInfo } from './banInfo.entity';
import { Blogger } from './blogger.entity';
import { DeviceSessions } from '../../security-devices/entities/deviceSessions.entity';

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
  @CreateDateColumn({ type: 'varchar' })
  createdAt: string;
  @OneToOne(() => PasswordRecovery, (passwordRecovery) => passwordRecovery.user)
  passwordRecovery: PasswordRecovery;
  @OneToOne(
    () => EmailConfirmation,
    (emailConfirmation) => emailConfirmation.user,
  )
  emailConfirmation: EmailConfirmation;
  @OneToOne(() => BanInfo, (banInfo) => banInfo.user)
  banInfo: BanInfo;
  @OneToOne(() => Blogger, (blogger) => blogger.user)
  blogger: Blogger;
  @OneToMany(() => DeviceSessions, (deviceSessions) => deviceSessions.user)
  deviceSessions: DeviceSessions[];
}
