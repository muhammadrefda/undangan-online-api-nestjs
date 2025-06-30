import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../user/user.entity';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @ApiTags('Invitation')
  @ApiOperation({ summary: 'Create a new invitation' })
  @ApiBody({ type: CreateInvitationDto })
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateInvitationDto, @CurrentUser() user: User) {
    return this.invitationService.create(dto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: User) {
    return this.invitationService.findAllByUser(user.id);
  }

  @Get(':id')
  @ApiTags('Invitation')
  @ApiOperation({ summary: 'Get an invitation by ID' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.invitationService.findOneById(+id);
  }

  @Patch(':id')
  @ApiTags('Invitation')
  @ApiOperation({ summary: 'Update an invitation' })
  @ApiBody({ type: UpdateInvitationDto })
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateInvitationDto) {
    return this.invitationService.update(+id, dto);
  }

  @Delete(':id')
  @ApiTags('Invitation')
  @ApiOperation({ summary: 'Delete an invitation' })
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.invitationService.remove(+id);
  }

  @Get('slug/:slug')
  @ApiTags('Invitation')
  @ApiOperation({ summary: 'Find an invitation by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.invitationService.findBySlug(slug);
  }

  @Get('categories')
  @ApiTags('Invitation')
  @ApiOperation({ summary: 'Get invitation categories' })
  getCategories() {
    return [
      { key: 'semua', label: 'Semua' },
      { key: 'premium', label: 'Premium' },
      { key: 'eksklusif', label: 'Eksklusif' },
      { key: 'gratis', label: 'Gratis' },
    ];
  }
}
