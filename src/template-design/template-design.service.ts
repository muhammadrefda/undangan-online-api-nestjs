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
    if (!data.paletteColor) {
      throw new Error('paletteColor is required');
    }

    // Kalau paletteColor berupa object, stringify dulu
    if (typeof data.paletteColor === 'object') {
      data.paletteColor = JSON.stringify(data.paletteColor);
    }

    if (Array.isArray(data.tags)) {
      data.tags = JSON.stringify(data.tags);
    }

    const template = this.templateRepo.create(data);
    const saved = await this.templateRepo.save(template);
    return this.transformPalette(saved);
  }

  async findAll(): Promise<TemplateDesign[]> {
    const templates = await this.templateRepo.find({
      order: { name: 'ASC' },
    });
    return templates.map((t) => this.transformPalette(t));
  }

  async findById(id: number): Promise<TemplateDesign> {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    return this.transformPalette(template);
  }

  async update(
    id: number,
    data: Partial<TemplateDesign>,
  ): Promise<TemplateDesign> {
    const template = await this.findById(id);
    if (data.paletteColor && typeof data.paletteColor === 'object') {
      data.paletteColor = JSON.stringify(data.paletteColor);
    }
    Object.assign(template, data);
    const updated = await this.templateRepo.save(template);
    return this.transformPalette(updated);
  }

  async remove(id: number): Promise<void> {
    const template = await this.findById(id);
    await this.templateRepo.remove(template);
  }

  async findByCategory(category?: string): Promise<TemplateDesign[]> {
    const templates =
      !category || category === 'semua'
        ? await this.templateRepo.find()
        : await this.templateRepo.find({ where: { category } });

    return templates.map((t) => this.transformPalette(t));
  }

  private transformPalette(template: TemplateDesign): TemplateDesign {
    if (template.paletteColor) {
      try {
        template.paletteColor = JSON.parse(template.paletteColor) as string;
      } catch (err: any) {
        console.warn(
          `Gagal parsing paletteColor untuk template ${template.id}`,
        );
        throw new Error(`Error parsing paletteColor: ${err}`);
      }
    }
    if (typeof template.tags === 'string') {
      {
        try {
          template.tags = JSON.parse(template.tags) as string;
        } catch (err: any) {
          console.warn(`Gagal parsing tags untuk template ${template.id}`);
          throw new Error(`Error parsing tags: ${err}`);
        }
      }
    }
    return template;
  }

  private async getAllTemplateDesigns(): Promise<TemplateDesign[]> {
    const templates = await this.templateRepo.find();
    return templates.map((t) => this.transformPalette(t));
  }
}
