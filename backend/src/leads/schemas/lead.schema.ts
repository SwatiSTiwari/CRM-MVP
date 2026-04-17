import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LeadDocument = HydratedDocument<Lead>;

export enum LeadStage {
  New = 'New',
  Contacted = 'Contacted',
  DemoScheduled = 'Demo Scheduled',
  Callback = 'Callback',
  Converted = 'Converted',
}

@Schema({ timestamps: true })
export class Lead {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, lowercase: true })
  email: string;

  @Prop()
  phone: string;

  @Prop()
  company: string;

  @Prop()
  source: string;

  @Prop({ enum: LeadStage, default: LeadStage.New })
  stage: LeadStage;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  owner: Types.ObjectId;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

LeadSchema.index({ name: 'text', email: 'text', phone: 'text', company: 'text' });
LeadSchema.index({ stage: 1 });
LeadSchema.index({ owner: 1 });
