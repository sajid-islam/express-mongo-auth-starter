import { Permission } from '../models/Permission.ts';

const permissions = [
  {
    value: 'read:blog:any',
    name: 'Read Blog',
  },
  {
    value: 'update:blog:any',
    name: 'Update Blog',
  },
  {
    value: 'delete:blog:any',
    name: 'Delete Blog',
  },
  {
    value: 'create:blog:own',
    name: 'Create Blog',
  },
  {
    value: 'read:blog:own',
    name: 'Read Blog',
  },
  {
    value: 'update:blog:own',
    name: 'Update Blog',
  },
  {
    value: 'delete:blog:own',
    name: 'Delete Blog',
  },
];

export const seedPermission = async () => {
  try {
    await Permission.insertMany(permissions);

    console.log('Permissions seeded successfully');
  } catch (error) {
    console.error('Error seeding permissions:', error);
    process.exit(1);
  }
};
