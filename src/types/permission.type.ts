import { Document } from 'mongoose';

export interface IPermission extends Document {
  value: string;
  name: string;
}
