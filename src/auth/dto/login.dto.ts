import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail()
  @ApiProperty({
    description: 'The email address of the user',
    example: 'john@mail.com',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'The password for the user account',
    example: 'password123',
  })
  password: string;
}
