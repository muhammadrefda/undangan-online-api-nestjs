import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiTags('User')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: { userId: number; email: string }) {
    return this.userService.findById(user.userId);
  }

  @Patch()
  @ApiTags('User')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({ type: UpdateUserDto })
  updateProfile(
    @CurrentUser() user: { userId: number; email: string },
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(user.userId, dto);
  }
}
