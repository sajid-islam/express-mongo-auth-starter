import express from 'express';
import {
  createBlog,
  deleteBlog,
  getBlogById,
  getBlogs,
  updateBlog,
} from '../controllers/blog.controller.ts';
import isAuthenticated from '../middlewares/isAuthenticated.middleware.ts';

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/:id', getBlogById);

// Protected routes
router.post('/', isAuthenticated, createBlog);
router.patch('/:id', isAuthenticated, updateBlog);
router.delete('/:id', isAuthenticated, deleteBlog);

export default router;
