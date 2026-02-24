import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  link: { type: String, required: true },
});

// User Schema == MAIN ==
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  type: { type: ['learner', 'content_contributor', 'code_contributor'], default: 'learner' },
  role: { type: ['admin', 'user'], default: 'user' },
  phone: { type: String },
  photo_url: { type: String },
  isActive: { type: Boolean, default: true },
  social_links: { type: [socialLinkSchema], required: false, default: [] },
});

const User = mongoose.model('User', userSchema);

export default User;
