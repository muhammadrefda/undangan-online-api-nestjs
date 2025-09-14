import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestMessage } from './guest-message.entity';
import { GuestMessagesService } from './guest-messages.service';
import { GuestMessagesController } from './guest-messages.controller';
import { Invitation } from '../invitation/invitation.entity';
import { Guest } from '../dashboard-user/guest/guest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GuestMessage, Invitation, Guest])],
  controllers: [GuestMessagesController],
  providers: [GuestMessagesService],
  exports: [GuestMessagesService],
})
export class GuestMessagesModule {}
