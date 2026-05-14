import { Role } from '../models/Role.ts';
import User from '../models/User.ts';

export const seedUsers = async () => {
  try {
    const role = await Role.find();

    if (!role.length) {
      throw new Error('No role found');
    }

    const roleMap = Object.fromEntries(role.map((r) => [r.value, r._id]).filter(Boolean));

    const users = [
      {
        userId: 'ID-SUPER-001',
        name: 'Super Admin',
        email: 'superadmin@example.com',
        agreedTerms: true,
        password: 'password',
        role: roleMap['super-admin'],
        phone: '+1234567890',
        photo_url: 'https://api.dicebear.com/9.x/shapes/svg?seed=Robert',
        isActive: true,
        social_links: [
          { platform: 'GitHub', link: 'https://github.com/superadmin' },
          { platform: 'LinkedIn', link: 'https://linkedin.com/in/superadmin' },
        ],
        provider: 'email',
        verified_email: true,
      },
      {
        userId: 'ID-ADMIN-001',
        name: 'Admin',
        email: 'admin@example.com',
        agreedTerms: true,
        password: 'password',
        role: roleMap['admin'],
        phone: '+1987654321',
        photo_url: 'https://api.dicebear.com/9.x/shapes/svg?seed=Wyatt',
        isActive: true,
        social_links: [{ platform: 'Twitter', link: 'https://twitter.com/admin' }],
        provider: 'email',
        verified_email: true,
      },
      {
        userId: 'ID-USER-001',
        name: 'User',
        email: 'user@example.com',
        agreedTerms: true,
        password: 'password',
        role: roleMap['user'],
        phone: '+1122334455',
        photo_url: 'https://api.dicebear.com/9.x/shapes/svg?seed=Leo',
        isActive: true,
        provider: 'email',
        verified_email: true,
      },
    ];

    await User.insertMany(users);

    console.log('Users seeded successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};
