import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MeetingDocument = HydratedDocument<Meeting>;

@Schema({ timestamps: true })
export class Meeting {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  dateTime: Date;

  @Prop()
  duration: number;

  @Prop({ type: [String] })
  participants: string[];

  @Prop()
  notes: string;

  @Prop({ type: Types.ObjectId, ref: 'Lead' })
  linkedLeadId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerId: Types.ObjectId;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
