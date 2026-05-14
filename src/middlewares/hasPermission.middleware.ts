import type { NextFunction, Request, Response } from 'express';
import { Role } from '../models/Role.ts';
import User from '../models/User.ts';

interface HasPermissionOptions {
  requiredPermission: string[];
  targetedUserId?: string | null | ((req: Request) => string | null);
  enforcePriority?: boolean;
}

const hasPermission = (opts: HasPermissionOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userSession = req.session.userSession;

      // 1. Check if user is authenticated
      if (!userSession) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
      }

      const role = await Role.findOne({
        value: userSession.role,
      }).populate('permissions');

      // 2. Check if user has the required permission
      if (!role) {
        return res.status(403).json({
          success: false,
          message: 'Role not assigned or invalid',
        });
      }

      const permissions = role.permissions as any[];

      const permitted = permissions.some((p) => opts.requiredPermission.includes(p.value));

      // 3. If user does not have the required permission, return 403
      if (!permitted) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: insufficient permissions',
        });
      }

      const isOwn = opts.requiredPermission.some((p) => p.endsWith(':own'));

      const ownerId = opts.targetedUserId;

      // 4. If user does not own the resource, return 403
      if (!ownerId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: insufficient permissions',
        });
      }

      // 5. If user owns the resource, check if user is the owner
      if (isOwn) {
        if (ownerId !== userSession.userId) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: you do not own this resource',
          });
        }
      }

      // 6. If enforcePriority is true, check if user has higher priority
      if (opts.enforcePriority) {
        const targetUser = await User.findOne({ userId: ownerId }).populate('role');

        if (!targetUser) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: insufficient permissions',
          });
        }
        const targetUserRole = targetUser.role as any;
        const targetUserPriority = targetUserRole.priority;

        if (targetUserPriority >= userSession.priority) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: insufficient permissions',
          });
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default hasPermission;
