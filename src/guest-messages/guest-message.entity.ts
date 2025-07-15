import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { Invitation } from '../invitation/invitation.entity';

@Entity('guest_messages')
export class GuestMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  guestName: string;

  @Column('text')
  message: string;

  @Column('text')
  rsvpStatus: string;

  @Column('int')
  totalGuests: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Invitation, (invitation) => invitation.guestMessages, {
    onDelete: 'CASCADE',
  })
  invitation: Invitation;
}
