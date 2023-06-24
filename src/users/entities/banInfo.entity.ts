import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class BanInfo {
  @PrimaryColumn({ unique: true })
  userId: string;
  @Column()
  isBanned: boolean;
  @Column({ nullable: true })
  banDate: string;
  @Column({ nullable: true })
  banReason: string;
  @OneToOne(() => User, (user) => user.banInfo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
