import express from 'express';
import cloudinary from '../config/cloudinary.ts';
import Blog from '../models/Blog.ts';
import User from '../models/User.ts';

// Create a new blog
export const createBlog = async (req: express.Request, res: express.Response) => {
  try {
    const { title, content, tags, image } = req.body;
    const sessionUserId = req.session.userSession?._id;

    if (!sessionUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(sessionUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let image_url = '';
    let cloudinary_id = '';

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: 'blogs',
      });
      image_url = uploadResponse.secure_url;
      cloudinary_id = uploadResponse.public_id;
    }

    const newBlog = new Blog({
      title,
      content,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : [],
      author: user._id,
      image_url,
      cloudinary_id,
    });

    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all blogs
export const getBlogs = async (req: express.Request, res: express.Response) => {
  try {
    const blogs = await Blog.find({ isActive: true }).populate('author', 'name photo_url');
    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get blog by ID
export const getBlogById = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id).populate('author', 'name photo_url');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update blog
export const updateBlog = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { title, content, tags, image, isActive } = req.body;
    const sessionUserId = req.session.userSession?._id;

    const user = await User.findById(sessionUserId!);
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check ownership
    if (blog.author.toString() !== user?._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not own this blog' });
    }

    if (image) {
      // Delete old image if exists
      if (blog.cloudinary_id) {
        await cloudinary.uploader.destroy(blog.cloudinary_id);
      }
      // Upload new image
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: 'blogs',
      });
      blog.image_url = uploadResponse.secure_url;
      blog.cloudinary_id = uploadResponse.public_id;
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    if (tags) {
      blog.tags = Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim());
    }
    if (isActive !== undefined) {
      blog.isActive = isActive;
    }

    await blog.save();
    res.status(200).json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete blog
export const deleteBlog = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const sessionUserId = req.session.userSession?._id;

    const user = await User.findById(sessionUserId!);
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check ownership
    if (blog.author.toString() !== user?._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not own this blog' });
    }

    // Delete image from Cloudinary
    if (blog.cloudinary_id) {
      await cloudinary.uploader.destroy(blog.cloudinary_id);
    }

    await Blog.findByIdAndDelete(id);
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
