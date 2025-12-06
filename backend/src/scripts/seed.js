import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Status from '../models/Status.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    await User.deleteMany({});
    await Department.deleteMany({});
    await Status.deleteMany({});

    console.log('Cleared existing data');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      authProvider: 'local',
    });

    console.log('Created admin user');
    const agent = await User.create({
      name: 'Support Agent',
      email: 'agent@example.com',
      password: 'agent123',
      role: 'agent',
      authProvider: 'local',
    });

    console.log('Created agent user');
    const user = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
      authProvider: 'local',
    });

    console.log('Created regular user');
    const departments = await Department.insertMany([
      {
        name: 'Technical Support',
        description: 'Technical issues and troubleshooting',
        email: 'tech@example.com',
        assignedAdmins: [admin._id, agent._id],
        isHidden: false,
      },
      {
        name: 'Billing',
        description: 'Billing and payment inquiries',
        email: 'billing@example.com',
        assignedAdmins: [admin._id],
        isHidden: false,
      },
      {
        name: 'Sales',
        description: 'Sales and product inquiries',
        email: 'sales@example.com',
        assignedAdmins: [admin._id],
        isHidden: false,
      },
      {
        name: 'Internal',
        description: 'Internal department for escalations',
        email: 'internal@example.com',
        assignedAdmins: [admin._id],
        isHidden: true,
      },
    ]);

    console.log('Created departments');
    const statuses = await Status.insertMany([
      {
        title: 'Open',
        color: '#3B82F6',
        includeInActive: true,
        autoClose: false,
        order: 1,
        isSystem: true,
      },
      {
        title: 'In Progress',
        color: '#F59E0B',
        includeInActive: true,
        autoClose: false,
        order: 2,
        isSystem: false,
      },
      {
        title: 'Waiting for Customer',
        color: '#8B5CF6',
        includeInActive: true,
        autoClose: true,
        autoCloseAfterDays: 7,
        order: 3,
        isSystem: false,
      },
      {
        title: 'Escalated',
        color: '#EF4444',
        includeInActive: true,
        autoClose: false,
        order: 4,
        isSystem: false,
      },
      {
        title: 'Resolved',
        color: '#10B981',
        includeInActive: true,
        autoClose: true,
        autoCloseAfterDays: 3,
        order: 5,
        isSystem: false,
      },
      {
        title: 'Closed',
        color: '#6B7280',
        includeInActive: false,
        autoClose: false,
        order: 6,
        isSystem: true,
      },
    ]);

    console.log('Created statuses');

    console.log('\n=== Seed Data Summary ===');
    console.log('\nUsers:');
    console.log(`Admin: admin@example.com / admin123`);
    console.log(`Agent: agent@example.com / agent123`);
    console.log(`User: user@example.com / user123`);
    console.log(`\nDepartments: ${departments.length}`);
    console.log(`Statuses: ${statuses.length}`);
    console.log('\n=========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
