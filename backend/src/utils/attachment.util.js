const fs = require('fs');
const path = require('path');
const { uploadDir, versionsDir } = require('../middleware/upload.middleware');
const fileType = require('file-type');
const mime = require('mime-types');

/**
 * Get information about a file including its MIME type, size, etc.
 * @param {string} filePath - Path to the file
 * @returns {Object} File information
 */
const getFileInfo = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    const fileExt = path.extname(filePath).toLowerCase();
    let fileType = 'application/octet-stream'; // Default type
    
    // Map common extensions to MIME types
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.zip': 'application/zip',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg'
    };
    
    if (mimeTypes[fileExt]) {
      fileType = mimeTypes[fileExt];
    }
    
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      fileType,
      exists: true
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    return {
      exists: false,
      error: error.message
    };
  }
};

/**
 * Check if a file exists and is accessible
 * @param {string} filePath - Path to the file
 * @returns {boolean} Whether the file exists and is accessible
 */
const fileExists = (filePath) => {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Create a temporary preview of an image (resized version)
 * @param {string} filePath - Path to the original file
 * @returns {string} Path to the preview file
 */
const createImagePreview = async (filePath) => {
  // This would typically use an image processing library like Sharp
  // For now, we'll just return the original path
  return filePath;
};

/**
 * Determine if a file is an image that can be previewed
 * @param {string} fileType - MIME type of the file
 * @returns {boolean} Whether the file is an image
 */
const isPreviewable = (fileType) => {
  const previewableTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp',
    'application/pdf' // PDFs are often previewable too
  ];
  
  return previewableTypes.includes(fileType);
};

/**
 * Clean up temporary files
 * @param {string[]} filePaths - Array of file paths to clean up
 */
