import { Permission } from '../models/Permission.ts';
import { Role } from '../models/Role.ts';

export const seedRole = async () => {
  try {
    const permissions = await Permission.find();

    if (!permissions.length) {
      throw new Error('No permissions found');
    }

    const permissionsRecord = Object.fromEntries(permissions.map((p) => [p.value, p._id]));
    const getPermissionIds = (value: string[]) => {
      return value.map((v) => permissionsRecord[v]).filter(Boolean);
    };

    const roles = [
      {
        value: 'user',
        name: 'User',
        priority: 0,
        permissions: getPermissionIds([
          'read:blog:own',
          'update:blog:own',
          'delete:blog:own',
          'create:blog:own',
        ]),
      },
      {
        value: 'admin',
        name: 'Admin',
        priority: 90,
        permissions: getPermissionIds([
          'read:blog:any',
          'update:blog:any',
          'delete:blog:own',
          'create:blog:own',
        ]),
      },
      {
        value: 'super-admin',
        name: 'Super Admin',
        priority: 100,
        permissions: getPermissionIds([
          'read:blog:any',
          'update:blog:any',
          'delete:blog:any',
          'create:blog:own',
        ]),
      },
    ];

    await Role.insertMany(roles);

    console.log('Roles seeded successfully');
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
};
