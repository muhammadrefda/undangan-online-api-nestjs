import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { User } from '../user/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    config: ConfigService,
  ) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      session: false,
    });
  }



  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
  ): Promise<User> {
    // --- MULAI BLOK DEBUGGING ---
    this.logger.log('--- STEP 1: Method validate() berhasil dipanggil.');

    const email = profile.emails?.[0]?.value;
    if (!email) {
      this.logger.error('--- GAGAL: Email tidak ditemukan di profil Google.');
      throw new UnauthorizedException('Email tidak ditemukan dari Google');
    }
    this.logger.log(`--- STEP 2: Email ditemukan: ${email}`);
    this.logger.log('--- STEP 3: Mencoba memanggil this.userRepo.findOne...');

    try {
      const user = await this.userRepo.findOne({ where: { email } });
      this.logger.log('--- STEP 4: Panggilan this.userRepo.findOne() BERHASIL.');

      if (user) {
        this.logger.log('--- STEP 5: User ditemukan di DB. Mengembalikan user.');
        return user;
      } else {
        this.logger.log('--- STEP 5: User TIDAK ditemukan. Membuat user baru...');
        // Logika membuat user baru Anda
        const newUser = this.userRepo.create({
          email,
          name: profile.displayName,
          password: '',
          provider: 'google',
        });
        await this.userRepo.save(newUser);
        this.logger.log('--- STEP 6: User baru berhasil disimpan.');
        return newUser;
      }
    } catch (error) {
      this.logger.error('--- GAGAL DI DALAM BLOK TRY/CATCH!', error.stack);
      throw new UnauthorizedException('Gagal memproses data user di database.');
    }
    // --- SELESAI BLOK DEBUGGING ---
  }
}
