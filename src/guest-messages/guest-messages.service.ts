import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuestMessage } from './guest-message.entity';
import { CreateGuestMessageDto } from './dto/create-guest-message.dto';
import { Invitation } from '../invitation/invitation.entity';

@Injectable()
export class GuestMessagesService {
  constructor(
    @InjectRepository(GuestMessage)
    private readonly guestMessageRepo: Repository<GuestMessage>,

    @InjectRepository(Invitation)
    private readonly invitationRepo: Repository<Invitation>,
  ) {}

  async create(dto: CreateGuestMessageDto): Promise<GuestMessage> {
    const invitation = await this.invitationRepo.findOne({
      where: { id: dto.invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const guestMessage = this.guestMessageRepo.create({
      guestName: dto.guestName,
      message: dto.message,
      invitation,
    });

    return this.guestMessageRepo.save(guestMessage);
  }

  async findByInvitationId(invitationId: number): Promise<GuestMessage[]> {
    return this.guestMessageRepo.find({
      where: { invitation: { id: invitationId } },
      order: { createdAt: 'DESC' },
    });
  }
}
