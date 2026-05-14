import type { NextFunction, Request, Response } from 'express';
import Blog from '../models/Blog.ts';

const loadBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    req.blog = blog;
    next();
  } catch (error) {
    next(error);
  }
};

export default loadBlog;
