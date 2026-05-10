import type { NextFunction, Request, Response } from 'express';
import { Role } from '../models/Role.ts';

const hasPermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.session.userSession?.role;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const role = await Role.findOne({ value: userRole }).populate('permissions');

    if (!role) {
      return res.status(403).json({
        success: false,
        message: 'Role not assigned or invalid',
      });
    }

    const permissions = role.permissions as any[];

    const permitted = permissions.some((p) => p.value === permission);

    if (!permitted) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: insufficient permissions',
      });
    }

    next();
  };
};

export default hasPermission;
