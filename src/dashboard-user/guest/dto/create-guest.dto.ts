import {
    IsString,
    IsEmail,
    isString,
} from "class-validator";
import { 
    ApiProperty, 
    ApiPropertyOptional 
} from '@nestjs/swagger';

export class CreateGuestDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'Bapak Ir. John Doe' })
    @IsString()
    degree: string;

    @ApiProperty({ example: '08888888888' })
    @IsString()
    phone: string;

    @ApiProperty({ example: 'john-doe' })
    @IsString()
    slug: string;

    @ApiProperty({ example: 'keluarga inti'})
    @IsString()
    group: string;

    @ApiProperty({ example: 'pending | sent'})
    @IsString()
    statusSend: string;
}