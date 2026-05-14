import { Document, Types } from 'mongoose';

export interface IRole extends Document {
  value: string;
  name: string;
  priority: number;
  permissions: Types.ObjectId[];
}
