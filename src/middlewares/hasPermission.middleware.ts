import type { NextFunction, Request, Response } from 'express';
import { Role } from '../models/Role.ts';
import User from '../models/User.ts';
import type { IPermission } from '../types/models-type/permission.type.ts';
import type { IRole } from '../types/models-type/role.type.ts';

interface HasPermissionOptions {
  requiredPermission: string[];
  targetedUserId?: (req: Request) => string | null;
  enforcePriority?: boolean;
}

const hasPermission = (opts: HasPermissionOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userSession = req.session.userSession;

      // STEP 1: If no session exists -> user is not authenticated
      if (!userSession) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
      }

      const role = await Role.findOne({ value: userSession.role }).populate<{
        permissions: IPermission[];
      }>('permissions');

      // STEP 2: If role not found → invalid or missing role
      if (!role) {
        return res.status(403).json({
          success: false,
          message: 'Role not assigned or invalid',
        });
      }

      // STEP 3: Check whether user has at least one required permission
      const permitted = role.permissions.some((p) => opts.requiredPermission.includes(p.value));

      // STEP 4: If permission missing → deny access
      if (!permitted) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: insufficient permissions',
        });
      }

      const matchedPerms = role.permissions.filter((p) =>
        opts.requiredPermission.includes(p.value),
      );

      const hasOwn = matchedPerms.some((p) => p.value.endsWith(':own'));
      const hasAny = matchedPerms.some((p) => p.value.endsWith(':any'));

      // STEP 5:
      // If user has ":any" permission and priority check is NOT required, allow access immediately
      if (hasAny && !opts.enforcePriority) {
        return next();
      }

      const ownerId = opts.targetedUserId?.(req) ?? null;

      // STEP 6:
      // If permission scope is ":own", ownership must match
      if (hasOwn && !hasAny) {
        // Owner ID could not be resolved
        if (!ownerId) {
          return res.status(400).json({
            success: false,
            message: 'Target resource owner could not be resolved',
          });
        }

        // Logged-in user does not own this resource
        if (ownerId.toString() !== userSession._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: you do not own this resource',
          });
        }
      }

      // STEP 7:
      // Role priority enforcement
      if (opts.enforcePriority) {
        // If no target user ID found → cannot compare priority
        if (!ownerId) {
          return res.status(400).json({
            success: false,
            message: 'Target user could not be resolved for priority check',
          });
        }

        const targetUser = await User.findById(ownerId).populate<{
          role: IRole;
        }>('role');

        // STEP 8:
        // If target user or role missing
        if (!targetUser?.role) {
          return res.status(403).json({
            success: false,
            message: 'Target user or role not found',
          });
        }

        // STEP 9:
        // Compare role priorities
        // Current user must have HIGHER priority
        if (targetUser.role.priority >= userSession.priority) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: insufficient priority',
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
