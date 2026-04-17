import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lead, LeadDocument, LeadStage } from './schemas/lead.schema';

export interface FindAllLeadsQuery {
  page?: number;
  limit?: number;
  search?: string;
  stage?: string;
  owner?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class LeadsService {
  constructor(@InjectModel(Lead.name) private leadModel: Model<LeadDocument>) {}

  async create(data: Partial<Lead>): Promise<LeadDocument> {
    const lead = new this.leadModel(data);
    return lead.save();
  }

  async findAll(query: FindAllLeadsQuery): Promise<{ data: LeadDocument[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 25;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const filter: any = {};
    if (query.stage) filter.stage = query.stage;
    if (query.owner) filter.owner = new Types.ObjectId(query.owner);
    if (query.search) {
      filter.$text = { $search: query.search };
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.leadModel
        .find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('owner', 'name email')
        .exec(),
      this.leadModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<LeadDocument> {
    const lead = await this.leadModel.findById(id).populate('owner', 'name email').exec();
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async update(id: string, data: Partial<Lead>): Promise<LeadDocument> {
    const lead = await this.leadModel.findByIdAndUpdate(id, data, { new: true }).populate('owner', 'name email').exec();
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async remove(id: string): Promise<void> {
    const result = await this.leadModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Lead not found');
  }

  async convert(id: string): Promise<LeadDocument> {
    const lead = await this.leadModel.findByIdAndUpdate(id, { stage: LeadStage.Converted }, { new: true }).exec();
    if (!lead) throw new NotFoundException('Lead not found');
    // Minimal deal record creation would go here; omitted per MVP scope
    return lead;
  }
}
