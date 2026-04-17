import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

export enum TaskPriority {
  High = 'High',
  Normal = 'Normal',
  Low = 'Low',
}

export enum TaskStatus {
  Open = 'Open',
  NotStarted = 'Not Started',
  Deferred = 'Deferred',
  InProgress = 'In Progress',
  Completed = 'Completed',
  WaitingForInput = 'Waiting for input',
}

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ enum: TaskPriority, default: TaskPriority.Normal })
  priority: TaskPriority;

  @Prop({ enum: TaskStatus, default: TaskStatus.Open })
  status: TaskStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lead' })
  linkedLeadId: Types.ObjectId;

  @Prop()
  notes: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
