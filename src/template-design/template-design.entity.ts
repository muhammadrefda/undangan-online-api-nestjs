import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Invitation } from '../invitation/invitation.entity';

@Entity('template_designs')
export class TemplateDesign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  previewUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 20 })
  category: string;

  @OneToMany(() => Invitation, (invitation) => invitation.templateDesign)
  invitations: Invitation[];
}
