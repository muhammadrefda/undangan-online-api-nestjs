import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitation } from './invitation.entity';
import { Guest } from '../dashboard-user/guest/guest.entity';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Invitation, Guest])],
  providers: [InvitationService],
  controllers: [InvitationController],
  exports: [InvitationService],
})
export class InvitationModule {}
