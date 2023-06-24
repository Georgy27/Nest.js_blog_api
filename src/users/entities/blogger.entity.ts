import { Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Blogger {
  @PrimaryColumn({ unique: true })
  bloggerId: string;
  @OneToOne(() => User, (user) => user.blogger, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
