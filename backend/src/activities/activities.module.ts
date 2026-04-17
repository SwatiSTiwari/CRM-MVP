import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { TimelineService } from './timeline/timeline.service';
import { CallLog, CallLogSchema } from './schemas/call-log.schema';
import { Meeting, MeetingSchema } from './schemas/meeting.schema';
import { Task, TaskSchema } from './schemas/task.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CallLog.name, schema: CallLogSchema },
      { name: Meeting.name, schema: MeetingSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
  ],
  providers: [ActivitiesService, TimelineService],
  controllers: [ActivitiesController],
})
export class ActivitiesModule {}
