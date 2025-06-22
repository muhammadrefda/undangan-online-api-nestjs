import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { TemplateDesignService } from './template-design.service';
import { TemplateDesign } from './template-design.entity';

@Controller('template-design')
export class TemplateDesignController {
  constructor(private readonly templateService: TemplateDesignService) {}

  @Post()
  create(@Body() dto: Partial<TemplateDesign>) {
    return this.templateService.create(dto);
  }

  @Get()
  findAll() {
    return this.templateService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.templateService.findById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<TemplateDesign>) {
    return this.templateService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.templateService.remove(+id);
  }
}
