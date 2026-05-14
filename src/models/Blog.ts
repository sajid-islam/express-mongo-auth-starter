import mongoose from 'mongoose';
import type { IBlog } from '../types/models-type/blog.type.ts';

const blogSchema = new mongoose.Schema<IBlog>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: { type: [String], default: [] },
    image_url: { type: String },
    cloudinary_id: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
