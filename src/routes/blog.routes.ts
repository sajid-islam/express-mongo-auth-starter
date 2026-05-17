import express from 'express';
import {
  createBlog,
  deleteBlog,
  getBlogById,
  getBlogs,
  updateBlog,
} from '../controllers/blog.controller.ts';
import hasPermission from '../middlewares/hasPermission.middleware.ts';
import isAuthenticated from '../middlewares/isAuthenticated.middleware.ts';
import loadBlog from '../middlewares/loadBlog.middleware.ts';

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/:id', getBlogById);

// Protected routes
router.post('/', isAuthenticated, createBlog);
router.patch(
  '/:id',
  isAuthenticated,
  loadBlog,
  hasPermission({
    requiredPermission: ['update:blog:any', 'update:blog:own'],
    targetedUserId: (req: express.Request) => req.blog?.author._id || null,
  }) as any,
  updateBlog,
);
router.delete('/:id', isAuthenticated, deleteBlog);

export default router;
