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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
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

  @Get('google')
  @ApiOperation({ summary: 'Login dengan Google' })
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/redirect')
  @ApiOperation({ summary: 'Redirect setelah login dengan Google' })
  //@UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    this.logger.log('Google redirect endpoint dipanggil.');
    //
    // // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    // const { access_token } = await this.authService.googleLogin(req.user);
    //
    // const frontendUrl = process.env.FRONTEND_URL_PRODUCTION;
    // if (!frontendUrl) {
    //   throw new Error('Frontend URL is not configured');
    // }

    this.logger.log('Google redirect endpoint dipanggil.');

    if (!req.user) {
      this.logger.error('req.user tidak ditemukan setelah Google Guard.');
      return res.redirect(`${process.env.FRONTEND_URL_PRODUCTION}/login-gagal`);
    }
    this.logger.log(
      'Data user dari Google diterima:',
      JSON.stringify(req.user),
    );

    try {
      this.logger.log('Memanggil authService.googleLogin...');
      const { access_token } = await this.authService.googleLogin(req.user);
      this.logger.log('Token berhasil dibuat:', access_token ? 'Ya' : 'Tidak');

      const frontendUrl = process.env.FRONTEND_URL_PRODUCTION;
      if (!frontendUrl) {
        this.logger.error('FRONTEND_URL_PRODUCTION tidak diatur di .env');
        throw new Error('Frontend URL is not configured');
      }
      this.logger.log(`Frontend URL: ${frontendUrl}`);

      const redirectUrl = `${frontendUrl}/auth/google/callback?token=${access_token}`;
      this.logger.log(`Mengarahkan ke: ${redirectUrl}`);

      res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error(
        'Terjadi error di dalam googleAuthRedirect:',
        error.stack,
      );
      // Redirect ke halaman error di frontend agar pengguna tahu ada masalah
      res.redirect(
        `${process.env.FRONTEND_URL_PRODUCTION}/login-gagal?error=server_error`,
      );
    }

    // res.redirect(
    //   `${frontendUrl}/auth/google/callback?token=${access_token}`,
    // );
  }
}
