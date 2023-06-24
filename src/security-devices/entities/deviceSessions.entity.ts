import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class DeviceSessions {
  @PrimaryColumn({ unique: true })
  deviceId: string;
  @Column()
  ip: string;
  @Column()
  deviceName: string;
  @Column()
  lastActiveDate: string;
  @ManyToOne(() => User, (user) => user.deviceSessions, {
    onDelete: 'CASCADE',
  })
  user: User;
  @Column()
  userId: string;
}
