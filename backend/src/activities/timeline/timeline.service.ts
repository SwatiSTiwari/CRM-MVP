import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CallLog } from '../schemas/call-log.schema';
import { Meeting } from '../schemas/meeting.schema';
import { Task } from '../schemas/task.schema';

export interface TimelineItem {
  type: 'call' | 'meeting' | 'task';
  timestamp: Date;
  summary: string;
  metadata: Record<string, any>;
}

@Injectable()
export class TimelineService {
  constructor(
    @InjectModel(CallLog.name) private callLogModel: Model<CallLog>,
    @InjectModel(Meeting.name) private meetingModel: Model<Meeting>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
  ) {}

  async getTimeline(leadId: string): Promise<TimelineItem[]> {
    const filter = { linkedLeadId: new Types.ObjectId(leadId) };

    const [calls, meetings, tasks] = await Promise.all([
      this.callLogModel.find(filter).populate('ownerId', 'name').lean().exec(),
      this.meetingModel.find(filter).populate('ownerId', 'name').lean().exec(),
      this.taskModel.find(filter).populate('assignedTo', 'name').lean().exec(),
    ]);

    const items: TimelineItem[] = [
      ...calls.map((call: any) => ({
        type: 'call' as const,
        timestamp: call.dateTime,
        summary: call.aiSummary || `${call.direction} call — ${call.outcome || 'No outcome'}`,
        metadata: {
          duration: call.duration,
          direction: call.direction,
          outcome: call.outcome,
          notes: call.notes,
          owner: call.ownerId?.name || null,
        },
      })),
      ...meetings.map((meeting: any) => ({
        type: 'meeting' as const,
        timestamp: meeting.dateTime,
        summary: meeting.title,
        metadata: {
          duration: meeting.duration,
          participants: meeting.participants,
          notes: meeting.notes,
          owner: meeting.ownerId?.name || null,
        },
      })),
      ...tasks.map((task: any) => ({
        type: 'task' as const,
        timestamp: task.dueDate,
        summary: task.title,
        metadata: {
          priority: task.priority,
          status: task.status,
          notes: task.notes,
          assignedTo: task.assignedTo?.name || null,
        },
      })),
    ];

    items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return items;
  }
}
