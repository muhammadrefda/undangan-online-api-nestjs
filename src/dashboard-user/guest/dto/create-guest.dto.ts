import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateGuestDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  degree?: string;

  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  slug?: string;

  @IsOptional()
  group?: string;

  @IsOptional()
  statusSend?: string;

  @IsOptional()
  @IsString()
  rsvpStatus?: string;

  @IsNotEmpty()
  @IsNumber()
  invitationId: number;
}
