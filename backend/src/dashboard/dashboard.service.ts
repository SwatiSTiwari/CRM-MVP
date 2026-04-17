import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CallLog } from '../activities/schemas/call-log.schema';
import { Meeting } from '../activities/schemas/meeting.schema';
import { Task } from '../activities/schemas/task.schema';
import { Lead } from '../leads/schemas/lead.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(CallLog.name) private callLogModel: Model<CallLog>,
    @InjectModel(Meeting.name) private meetingModel: Model<Meeting>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
  ) {}

  async getToday(userId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const ownerFilter = { ownerId: new Types.ObjectId(userId) };
    const assignedFilter = { assignedTo: new Types.ObjectId(userId) };

    const [tasks, calls, meetings] = await Promise.all([
      this.taskModel
        .find({ ...assignedFilter, dueDate: { $gte: start, $lte: end } })
        .populate('linkedLeadId', 'name')
        .exec(),
      this.callLogModel
        .find({ ...ownerFilter, dateTime: { $gte: start, $lte: end } })
        .exec(),
      this.meetingModel
        .find({ ...ownerFilter, dateTime: { $gte: start, $lte: end } })
        .exec(),
    ]);

    return { tasks, calls, meetings };
  }

  async getPipeline(userId: string) {
    const stages = ['New', 'Contacted', 'Demo Scheduled', 'Callback', 'Converted'];
    const results = await this.leadModel.aggregate([
      { $match: { owner: new Types.ObjectId(userId) } },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
    ]);

    const counts: Record<string, number> = {};
    stages.forEach((s) => (counts[s] = 0));
    results.forEach((r) => {
      counts[r._id] = r.count;
    });

    return counts;
  }
}
