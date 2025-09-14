import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from './invitation.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { User } from '../user/user.entity';
import slugify from 'slugify';
import { Guest } from '../dashboard-user/guest/guest.entity';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepo: Repository<Invitation>,
    @InjectRepository(Guest)
    private readonly guestRepo: Repository<Guest>,
  ) {}

  async create(dto: CreateInvitationDto, user: User): Promise<Invitation> {
    const invitation = this.invitationRepo.create({ ...dto, user });
    // Slug generation
    if (!dto.slug) {
      const base: string = slugify(dto.coupleName || dto.title || 'undangan', {
        lower: true,
        strict: true,
      });

      let slug = base;
      let count = 1;

      while (await this.invitationRepo.findOne({ where: { slug } })) {
        slug = `${base}-${count++}`;
      }

      invitation.slug = slug;
    } else {
      // Jika slug dikirim manual, tetap pastikan tidak duplikat
      const existing = await this.invitationRepo.findOne({
        where: { slug: dto.slug },
      });

      if (existing) {
        throw new ConflictException('Slug already in use');
      }

      invitation.slug = dto.slug;
    }
    return this.invitationRepo.save(invitation);
  }

  async findAllByUser(userId: number): Promise<Invitation[]> {
    return this.invitationRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneById(id: number): Promise<Invitation> {
    const invitation = await this.invitationRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!invitation) throw new NotFoundException('Invitation not found');
    return invitation;
  }

  async update(id: number, dto: UpdateInvitationDto): Promise<Invitation> {
    const invitation = await this.findOneById(id);
    Object.assign(invitation, dto);
    return this.invitationRepo.save(invitation);
  }

  async remove(id: number): Promise<void> {
    const invitation = await this.findOneById(id);
    await this.invitationRepo.remove(invitation);
  }

  async findBySlug(slug: string): Promise<Invitation> {
    const invitation = await this.invitationRepo.findOne({
      where: { slug },
      relations: ['user'], // jika kamu ingin tampilkan info pembuat undangan
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return invitation;
  }

  async findWithGuest(invitationSlug: string, guestSlug: string) {
    const invitation = await this.invitationRepo.findOne({
      where: { slug: invitationSlug },
      relations: ['guests'],
    });

    if (!invitation) throw new NotFoundException('Invitation not found');

    const guest = invitation.guests.find((g) => g.slug === guestSlug);
    if (!guest) throw new NotFoundException('Guest not found');

    // track first visit and increment visit count
    const needsUpdate = !guest.firstVisitAt;
    guest.visitCount = (guest.visitCount || 0) + 1;
    if (!guest.firstVisitAt) {
      guest.firstVisitAt = new Date();
    }
    await this.guestRepo.save(guest);

    return { invitation, guest, tracked: { updatedFirstVisit: needsUpdate } };
  }
}
