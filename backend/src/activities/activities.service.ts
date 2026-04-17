import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CallLog, CallLogDocument } from './schemas/call-log.schema';
import { Meeting, MeetingDocument } from './schemas/meeting.schema';
import { Task, TaskDocument, TaskStatus } from './schemas/task.schema';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(CallLog.name) private callLogModel: Model<CallLogDocument>,
    @InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async createCall(data: Partial<CallLog>): Promise<CallLogDocument> {
    const call = new this.callLogModel(data);
    return call.save();
  }

  async createMeeting(data: Partial<Meeting>): Promise<MeetingDocument> {
    const meeting = new this.meetingModel(data);
    return meeting.save();
  }

  async createTask(data: Partial<Task>): Promise<TaskDocument> {
    const task = new this.taskModel(data);
    return task.save();
  }

  async findActivities(query: { linkedLeadId?: string; type?: string; ownerId?: string; assignedTo?: string }) {
    const filter: any = {};
    if (query.linkedLeadId) {
      filter.linkedLeadId = new Types.ObjectId(query.linkedLeadId);
    }

    const calls = query.type === 'call' || !query.type
      ? await this.callLogModel
          .find(query.linkedLeadId ? { linkedLeadId: new Types.ObjectId(query.linkedLeadId) } : {})
          .populate('ownerId', 'name')
          .sort({ dateTime: -1 })
          .exec()
      : [];

    const meetings = query.type === 'meeting' || !query.type
      ? await this.meetingModel
          .find(query.linkedLeadId ? { linkedLeadId: new Types.ObjectId(query.linkedLeadId) } : {})
          .populate('ownerId', 'name')
          .sort({ dateTime: -1 })
          .exec()
      : [];

    const tasks = query.type === 'task' || !query.type
      ? await this.taskModel
          .find(query.linkedLeadId ? { linkedLeadId: new Types.ObjectId(query.linkedLeadId) } : {})
          .populate('assignedTo', 'name')
          .sort({ dueDate: -1 })
          .exec()
      : [];

    return { calls, meetings, tasks };
  }

  async findTasksByAssignee(assignedTo: string): Promise<TaskDocument[]> {
    return this.taskModel
      .find({ assignedTo: new Types.ObjectId(assignedTo) })
      .populate('linkedLeadId', 'name')
      .sort({ dueDate: -1 })
      .exec();
  }

  async updateTask(id: string, data: Partial<Task>): Promise<TaskDocument | null> {
    return this.taskModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}
