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
  
  @Column()
  thumbnailUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 20 })
  category: string;

  @Column({ type: 'text', nullable: true })
  paletteColor: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  tags: string;

  @Column({ type: 'text', nullable: true })
  sectionOptions: string;

  @OneToMany(() => Invitation, (invitation) => invitation.templateDesign)
  invitations: Invitation[];
}
