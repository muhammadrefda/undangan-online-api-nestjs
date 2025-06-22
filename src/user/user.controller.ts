import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getProfile(@CurrentUser() user: { userId: number; email: string }) {
    return this.userService.findById(user.userId);
  }

  @Patch()
  updateProfile(
    @CurrentUser() user: { userId: number; email: string },
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(user.userId, dto);
  }
}
