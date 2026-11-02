const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload a local image file to Cloudinary
 * @param {string} localFilePath - Path to local file
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<string|null>} - Returns Cloudinary secure_url or null on failure
 */
const uploadToCloudinary = async (localFilePath, folder = 'elite_ecommerce/products') => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: 'image'
    });

    // Delete local file after successful upload to save disk space
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch (cleanupErr) {
      console.warn('[Cloudinary] Warning cleaning up local file:', cleanupErr.message);
    }

    return result.secure_url;
  } catch (error) {
    console.error('[Cloudinary] Upload failed:', error.message);
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary
};
