const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectDB } = require('../config/db');
const Product = require('../models/Product');

/**
 * Migration Script: Imports exported localStorage products into MongoDB
 * Usage: node scripts/migrate.js [optional_json_file_path]
 */
const migrateData = async () => {
  try {
    const inputFilePath = process.argv[2] || path.join(__dirname, 'exported_localstorage.json');

    console.log('[Migrate] Connecting to MongoDB...');
    await connectDB();

    let itemsToMigrate = [];

    if (fs.existsSync(inputFilePath)) {
      const fileData = fs.readFileSync(inputFilePath, 'utf-8');
      itemsToMigrate = JSON.parse(fileData);
      console.log(`[Migrate] Found ${itemsToMigrate.length} items in ${inputFilePath}`);
    } else {
      console.log(`[Migrate] No input file at ${inputFilePath}. Running data verification & duplicate check...`);
    }

    if (!Array.isArray(itemsToMigrate) || itemsToMigrate.length === 0) {
      console.log('[Migrate] No new external items to import. If you have exported localStorage data, place it in:');
      console.log(inputFilePath);
      process.exit(0);
    }

    let importedCount = 0;
    let skippedCount = 0;

    for (const item of itemsToMigrate) {
      if (!item.name || !item.price) {
        console.warn(`[Migrate] Skipping invalid item:`, item);
        skippedCount++;
        continue;
      }

      // Check for existing product by name to avoid duplicate products during repeated imports
      const exists = await Product.findOne({ name: item.name.trim() });
      if (exists) {
        console.log(`[Migrate] Product '${item.name}' already exists in DB. Skipping duplicate.`);
        skippedCount++;
        continue;
      }

      let normalizedImg = item.imageUrl || '/images/iphone.jpg';
      if (!normalizedImg.startsWith('/') && !normalizedImg.startsWith('http')) {
        normalizedImg = '/' + normalizedImg;
      }

      await Product.create({
        name: item.name.trim(),
        price: Number(item.price),
        originalPrice: item.originalPrice ? Number(item.originalPrice) : Number(item.price),
        discount: item.discount || '10% OFF',
        category: (item.category || 'fashion').toLowerCase(),
        categoryName: item.categoryName || 'General',
        imageUrl: normalizedImg,
        stock: item.stock !== undefined ? Number(item.stock) : 50,
        rating: item.rating ? Number(item.rating) : 4.5,
        numReviews: item.numReviews ? Number(item.numReviews) : 0,
        brand: item.brand || 'Elite'
      });

      importedCount++;
    }

    console.log(`[Migrate] Done! Successfully imported: ${importedCount}, Skipped/Duplicates: ${skippedCount}`);
    process.exit(0);
  } catch (err) {
    console.error('[Migrate] Migration failed:', err);
    process.exit(1);
  }
};

migrateData();
