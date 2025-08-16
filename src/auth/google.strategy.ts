import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { User } from '../user/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
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

    console.log('--- VALIDATE METHOD TRIGGERED ---');

    const email = profile.emails?.[0]?.value;

    if (!email) {
      console.error('Email not found in Google profile'); // <--- Tambahkan ini
      throw new UnauthorizedException('Email tidak ditemukan dari Google');
    }

    let user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      user = this.userRepo.create({
        email,
        name: profile.displayName,
        password: '',
        provider: 'google',
      });
      await this.userRepo.save(user);
    }

    return user;
  }
}
