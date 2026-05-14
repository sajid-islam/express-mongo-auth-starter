import type { HydratedDocument } from 'mongoose';
import type { IBlog } from '../blog.type';

declare global {
  namespace Express {
    interface Request {
      blog: HydratedDocument<IBlog>;
    }
  }
}

export {};
