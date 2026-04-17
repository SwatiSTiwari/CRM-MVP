import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { CallLog, CallLogSchema } from '../activities/schemas/call-log.schema';
import { Meeting, MeetingSchema } from '../activities/schemas/meeting.schema';
import { Task, TaskSchema } from '../activities/schemas/task.schema';
import { Lead, LeadSchema } from '../leads/schemas/lead.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CallLog.name, schema: CallLogSchema },
      { name: Meeting.name, schema: MeetingSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Lead.name, schema: LeadSchema },
    ]),
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
