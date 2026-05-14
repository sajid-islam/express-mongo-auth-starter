import { Document, Types } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  content: string;
  author: Types.ObjectId;
  tags: string[];
  image_url?: string;
  cloudinary_id?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
