import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Invitation } from 'src/invitation/invitation.entity';

@Entity()
export class Guest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    degree: string;

    @Column()
    phone: string;

    @Column({ unique: true })
    slug: string;

    @Column()
    group: string;

    @Column({ default: 'pending' })
    statusSend: string;

    @ManyToOne(() => Invitation, invitation => invitation.guests)
    invitation: Invitation;
    
    
    @CreateDateColumn()
      createdAt: Date;
    
      @UpdateDateColumn()
      updatedAt: Date;
}