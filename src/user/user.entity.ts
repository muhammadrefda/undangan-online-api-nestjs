import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Invitation } from '../invitation/invitation.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  provider: string;

  @OneToMany(() => Invitation, (invitation) => invitation.user, {
    onDelete: 'CASCADE',
  })
  invitations: Invitation[];
}
