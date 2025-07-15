import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateGuestMessageDto {
  @IsNotEmpty()
  @IsInt()
  invitationId: number;

  @IsNotEmpty()
  @IsString()
  guestName: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsString()
  @IsNotEmpty()
  rsvpStatus: string;

  @IsInt()
  @IsNotEmpty()
  totalGuests: number;
}
