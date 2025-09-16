import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from '../user/user.entity';
import { Invitation } from '../invitation/invitation.entity';
import { Guest } from '../dashboard-user/guest/guest.entity';
import { GuestMessage } from '../guest-messages/guest-message.entity';
import { TemplateDesign } from '../template-design/template-design.entity';
import { CreateTemplateDesignDto, UpdateTemplateDesignDto } from './dto/template-design.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Invitation) private readonly invitationRepo: Repository<Invitation>,
    @InjectRepository(Guest) private readonly guestRepo: Repository<Guest>,
    @InjectRepository(GuestMessage) private readonly guestMessageRepo: Repository<GuestMessage>,
    @InjectRepository(TemplateDesign)
    private readonly templateDesignRepo: Repository<TemplateDesign>,
  ) {}

  // Users
  async listUsers(page = 1, limit = 20, q?: string) {
    const where = q
      ? [{ name: ILike(`%${q}%`) }, { email: ILike(`%${q}%`) }]
      : undefined;
    const [data, total] = await this.userRepo.findAndCount({
      where,
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async getUser(id: number) {
    const found = await this.userRepo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('User not found');
    return found;
  }

  async createUser(payload: Partial<User> & { password?: string }) {
    if (payload.email) {
      const existing = await this.userRepo.findOne({ where: { email: payload.email } });
      if (existing) throw new BadRequestException('Email already exists');
    }
    const user = this.userRepo.create(payload);
    if (payload.password) {
      user.password = await bcrypt.hash(payload.password, 10);
      user.provider = user.provider || 'local';
    }
    return this.userRepo.save(user);
  }

  async updateUser(id: number, payload: Partial<User> & { password?: string }) {
    const user = await this.getUser(id);
    if (payload.email && payload.email !== user.email) {
      const exists = await this.userRepo.findOne({ where: { email: payload.email } });
      if (exists) throw new BadRequestException('Email already exists');
    }
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
      payload.provider = payload.provider || 'local';
    }
    Object.assign(user, payload);
    return this.userRepo.save(user);
  }

  async deleteUser(id: number) {
    const user = await this.getUser(id);
    await this.userRepo.remove(user);
    return { success: true };
  }

  // Invitations
  async listInvitations(page = 1, limit = 20, q?: string) {
    const where = q ? [{ title: ILike(`%${q}%`) }, { coupleName: ILike(`%${q}%`) }, { slug: ILike(`%${q}%`) }] : undefined;
    const [data, total] = await this.invitationRepo.findAndCount({
      where,
      order: { id: 'DESC' },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async getInvitation(id: number) {
    const found = await this.invitationRepo.findOne({ where: { id }, relations: ['user'] });
    if (!found) throw new NotFoundException('Invitation not found');
    return found;
  }

  async deleteInvitation(id: number) {
    const inv = await this.getInvitation(id);
    await this.invitationRepo.remove(inv);
    return { success: true };
  }

  // Guests
  async listGuests(page = 1, limit = 20, q?: string) {
    const where = q ? [{ name: ILike(`%${q}%`) }, { phoneNumber: ILike(`%${q}%`) }, { slug: ILike(`%${q}%`) }] : undefined;
    const [data, total] = await this.guestRepo.findAndCount({
      where,
      relations: ['invitation'],
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async getGuest(id: number) {
    const found = await this.guestRepo.findOne({ where: { id }, relations: ['invitation'] });
    if (!found) throw new NotFoundException('Guest not found');
    return found;
  }

  async updateGuest(id: number, payload: Partial<Guest>) {
    const guest = await this.getGuest(id);
    Object.assign(guest, payload);
    return this.guestRepo.save(guest);
  }

  async deleteGuest(id: number) {
    const guest = await this.getGuest(id);
    await this.guestRepo.remove(guest);
    return { success: true };
  }

  // Guest Messages
  async listGuestMessages(page = 1, limit = 20, q?: string) {
    const where = q ? [{ guestName: ILike(`%${q}%`) }, { message: ILike(`%${q}%`) }] : undefined;
    const [data, total] = await this.guestMessageRepo.findAndCount({
      where,
      relations: ['invitation', 'guest'],
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async deleteGuestMessage(id: number) {
    const gm = await this.guestMessageRepo.findOne({ where: { id } });
    if (!gm) throw new NotFoundException('Guest message not found');
    await this.guestMessageRepo.remove(gm);
    return { success: true };
  }

  // Template Designs
  async listTemplateDesigns(page = 1, limit = 20, q?: string) {
    const where = q
      ? [
          { name: ILike(`%${q}%`) },
          { slug: ILike(`%${q}%`) },
          { category: ILike(`%${q}%`) },
        ]
      : undefined;
    const [data, total] = await this.templateDesignRepo.findAndCount({
      where,
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: data.map((template) => this.transformTemplateDesign(template)),
      total,
      page,
      limit,
    };
  }

  async getTemplateDesign(id: number) {
    const template = await this.templateDesignRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template design not found');
    return this.transformTemplateDesign(template);
  }

  async createTemplateDesign(payload: CreateTemplateDesignDto) {
    const data = this.normalizeTemplateDesignPayload(payload);
    const template = this.templateDesignRepo.create(data);
    const saved = await this.templateDesignRepo.save(template);
    return this.transformTemplateDesign(saved);
  }

  async updateTemplateDesign(id: number, payload: UpdateTemplateDesignDto) {
    const template = await this.templateDesignRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template design not found');
    const data = this.normalizeTemplateDesignPayload(payload);
    Object.assign(template, data);
    const saved = await this.templateDesignRepo.save(template);
    return this.transformTemplateDesign(saved);
  }

  async deleteTemplateDesign(id: number) {
    const template = await this.templateDesignRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template design not found');
    await this.templateDesignRepo.remove(template);
    return { success: true };
  }

  private normalizeTemplateDesignPayload(
    payload: Partial<CreateTemplateDesignDto | UpdateTemplateDesignDto>,
  ): Partial<TemplateDesign> {
    const data: Partial<TemplateDesign> & Record<string, any> = { ...payload };


    if (data.paletteColor && typeof data.paletteColor !== 'string') {
      data.paletteColor = JSON.stringify(data.paletteColor);
    }

    if (data.sectionOptions && typeof data.sectionOptions !== 'string') {
      data.sectionOptions = JSON.stringify(data.sectionOptions);
    }

    if (data.tags) {
      if (Array.isArray(data.tags)) {
        data.tags = JSON.stringify(data.tags);
      } else if (typeof data.tags !== 'string') {
        data.tags = JSON.stringify(data.tags);
      }
    }

    return data as Partial<TemplateDesign>;
  }

  private transformTemplateDesign(template: TemplateDesign) {
    const result = { ...template } as TemplateDesign & Record<string, any>;
    result.paletteColor = this.safeParse(template.paletteColor);
    result.tags = this.safeParse(template.tags);
    result.sectionOptions = this.safeParse(template.sectionOptions);
    return result;
  }

  private safeParse(value?: string | null) {
    if (value === null || value === undefined) return value;
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return value;
    try {
      return JSON.parse(trimmed);
    } catch (err) {
      return value;
    }
  }
}
