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


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private configService: ConfigService
  ) {
  }

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
    const user = req.user;

    if (!user) {
      // kalau gagal ambil user dari google
      return res.redirect(
        `${this.configService.get<string>('FRONTEND_URL_PRODUCTION')}/?error=login_failed`
      );
    }

    // generate JWT
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL_PRODUCTION');

    // redirect ke FE callback
    return res.redirect(`${frontendUrl}/auth/google/callback?token=${token}`);
  }

}
