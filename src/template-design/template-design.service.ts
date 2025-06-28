import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemplateDesign } from './template-design.entity';

@Injectable()
export class TemplateDesignService {
  constructor(
    @InjectRepository(TemplateDesign)
    private readonly templateRepo: Repository<TemplateDesign>,
  ) {}

  async create(data: Partial<TemplateDesign>): Promise<TemplateDesign> {
    const template = this.templateRepo.create(data);
    return this.templateRepo.save(template);
  }

  async findAll(): Promise<TemplateDesign[]> {
    return this.templateRepo.find({
      order: { name: 'ASC' },
    });
  }

  async findById(id: number): Promise<TemplateDesign> {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async update(
    id: number,
    data: Partial<TemplateDesign>,
  ): Promise<TemplateDesign> {
    const template = await this.findById(id);
    Object.assign(template, data);
    return this.templateRepo.save(template);
  }

  async remove(id: number): Promise<void> {
    const template = await this.findById(id);
    await this.templateRepo.remove(template);
  }

  async findByCategory(category?: string): Promise<TemplateDesign[]> {
    if (!category || category === 'semua') {
      return this.templateRepo.find();
    }
    return this.templateRepo.find({ where: { category } });
  }
}
