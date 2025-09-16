import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTemplateDesignDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  previewUrl: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  paletteColor?: any;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  tags?: any;

  @IsOptional()
  sectionOptions?: any;
}

export class UpdateTemplateDesignDto extends PartialType(CreateTemplateDesignDto) {}

