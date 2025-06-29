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

  @Column({ nullable: true })
  templateName: string;

  @Column({ default: false })
  isPublished: boolean;

  @Column({
    type: 'enum',
    enum: ['islam', 'katolik', 'kristen', 'budha', 'hindu', 'bebas'],
  })
  quoteSource: string;

  @Column({ nullable: true, type: 'text' })
  quoteText: string;

  @Column({ type: 'json' })
  loveStory: any; // bisa pakai array of objects, validasi di DTO

  @Column()
  musicChoice: string;

  @Column({ default: false })
  isCustomMusic: boolean;

  @Column()
  bridePhotoUrl: string;

  @Column({ type: 'json' })
  akadLocation: {
    mapUrl: string;
    description: string;
    dateTime: string;
  };

  @Column({ type: 'json' })
  resepsiLocation: {
    mapUrl: string;
    description: string;
    dateTime: string;
  };

  @Column({ default: false })
  mergeEvents: boolean;

  @Column({ default: false })
  encryptedGuestName: boolean;

  @Column({ nullable: true })
  floorPlanImageUrl: string;

  @Column({ type: 'json' })
  menu: {
    title: string;
    items: string[];
  };

  @Column({ type: 'json' })
  galleryImages: string[];

  @Column()
  giftDeliveryAddress: string;

  @Column({ nullable: true })
  eWalletLink: string;

  @Column({ type: 'json' })
  socialMedia: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    lainnya?: string;
  };

  @Column({ type: 'json' })
  parents: {
    brideParents: string;
    groomParents: string;
  };

  @Column({ nullable: true })
  liveStreamingLink: string;

  @Column({ default: true })
  enableGuestMessage: boolean;

  // Relasi user & template
  @ManyToOne(() => User, (user) => user.invitations, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => TemplateDesign, (template) => template.invitations, {
    nullable: true,
  })
  @JoinColumn({ name: 'templateDesignId' })
  templateDesign: TemplateDesign;

  @Column({ nullable: true })
  templateDesignId: number;

  @Column({ type: 'simple-array', nullable: true })
  selectedSections: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