const cleanupTempFiles = (filePaths) => {
  filePaths.forEach(filePath => {
    try {
      if (fileExists(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Failed to clean up temporary file ${filePath}:`, error);
    }
  });
};

/**
 * Get a safe filename (remove special characters)
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
const getSafeFilename = (filename) => {
  // Replace special characters and spaces
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_');
};

/**
 * File Signature Validation
 * This utility validates that a file's content matches its claimed file type.
 * It helps prevent content-based attacks (e.g., claiming a .exe is a .jpg)
 */

// Map of mime types to their expected magic numbers (file signatures)
const FILE_SIGNATURES = {
  // Images
  'image/jpeg': [
    { bytes: [0xFF, 0xD8, 0xFF], offset: 0 }
  ],
  'image/png': [
    { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], offset: 0 }
  ],
  'image/gif': [
    { bytes: [0x47, 0x49, 0x46, 0x38], offset: 0 } // GIF87a or GIF89a
  ],
  'image/webp': [
    { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 } // RIFF followed by WEBP at offset 8
  ],
  'image/svg+xml': [
    // XML/SVG files typically start with <?xml or <svg
    { bytes: [0x3C, 0x3F, 0x78, 0x6D, 0x6C], offset: 0 }, // <?xml
    { bytes: [0x3C, 0x73, 0x76, 0x67], offset: 0 } // <svg
  ],
  
  // Documents
  'application/pdf': [
    // For PDFs, we'll scan for the signature in the first 1024 bytes, not just at offset 0
    // This handles PDFs with BOMs or other metadata at the start
    { bytes: [0x25, 0x50, 0x44, 0x46], scanFirst: 1024 } // %PDF
  ],
  'application/msword': [
    { bytes: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], offset: 0 } // MS Compound File
  ],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    { bytes: [0x50, 0x4B, 0x03, 0x04], offset: 0 } // DOCX (ZIP format)
  ],
  'application/vnd.ms-excel': [
    { bytes: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], offset: 0 } // MS Compound File
  ],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
    { bytes: [0x50, 0x4B, 0x03, 0x04], offset: 0 } // XLSX (ZIP format)
  ],
  'application/vnd.ms-powerpoint': [
    { bytes: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], offset: 0 } // MS Compound File
  ],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': [
    { bytes: [0x50, 0x4B, 0x03, 0x04], offset: 0 } // PPTX (ZIP format)
  ],
  
  // Archives
  'application/zip': [
    { bytes: [0x50, 0x4B, 0x03, 0x04], offset: 0 }
  ],
  'application/x-rar-compressed': [
    { bytes: [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07], offset: 0 }
  ],
  'application/x-7z-compressed': [
    { bytes: [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C], offset: 0 }
  ],
  
  // Other formats
  'application/json': [
    { bytes: [0x7B], offset: 0 }, // {
    { bytes: [0x5B], offset: 0 }  // [
  ],
  'application/xml': [
    { bytes: [0x3C, 0x3F, 0x78, 0x6D, 0x6C], offset: 0 }, // <?xml
    { bytes: [0x3C], offset: 0 } // <
  ]
};

// List of text file types that don't need signature checks
const TEXT_FILE_TYPES = [
  'text/plain',
  'text/csv',
  'text/html',
  'text/css',
  'text/javascript',
  'application/json',
  'application/xml'
];

/**
 * Check if a file's content matches its claimed mimetype
 * @param {string} filePath - Path to the file
 * @param {string} claimedMimeType - The mime type claimed for this file
 * @returns {Promise<Object>} - Validation result
 */
const validateFileSignature = async (filePath, claimedMimeType) => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        valid: false,
        message: 'File does not exist'
      };
    }
    
    // If it's a text file type, we'll check differently
    if (TEXT_FILE_TYPES.includes(claimedMimeType)) {
      return validateTextFile(filePath, claimedMimeType);
    }
    
    console.log(`Validating file signature for: ${path.basename(filePath)}, claimed type: ${claimedMimeType}`);
    
    // First, use file-type library for reliable binary detection
    const detectedType = await fileType.fromFile(filePath);
    
    // Log what file-type detected
    if (detectedType) {
      console.log(`File-type library detected: ${detectedType.mime}`);
    } else {
      console.log('File-type library could not determine type, falling back to manual check');
    }
    
    // If file-type couldn't determine the type, fall back to our manual checks
    if (!detectedType) {
      return await manualSignatureCheck(filePath, claimedMimeType);
    }
    
    // Check if the detected MIME type matches claimed type
    if (detectedType.mime === claimedMimeType) {
      return {
        valid: true,
        message: `File signature validated: ${detectedType.mime}`
      };
    }
    
    // Special case for Office documents which can have similar signatures
    if (isOfficeDocument(claimedMimeType) && isOfficeDocument(detectedType.mime)) {
      // For Office formats, trust the extension as they can share signatures
      const extension = path.extname(filePath).toLowerCase();
      return {
        valid: true,
        message: `Office document validated by extension: ${extension}`
      };
    }
    
    // Special case for PDFs - if fileType failed but we claim it's a PDF,
    // perform a targeted check for PDF signature
    if (claimedMimeType === 'application/pdf') {
      return await manualSignatureCheck(filePath, claimedMimeType);
    }
    
    // If we get here, the file's signature doesn't match the claimed type
    return {
      valid: false,
      message: `Claimed MIME type ${claimedMimeType} doesn't match detected type ${detectedType.mime}`
    };
  } catch (error) {
    console.error('Error validating file signature:', error);
    return {
      valid: false,
      message: `Error validating file: ${error.message}`
    };
  }
};

/**
 * Check if MIME type is an Office document format
 * @param {string} mimeType - MIME type to check
 * @returns {boolean} - Is this an Office document format
 */
const isOfficeDocument = (mimeType) => {
  const officeTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  
  return officeTypes.includes(mimeType);
};

/**
 * Validate a text file
 * @param {string} filePath - Path to the file
 * @param {string} claimedMimeType - The mime type claimed for this file
 * @returns {Promise<Object>} - Validation result
 */
const validateTextFile = async (filePath, claimedMimeType) => {
  try {
    // For text files, we'll check if it contains control characters or binary data
    const buffer = await fs.promises.readFile(filePath);
    
    // Check for a high ratio of control or binary characters
    let controlChars = 0;
    let totalChars = buffer.length;
    
    // Don't scan extremely large text files completely
    const sampleSize = Math.min(totalChars, 8192); // 8KB sample
    
    for (let i = 0; i < sampleSize; i++) {
      const byte = buffer[i];
      // Control characters and non-UTF8 sequences
      if ((byte < 9 || (byte > 13 && byte < 32)) && byte !== 0) {
        controlChars++;
      }
    }
    
    // If more than 10% of characters are control chars, likely not a text file
    const controlRatio = controlChars / sampleSize;
    if (controlRatio > 0.1) {
      return {
        valid: false,
        message: `File contains too many control characters (${controlRatio.toFixed(2)}%) for a ${claimedMimeType} file`
      };
    }
    
    // Additional checks for specific text formats
    if (claimedMimeType === 'application/json') {
      try {
        // Try to parse as JSON - this is strict validation
        JSON.parse(buffer.toString('utf8'));
      } catch (e) {
        return {
          valid: false,
          message: `Invalid JSON format: ${e.message}`
        };
      }
    } else if (claimedMimeType === 'application/xml' || claimedMimeType === 'text/html') {
      // Basic check for XML/HTML - just verify it starts with < character
      // A full parser would be needed for complete validation
      if (buffer[0] !== 0x3C) { // '<' character
        return {
          valid: false,
          message: `${claimedMimeType} should start with '<' character`
        };
      }
    }
    
    // If we've passed all checks, the text file is valid
    return {
      valid: true,
      message: `Text file validated as ${claimedMimeType}`
    };
  } catch (error) {
    console.error('Error validating text file:', error);
    return {
      valid: false,
      message: `Error validating text file: ${error.message}`
    };
  }
};

/**
 * Manually check file signatures when file-type library fails
 * @param {string} filePath - Path to the file
 * @param {string} claimedMimeType - The mime type claimed for this file
 * @returns {Promise<Object>} - Validation result
 */
const manualSignatureCheck = async (filePath, claimedMimeType) => {
  try {
    // Only proceed if we have signature definitions for this mime type
    const signatures = FILE_SIGNATURES[claimedMimeType];
    if (!signatures || signatures.length === 0) {
      return {
        valid: true,
        message: `No signature check defined for ${claimedMimeType}`
      };
    }
    
    // Open the file
    const fd = await fs.promises.open(filePath, 'r');
    
    // Try each signature pattern
    for (const signature of signatures) {
      if (signature.scanFirst) {
        // Special case: scan for signature anywhere in first N bytes
        const bufferSize = signature.scanFirst;
        const buffer = Buffer.alloc(bufferSize);
        await fd.read(buffer, 0, bufferSize, 0);
        
        // Convert signature bytes to Buffer for indexOf
        const signatureBuffer = Buffer.from(signature.bytes);
        
        // Check if signature exists anywhere in the scanned area
        if (buffer.indexOf(signatureBuffer) !== -1) {
          await fd.close();
          return {
            valid: true,
            message: `File signature for ${claimedMimeType} found within first ${bufferSize} bytes`
          };
        }
      } else {
        // Standard check: signature must be at exact offset
        const { bytes, offset } = signature;
        const buffer = Buffer.alloc(bytes.length);
        await fd.read(buffer, 0, bytes.length, offset);
        
        // Check if all bytes match
        let matches = true;
        for (let i = 0; i < bytes.length; i++) {
          if (buffer[i] !== bytes[i]) {
            matches = false;
            break;
          }
        }
        
        if (matches) {
          await fd.close();
          return {
            valid: true,
            message: `File signature validated for ${claimedMimeType}`
          };
        }
      }
    }
    
    // Close file descriptor
    await fd.close();
    
    // No matching signature found
    return {
      valid: false,
      message: `File doesn't have the correct signature for ${claimedMimeType}`
    };
  } catch (error) {
    console.error('Error in manual signature check:', error);
    return {
      valid: false,
      message: `Error checking file signature: ${error.message}`
    };
  }
};

/**
 * Get a friendly file size description
 * @param {number} bytes - File size in bytes
 * @returns {string} - Human-readable file size
 */
const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} bytes`;
  else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  else if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  else return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

/**
 * Sanitize file metadata for client-side use
 * @param {Object} attachment - Attachment database record
 * @returns {Object} Sanitized attachment object
 */
const sanitizeAttachment = (attachment) => {
  if (!attachment) return null;
  
  const data = typeof attachment.toJSON === 'function' 
    ? attachment.toJSON() 
    : { ...attachment };
  
  // Remove sensitive fields
  delete data.filePath;
  
  // Add download URL if ID exists
  if (data.id) {
    data.downloadUrl = `/api/attachments/${data.id}/generate-url`;
  }
  
  return data;
};

module.exports = {
  getFileInfo,
  fileExists,
  createImagePreview,
  isPreviewable,
  cleanupTempFiles,
  getSafeFilename,
  validateFileSignature,
  formatFileSize,
  sanitizeAttachment
}; 