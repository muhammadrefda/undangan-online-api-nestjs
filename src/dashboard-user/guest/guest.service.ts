import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guest } from './guest.entity';
import { Invitation } from 'src/invitation/invitation.entity';
import { CreateGuestDto } from './dto/create-guest.dto';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import { slugify } from 'transliteration';

@Injectable()
export class GuestService {
  constructor(
    @InjectRepository(Guest)
    private readonly guestRepo: Repository<Guest>,
    @InjectRepository(Invitation)
    private readonly invitationRepo: Repository<Invitation>,
  ) {}

  async create(dto: CreateGuestDto): Promise<Guest> {
    const invitation = await this.invitationRepo.findOne({
      where: { id: dto.invitationId },
    });

    if (!invitation) {
      throw new NotFoundException(
        `Invitation with ID ${dto.invitationId} not found.`,
      );
    }

    const slug =
      dto.slug && dto.slug.trim().length > 0
        ? dto.slug
        : await this.generateUniqueSlug(dto.name, dto.invitationId);

    const guest = this.guestRepo.create({
      name: dto.name,
      degree: dto.degree,
      phoneNumber: dto.phoneNumber,
      slug,
      group: dto.group,
      statusSend: dto.statusSend,
      rsvpStatus: dto.rsvpStatus ?? 'belum',
      invitation,
    });

    return this.guestRepo.save(guest);
  }

  async findAllByInvitation(invitationId: number): Promise<Guest[]> {
    return this.guestRepo.find({
      where: { invitation: { id: invitationId } },
      order: { id: 'ASC' },
    });
  }

  async remove(id: number): Promise<void> {
    const guest = await this.guestRepo.findOne({ where: { id } });
    if (!guest) {
      throw new NotFoundException(`Guest with ID ${id} not found.`);
    }

    await this.guestRepo.remove(guest);
  }

  async importFromExcel(filepath: string): Promise<Guest[]> {
    let buffer: Buffer;
    try {
      buffer = fs.readFileSync(filepath);
    } catch (error) {
      throw new Error(
        `Failed to read Excel file at ${filepath}. Error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
    const workbook = xlsx.read(buffer, { type: 'buffer' });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (workbook.SheetNames.length === 0) {
      throw new Error('No sheets found in the Excel workbook.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const sheetName: string = workbook.SheetNames[0];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      throw new Error(`Sheet '${sheetName}' not found in the workbook.`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
    const rows: Record<string, unknown>[] = xlsx.utils.sheet_to_json(
      sheet,
    ) as Record<string, unknown>[];

    const guestsToSave: Guest[] = [];

    for (const row of rows) {
      if (typeof row !== 'object' || row === null) {
        console.warn('Skipping non-object row:', row);
        continue;
      }

      const name = ((row['Name'] as string) || '').toString();
      const degree = ((row['Degree'] as string) || '').toString();
      const phoneNumber = ((row['Phone Number'] as string) || '').toString();
      const rawSlug = ((row['Slug'] as string) || '').toString().trim();
      const invitationId = Number(row['Invitation ID']);
      const slug =
        rawSlug || (await this.generateUniqueSlug(name, invitationId));
      const group = ((row['Group'] as string) || '').toString();
      const statusSend = ((row['Status Send'] as string) || '').toString();
      const rsvpStatus = ((row['RSVP Status'] as string) || 'belum').toString();

      if (!name || isNaN(invitationId) || !slug) {
        console.warn(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `Skipping row due to missing or invalid required data: Name="${name}", Invitation ID="${row['Invitation ID']}", Slug="${slug}"`,
          row,
        );
        continue;
      }

      const guest = this.guestRepo.create({
        name,
        degree,
        phoneNumber,
        slug,
        group,
        statusSend,
        rsvpStatus,
        invitation: { id: invitationId } as Invitation,
      });

      guestsToSave.push(guest);
    }

    return this.guestRepo.save(guestsToSave);
  }

  async generateUniqueSlug(
    name: string,
    invitationId: number,
  ): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const baseSlug = slugify(name.toLowerCase());
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let slug = baseSlug;
    let counter = 1;

    while (
      await this.guestRepo.findOne({
        where: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          slug,
          invitation: { id: invitationId },
        },
      })
    ) {
      slug = `${baseSlug}-${counter++}`;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return slug;
  }

  async buildInviteUrlForGuest(guestId: number): Promise<{ url: string }> {
    const guest = await this.guestRepo.findOne({
      where: { id: guestId },
      relations: ['invitation'],
    });
    if (!guest) throw new NotFoundException('Guest not found');
    const base = process.env.FRONTEND_URL || 'https://satuundangan.id';
    const invitationSlug = guest.invitation?.slug;
    if (!invitationSlug) throw new NotFoundException('Invitation slug missing');

    let url = `${base.replace(/\/$/, '')}/inv/${invitationSlug}/${guest.slug}`;
    if (guest.invitation.encryptedGuestName) {
      const encoded = Buffer.from(guest.name, 'utf-8').toString('base64');
      url += `?e=${encodeURIComponent(encoded)}`;
    }
    return { url };
  }

  async buildWhatsAppLink(
    guestId: number,
  ): Promise<{ url: string; waLink: string; message: string }> {
    const { url } = await this.buildInviteUrlForGuest(guestId);
    const guest = await this.guestRepo.findOne({ where: { id: guestId } });
    if (!guest) throw new NotFoundException('Guest not found');
    const name = guest.name?.split(' ')[0] || 'Teman';
    const message = `Hai ${name}! Ini undangan pernikahan kami 🎉\nKlik untuk lihat: ${url}`;
    const phone = (guest.phoneNumber || '').replace(/[^0-9]/g, '');
    const waNumber = phone.startsWith('0')
      ? `62${phone.slice(1)}`
      : phone.startsWith('62')
        ? phone
        : phone;
    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    return { url, waLink, message };
  }

  async findAllByInvitationWithMessages(invitationId: number): Promise<
    {
      id: number;
      name: string;
      phoneNumber: string;
      slug: string;
      rsvpStatus: string;
      firstVisitAt: Date | null;
      lastMessage?: string | null;
    }[]
  > {
    const guests = await this.guestRepo.find({
      where: { invitation: { id: invitationId } },
      relations: ['messages'],
      order: { id: 'ASC' },
    });

    return guests.map((g) => ({
      id: g.id,
      name: g.name,
      phoneNumber: g.phoneNumber,
      slug: g.slug,
      rsvpStatus: g.rsvpStatus,
      firstVisitAt: g.firstVisitAt ?? null,
      lastMessage:
        g.messages && g.messages.length > 0
          ? g.messages.sort(
              (a, b) =>
                (b.createdAt?.getTime?.() || 0) -
                (a.createdAt?.getTime?.() || 0),
            )[0].message
          : null,
    }));
  }
}
