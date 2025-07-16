import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateGuestDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  degree?: string;

  @IsOptional()
  phoneNumber?: string;

  @IsNotEmpty()
  slug: string;

  @IsOptional()
  group?: string;

  @IsOptional()
  statusSend?: string;

  @IsNotEmpty()
  @IsNumber()
  invitationId: number;
}
