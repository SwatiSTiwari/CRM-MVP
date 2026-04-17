import { Controller, Post, Get, Patch, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { IsString, IsOptional, IsNumber, IsEnum, IsArray } from 'class-validator';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TimelineService } from './timeline/timeline.service';
import { Types } from 'mongoose';
import { TaskStatus, TaskPriority } from './schemas/task.schema';
import { CallDirection } from './schemas/call-log.schema';

class CreateCallDto {
  @IsString()
  dateTime: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsEnum(CallDirection)
  direction?: CallDirection;

  @IsOptional()
  @IsString()
  outcome?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  linkedLeadId: string;
}

class CreateMeetingDto {
  @IsString()
  title: string;

  @IsString()
  dateTime: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsArray()
  participants?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  linkedLeadId: string;
}

class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  dueDate: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  linkedLeadId: string;
}

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly timelineService: TimelineService,
  ) {}

  @Post('call')
  async createCall(@Body() body: CreateCallDto, @Request() req: { user: { userId: string } }) {
    return this.activitiesService.createCall({
      ...body,
      dateTime: new Date(body.dateTime),
      ownerId: new Types.ObjectId(req.user.userId),
      linkedLeadId: new Types.ObjectId(body.linkedLeadId),
    });
  }

  @Post('meeting')
  async createMeeting(@Body() body: CreateMeetingDto, @Request() req: { user: { userId: string } }) {
    return this.activitiesService.createMeeting({
      ...body,
      dateTime: new Date(body.dateTime),
      ownerId: new Types.ObjectId(req.user.userId),
      linkedLeadId: new Types.ObjectId(body.linkedLeadId),
    });
  }

  @Post('task')
  async createTask(@Body() body: CreateTaskDto, @Request() req: { user: { userId: string } }) {
    return this.activitiesService.createTask({
      ...body,
      dueDate: new Date(body.dueDate),
      assignedTo: new Types.ObjectId(req.user.userId),
      linkedLeadId: new Types.ObjectId(body.linkedLeadId),
    });
  }

  @Get()
  async findAll(
    @Query('linkedLeadId') linkedLeadId?: string,
    @Query('type') type?: string,
  ) {
    return this.activitiesService.findActivities({ linkedLeadId, type });
  }

  @Get('timeline')
  async getTimeline(@Query('leadId') leadId: string) {
    return this.timelineService.getTimeline(leadId);
  }

  @Patch('tasks/:id')
  async updateTask(@Param('id') id: string, @Body() body: Partial<CreateTaskDto>) {
    const payload: any = { ...body };
    if (body.dueDate) payload.dueDate = new Date(body.dueDate);
    if (body.status) payload.status = body.status as TaskStatus;
    return this.activitiesService.updateTask(id, payload);
  }
}
