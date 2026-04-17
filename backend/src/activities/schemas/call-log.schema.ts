import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CallLogDocument = HydratedDocument<CallLog>;

export enum CallDirection {
  Inbound = 'Inbound',
  Outbound = 'Outbound',
}

@Schema({ timestamps: true })
export class CallLog {
  @Prop({ required: true })
  dateTime: Date;

  @Prop()
  duration: number;

  @Prop({ enum: CallDirection, default: CallDirection.Outbound })
  direction: CallDirection;

  @Prop()
  outcome: string;

  @Prop()
  notes: string;

  @Prop({ type: Types.ObjectId, ref: 'Lead' })
  linkedLeadId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerId: Types.ObjectId;

  @Prop()
  aiSummary: string;
}

export const CallLogSchema = SchemaFactory.createForClass(CallLog);
