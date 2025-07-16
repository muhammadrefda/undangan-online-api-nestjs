import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Invitation } from '../../invitation/invitation.entity';

@Entity('guest')
export class Guest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  degree: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  group: string;

  @Column({ name: 'status_send', nullable: true })
  statusSend: string;

  @ManyToOne(() => Invitation, (invitation) => invitation.guests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invitation_id' })
  invitation: Invitation;
}
