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
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@Controller('template-design')
export class TemplateDesignController {
  constructor(private readonly templateService: TemplateDesignService) {}

  @Post()
  @ApiTags('Template Design')
  @ApiOperation({ summary: 'Create a new template design' })
  @ApiBody({
    description: 'Template design details',
    type: TemplateDesign,
  })
  create(@Body() dto: Partial<TemplateDesign>) {
    return this.templateService.create(dto);
  }

  @Get()
  @ApiTags('Template Design')
  @ApiOperation({ summary: 'Find all template designs' })
  findTemplates(@Query('category') category?: string) {
    if (category) {
      return this.templateService.findByCategory(category);
    }
    return this.templateService.findAll();
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
  @ApiTags('Template Design')
  @ApiOperation({ summary: 'Update a template design' })
  @ApiBody({
    description: 'Partial template design details to update',
    type: TemplateDesign,
  })
  update(@Param('id') id: string, @Body() dto: Partial<TemplateDesign>) {
    return this.templateService.update(+id, dto);
  }

  @Delete(':id')
  @ApiTags('Template Design')
  @ApiOperation({ summary: 'Delete a template design' })
  remove(@Param('id') id: string) {
    return this.templateService.remove(+id);
  }

  @Get()
  @ApiTags('Template Design')
  @ApiOperation({ summary: 'Get all template designs' })
  findAll(): Promise<TemplateDesign[]> {
    return this.templateService.findAll();
  }

  // @Get()
  // getTemplates(@Query('category') category?: string) {
  //   if (category) {
  //     return this.templateService.find({ where: { category } });
  //   }
  //   return this.templateService.find();
  // }
}
