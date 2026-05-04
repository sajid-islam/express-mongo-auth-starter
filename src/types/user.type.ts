import { Document, Types } from 'mongoose';

export interface ISocialLink {
  platform: string;
  link: string;
}

export interface IUser extends Document {
  userId: string;
  name: string;
  email: string;
  password?: string;
  role: Types.ObjectId;
  phone?: string;
  photo_url?: string;
  isActive: boolean;
  social_links: ISocialLink[];
  provider: 'email' | 'google' | 'github' | 'facebook';
  verified_email: boolean;

  comparePassword: (password: string) => Promise<boolean>;
}
