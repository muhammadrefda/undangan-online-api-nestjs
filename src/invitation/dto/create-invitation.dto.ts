import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum QuoteSource {
  ISLAM = 'islam',
  KATOLIK = 'katolik',
  KRISTEN = 'kristen',
  BUDHA = 'budha',
  HINDU = 'hindu',
  BEBAS = 'bebas',
}

// Nested DTO Classes
export class LoveStoryItem {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  date?: string;
}

export class Menu {
  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  items: string[];
}

export class SocialMedia {
  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  tiktok?: string;

  @IsOptional()
  @IsString()
  youtube?: string;

  @IsOptional()
  @IsString()
  lainnya?: string;
}

export class ParentName {
  @IsString()
  brideParents: string;

  @IsString()
  groomParents: string;
}

export class LocationDetail {
  @IsString()
  mapUrl: string;

  @IsString()
  description: string;

  @IsDateString()
  dateTime: string;
}

// Main DTO
export class CreateInvitationDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  coupleName?: string;

  @IsOptional()
  @IsString()
  templateName?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsEnum(QuoteSource)
  quoteSource: QuoteSource;

  @IsOptional()
  @IsString()
  quoteText?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoveStoryItem)
  loveStory: LoveStoryItem[];

  @IsString()
  musicChoice: string;

  @IsBoolean()
  isCustomMusic: boolean;

  @IsString()
  bridePhotoUrl: string;

  @ValidateNested()
  @Type(() => LocationDetail)
  akadLocation: LocationDetail;

  @ValidateNested()
  @Type(() => LocationDetail)
  resepsiLocation: LocationDetail;

  @IsBoolean()
  mergeEvents: boolean;

  @IsBoolean()
  encryptedGuestName: boolean;

  @IsOptional()
  @IsString()
  floorPlanImageUrl?: string;

  @ValidateNested()
  @Type(() => Menu)
  menu: Menu;

  @IsArray()
  @IsString({ each: true })
  galleryImages: string[];

  @IsString()
  giftDeliveryAddress: string;

  @IsOptional()
  @IsString()
  eWalletLink?: string;

  @ValidateNested()
  @Type(() => SocialMedia)
  socialMedia: SocialMedia;

  @ValidateNested()
  @Type(() => ParentName)
  parents: ParentName;

  @IsOptional()
  @IsString()
  liveStreamingLink?: string;

  selectedSections?: string[];

  @IsBoolean()
  enableGuestMessage: boolean;
}
