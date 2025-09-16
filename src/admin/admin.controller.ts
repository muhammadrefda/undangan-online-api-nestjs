import { Controller, Get, Query, UseGuards, Param, Post, Body, Patch, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { CreateAdminUserDto, UpdateAdminUserDto } from './dto/admin-user.dto';
import { CreateTemplateDesignDto, UpdateTemplateDesignDto } from './dto/template-design.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  // Users
  @Get('users')
  listUsers(@Query() q: PaginationQueryDto) {
    const { page = 1, limit = 20, q: search } = q;
    return this.service.listUsers(page, limit, search);
  }

  @Get('users/:id')
  getUser(@Param('id') id: number) {
    return this.service.getUser(id);
  }

  @Post('users')
  createUser(@Body() dto: CreateAdminUserDto) {
    return this.service.createUser(dto);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: number, @Body() dto: UpdateAdminUserDto) {
    return this.service.updateUser(id, dto);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: number) {
    return this.service.deleteUser(id);
  }

  // Invitations
  @Get('invitations')
  listInvitations(@Query() q: PaginationQueryDto) {
    const { page = 1, limit = 20, q: search } = q;
    return this.service.listInvitations(page, limit, search);
  }

  @Get('invitations/:id')
  getInvitation(@Param('id') id: number) {
    return this.service.getInvitation(id);
  }

  @Delete('invitations/:id')
  deleteInvitation(@Param('id') id: number) {
    return this.service.deleteInvitation(id);
  }

  // Guests
  @Get('guests')
  listGuests(@Query() q: PaginationQueryDto) {
    const { page = 1, limit = 20, q: search } = q;
    return this.service.listGuests(page, limit, search);
  }

  @Get('guests/:id')
  getGuest(@Param('id') id: number) {
    return this.service.getGuest(id);
  }

  @Patch('guests/:id')
  updateGuest(@Param('id') id: number, @Body() dto: any) {
    return this.service.updateGuest(id, dto);
  }

  @Delete('guests/:id')
  deleteGuest(@Param('id') id: number) {
    return this.service.deleteGuest(id);
  }

  // Guest Messages
  @Get('guest-messages')
  listGuestMessages(@Query() q: PaginationQueryDto) {
    const { page = 1, limit = 20, q: search } = q;
    return this.service.listGuestMessages(page, limit, search);
  }

  @Delete('guest-messages/:id')
  deleteGuestMessage(@Param('id') id: number) {
    return this.service.deleteGuestMessage(id);
  }

  // Template Designs
  @Get('template-designs')
  listTemplateDesigns(@Query() q: PaginationQueryDto) {
    const { page = 1, limit = 20, q: search } = q;
    return this.service.listTemplateDesigns(page, limit, search);
  }

  @Get('template-designs/:id')
  getTemplateDesign(@Param('id') id: number) {
    return this.service.getTemplateDesign(id);
  }

  @Post('template-designs')
  createTemplateDesign(@Body() dto: CreateTemplateDesignDto) {
    return this.service.createTemplateDesign(dto);
  }

  @Patch('template-designs/:id')
  updateTemplateDesign(@Param('id') id: number, @Body() dto: UpdateTemplateDesignDto) {
    return this.service.updateTemplateDesign(id, dto);
  }

  @Delete('template-designs/:id')
  deleteTemplateDesign(@Param('id') id: number) {
    return this.service.deleteTemplateDesign(id);
  }
}
