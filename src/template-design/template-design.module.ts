import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateDesign } from './template-design.entity';
import { TemplateDesignService } from './template-design.service';
import { TemplateDesignController } from './template-design.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TemplateDesign])],
  controllers: [TemplateDesignController],
  providers: [TemplateDesignService],
  exports: [TemplateDesignService],
})
export class TemplateDesignModule {}
