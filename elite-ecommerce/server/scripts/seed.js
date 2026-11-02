const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { categoriesData, productsData } = require('./seedData');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('[Seed] Seeding categories...');
    await Category.insertMany(categoriesData);
    console.log(`[Seed] Seeded ${categoriesData.length} categories.`);

    console.log('[Seed] Seeding products...');
    await Product.insertMany(productsData);
    console.log(`[Seed] Seeded ${productsData.length} products.`);

    console.log('[Seed] Creating Administrator and Demo Customer...');
    const adminUser = await User.create({
      name: 'Elite Administrator',
      email: 'admin@elite.com',
      password: 'Admin@12345',
      phone: '9876543210',
      role: 'admin',
      addresses: [
        {
          name: 'Elite HQ',
          phone: '9876543210',
          street: 'Outer Ring Road, Devarabeesanahalli Village',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560103',
          country: 'India',
          isDefault: true
        }
      ]
    });

    const demoUser = await User.create({
      name: 'Rahul Sharma',
      email: 'customer@elite.com',
      password: 'Customer@12345',
      phone: '9812345678',
      role: 'user',
      addresses: [
        {
          name: 'Rahul Sharma',
          phone: '9812345678',
          street: 'Flat 402, Sunshine Apartments, HSR Layout',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560102',
          country: 'India',
          isDefault: true
        }
      ]
    });

    console.log('----------------------------------------------------');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`Admin Account: admin@elite.com | Password: Admin@12345`);
    console.log(`Demo Account:  customer@elite.com | Password: Customer@12345`);
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
