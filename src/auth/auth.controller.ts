import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private readonly logger = new Logger(AuthController.name);

  @Post('register')
  @ApiOperation({ summary: 'Register user baru' })
  @ApiBody({ type: RegisterDto })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('test-log')
  testLog() {
    console.log('--- INI ADALAH LOG DARI CONSOLE.LOG ---');
    this.logger.log('--- INI ADALAH LOG DARI NESTJS LOGGER ---');
    this.logger.error('--- INI ADALAH LOG ERROR ---');
    return { message: 'Log test endpoint has been called!' };
  }

  @Get('google')
  @ApiOperation({ summary: 'Login dengan Google' })
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const user = req.user as User;
    console.log('HIT googleAuthRedirect route');
    console.log('req.user:', req.user);
    if (!user) {
      const errorUrl = process.env.NODE_ENV === 'development'
        ? this.configService.get<string>('FRONTEND_URL_DEVELOPMENT')
        : this.configService.get<string>('FRONTEND_URL_PRODUCTION')

      return res.redirect(`${errorUrl}/?error=login_failed`)
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email })

    const frontendUrl = process.env.NODE_ENV === 'development'
      ? this.configService.get<string>('FRONTEND_URL_DEVELOPMENT')
      : this.configService.get<string>('FRONTEND_URL_PRODUCTION')

    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
  }

}
