import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import type { IUser } from '../types/user.type.ts';

const socialLinkSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  link: { type: String, required: true },
});

// User Schema == MAIN ==
const userSchema = new mongoose.Schema<IUser>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    agreedTerms: { type: Boolean, required: true },
    password: { type: String },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    phone: { type: String },
    photo_url: { type: String },
    isActive: { type: Boolean, default: true },
    social_links: { type: [socialLinkSchema], required: false, default: [] },
    provider: { type: String, enum: ['email', 'google', 'github', 'facebook'], required: true },
    verified_email: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

userSchema.pre('save' as any, async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

userSchema.methods.comparePassword = async function (userPassword: string) {
  return await bcrypt.compare(userPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
