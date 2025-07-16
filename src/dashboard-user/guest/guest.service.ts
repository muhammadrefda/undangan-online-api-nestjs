import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guest } from './guest.entity';
import { Invitation } from 'src/invitation/invitation.entity';
import { CreateGuestDto } from './dto/create-guest.dto';
import * as xlsx from 'xlsx';
import * as fs from 'fs';

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

    const guest = this.guestRepo.create({
      name: dto.name,
      degree: dto.degree,
      phoneNumber: dto.phoneNumber,
      slug: dto.slug,
      group: dto.group,
      statusSend: dto.statusSend,
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
      const slug = ((row['Slug'] as string) || '').toString();
      const group = ((row['Group'] as string) || '').toString();
      const statusSend = ((row['Status Send'] as string) || '').toString();
      const invitationId = Number(row['Invitation ID']);

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
        invitation: { id: invitationId } as Invitation,
      });

      guestsToSave.push(guest);
    }

    return this.guestRepo.save(guestsToSave);
  }
}
