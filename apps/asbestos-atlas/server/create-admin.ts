import { db } from './db';
import { users } from '@shared/schema';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { eq } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function createAdminUser() {
  console.log('Creating admin user...');
  
  // Check if admin already exists
  const existingAdmin = await db.select().from(users).where(eq(users.email, 'admin@satterleykelley.com')).limit(1);
  
  if (existingAdmin.length > 0) {
    console.log('Admin user already exists');
    return;
  }

  const adminPassword = 'SK_Admin_2024!';
  const hashedPassword = await hashPassword(adminPassword);

  const [admin] = await db
    .insert(users)
    .values({
      email: 'admin@satterleykelley.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      isApproved: true,
      approvedAt: new Date(),
    })
    .returning();

  console.log('Admin user created successfully!');
  console.log('=================================');
  console.log('ADMIN CREDENTIALS:');
  console.log('Email: admin@satterleykelley.com');
  console.log('Password: SK_Admin_2024!');
  console.log('=================================');
  console.log('Keep these credentials secure!');
}

createAdminUser().catch(console.error);