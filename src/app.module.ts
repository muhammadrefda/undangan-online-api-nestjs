import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { InvitationModule } from './invitation/invitation.module';
import { TemplateDesignModule } from './template-design/template-design.module';
import { PaymentModule } from './payment/payment.module';
import { GuestMessagesModule } from './guest-messages/guest-messages.module';
import { UploadModule } from './modules/upload/upload.module';
import { GuestModule } from './dashboard-user/guest/guest.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogTokenMiddleware } from './common/middleware/log-token.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity.{js,ts}'],
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    InvitationModule,
    TemplateDesignModule,
    PaymentModule,
    UploadModule,
    GuestMessagesModule,
    GuestModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogTokenMiddleware).forRoutes('*'); // Semua route
  }
}