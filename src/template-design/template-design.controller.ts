import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
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

  @Get('categories')
  getCategories() {
    return [
      { key: 'semua', label: 'Semua' },
      { key: 'premium', label: 'Premium' },
      { key: 'eksklusif', label: 'Eksklusif' },
    ];
  }

  @Get()
  findByCategory(@Query('category') category?: string) {
    return this.templateService.findByCategory(category);
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
  // @Get()
  // getTemplates(@Query('category') category?: string) {
  //   if (category) {
  //     return this.templateService.find({ where: { category } });
  //   }
  //   return this.templateService.find();
  // }
}
