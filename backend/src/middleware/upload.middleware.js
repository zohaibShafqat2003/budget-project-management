const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const versionsDir = path.join(uploadDir, 'versions');
const tempDir = path.join(uploadDir, 'temp');

// Create directories if they don't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(versionsDir)) {
  fs.mkdirSync(versionsDir, { recursive: true });
}

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Define allowed file types
const ALLOWED_FILE_TYPES = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/svg+xml': ['.svg'],
  'image/webp': ['.webp'],
  
  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  
  // Text
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'text/html': ['.html', '.htm'],
  
  // Archives
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
  'application/x-7z-compressed': ['.7z'],
  
  // Other
  'application/json': ['.json'],
  'application/xml': ['.xml']
};

// Helper to check if file type is allowed
const isFileTypeAllowed = (mimetype, filename) => {
  if (!ALLOWED_FILE_TYPES[mimetype]) {
    return false;
  }
  
  // Verify extension matches mimetype
  const extension = path.extname(filename).toLowerCase();
  return ALLOWED_FILE_TYPES[mimetype].includes(extension);
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store initially in temp directory for validation
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const fileExt = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${fileExt}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  console.log("🔎 Multer fileFilter checking:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    fieldname: file.fieldname
  });
  
  // Check if file type is allowed
  if (isFileTypeAllowed(file.mimetype, file.originalname)) {
    console.log("✅ File type is allowed");
    cb(null, true);
  } else {
    // Log detailed info on why it's rejected
    const extension = path.extname(file.originalname).toLowerCase();
    console.log("❌ File type rejected:", {
      mimetype: file.mimetype,
      extension: extension,
      allowedExtensionsForMime: ALLOWED_FILE_TYPES[file.mimetype] || 'None',
      isExtensionSupported: ALLOWED_FILE_TYPES[file.mimetype]?.includes(extension) || false
    });
    
    cb(new Error(`File type not allowed. Supported formats: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}`), false);
  }
};

// Create a function to move file from temp to permanent storage
const moveFileFromTemp = (tempPath, entityType) => {
  // Create entity directory if it doesn't exist
  const entityDir = path.join(uploadDir, entityType);
  if (!fs.existsSync(entityDir)) {
    fs.mkdirSync(entityDir, { recursive: true });
  }
  
  const filename = path.basename(tempPath);
  const newPath = path.join(entityDir, filename);
  
  return new Promise((resolve, reject) => {
    fs.rename(tempPath, newPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(newPath);
      }
    });
  });
};

// Export upload middleware with size limits
const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

/**
 * Cleans up temporary files that exceed a certain age
 * @param {number} maxAgeMs - Maximum age in milliseconds
 * @returns {Promise<number>} - Number of files cleaned up
 */
const cleanupTempFiles = async (maxAgeMs = 24 * 60 * 60 * 1000) => {
  const logger = require('../config/logger') || console;
  
  try {
    const files = await fs.promises.readdir(tempDir);
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const file of files) {
      try {
        const filePath = path.join(tempDir, file);
        const stats = await fs.promises.stat(filePath);
        
        // Remove files older than maxAgeMs
        const fileAge = now - stats.mtimeMs;
        if (fileAge > maxAgeMs) {
          await fs.promises.unlink(filePath);
          cleanedCount++;
          logger.debug(`Cleaned up temp file: ${filePath}, age: ${Math.round(fileAge / 1000 / 60)} minutes`);
        }
      } catch (err) {
        logger.error(`Error processing temp file ${file}:`, err);
      }
    }
    
    logger.info(`Temporary file cleanup complete. Removed ${cleanedCount} files.`);
    return cleanedCount;
  } catch (err) {
    logger.error('Error during temp file cleanup:', err);
    return 0;
  }
};

// Run cleanup every hour - more robust implementation
let cleanupInterval = null;
const startCleanupSchedule = () => {
  // Run cleanup immediately on startup
  cleanupTempFiles().catch(err => console.error('Initial temp cleanup failed:', err));
  
  // Clear any existing interval to prevent duplicates
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  
  // Schedule regular cleanup
  cleanupInterval = setInterval(() => {
    cleanupTempFiles().catch(err => console.error('Scheduled temp cleanup failed:', err));
  }, 60 * 60 * 1000); // Every hour
  
  // Return the interval id in case we need to clear it later
  return cleanupInterval;
};

// Start the cleanup schedule
const cleanupIntervalId = startCleanupSchedule();

// Cleanup on graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, cleaning up temp files before shutdown');
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  await cleanupTempFiles(0); // Clean all temp files on shutdown
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, cleaning up temp files before shutdown');
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  await cleanupTempFiles(0); // Clean all temp files on shutdown
});

module.exports = {
  uploadMiddleware,
  uploadDir,
  versionsDir,
  tempDir,
  moveFileFromTemp,
  ALLOWED_FILE_TYPES,
  cleanupTempFiles,
  startCleanupSchedule
}; 