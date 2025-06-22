import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { TemplateDesign } from '../template-design/template-design.entity';

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true, unique: true })
  slug: string;

  @Column({ nullable: true })
  coupleName: string;

  @Column({ nullable: true, type: 'datetime' })
  date: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  musicUrl: string;

  @Column({ nullable: true })
  templateName: string;

  @Column({ default: false })
  isPublished: boolean;

  @ManyToOne(() => User, (user) => user.invitations, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => TemplateDesign, (template) => template.invitations, {
    nullable: true,
  })
  @JoinColumn({ name: 'templateDesignId' })
  templateDesign: TemplateDesign;

  @Column({ nullable: true })
  templateDesignId: number;
}
