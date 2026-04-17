import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { Types } from 'mongoose';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LeadStage } from './schemas/lead.schema';

class CreateLeadDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  stage?: LeadStage;
}

class UpdateLeadDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  stage?: LeadStage;

  @IsOptional()
  owner?: Types.ObjectId;
}

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('stage') stage?: string,
    @Query('owner') owner?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.leadsService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 25,
      search,
      stage,
      owner,
      sortBy,
      sortOrder,
    });
  }

  @Post()
  async create(@Body() body: CreateLeadDto, @Request() req: { user: { userId: string } }) {
    return this.leadsService.create({ ...body, owner: new Types.ObjectId(req.user.userId) });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.leadsService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateLeadDto) {
    return this.leadsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.leadsService.remove(id);
    return { message: 'Lead deleted' };
  }

  @Post(':id/convert')
  async convert(@Param('id') id: string) {
    return this.leadsService.convert(id);
  }
}
