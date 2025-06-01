const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Get logger
const logger = require('../config/logger') || console;

/**
 * A simple file scanning utility for detecting potentially malicious files
 * In a production environment, this would be replaced with a proper antivirus integration
 */
class FileScanner {
  constructor() {
    // List of potentially dangerous file signatures (hex)
    this.dangerousSignatures = [
      // Example signatures - in production you'd use a real AV
      '4d5a', // PE executable header
      '7f454c46', // ELF header
      '504b0304', // ZIP with potential macros
      '255044462d312e' // PDF (would need deeper inspection in real scanner)
    ];
    
    // Known safe MIME types
    this.safeTextTypes = [
      'text/plain',
      'text/csv',
      'text/html',
      'application/json',
      'application/xml'
    ];
  }
  
  /**
   * Scan a file for potential threats
   * @param {string} filePath - Path to the file
   * @param {string} mimeType - Claimed MIME type
   * @returns {Promise<Object>} Scan result with status and details
   */
  async scanFile(filePath, mimeType) {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return {
          safe: false,
          reason: 'File does not exist'
        };
      }
      
      // Get file size
      const stats = fs.statSync(filePath);
      
      // Size limits check (adjust as needed)
      const maxSizeBytes = 10 * 1024 * 1024; // 10MB
      if (stats.size > maxSizeBytes) {
        return {
          safe: false,
          reason: `File exceeds maximum allowed size of ${maxSizeBytes / 1024 / 1024}MB`
        };
      }
      
      // For text files, we could do content scanning
      if (this.safeTextTypes.includes(mimeType)) {
        const isSafe = await this.scanTextFile(filePath);
        if (!isSafe) {
          return {
            safe: false,
            reason: 'Text file contains potentially malicious content'
          };
        }
      } else {
        // For binary files, check file signatures
        const isSafe = await this.scanBinaryFile(filePath);
        if (!isSafe) {
          return {
            safe: false,
            reason: 'File contains potentially malicious binary content'
          };
        }
      }
      
      // File passed all checks
      return {
        safe: true,
        message: 'File passed security scan'
      };
    } catch (error) {
      logger.error('Error scanning file:', error);
      
      // If scan fails, be cautious and reject the file
      return {
        safe: false,
        reason: 'Error during file scan',
        error: error.message
      };
    }
  }
  
  /**
   * Basic scan for text files
   * @param {string} filePath - Path to text file
   * @returns {Promise<boolean>} Is the file safe?
   */
  async scanTextFile(filePath) {
    try {
      // For demonstration purposes - a very basic scan
      // In production, this would use regex patterns for various types of malicious content
      const content = await fs.promises.readFile(filePath, 'utf8');
      
      // Example check for potentially dangerous content
      const dangerousPatterns = [
        /<script.*?>.*?<\/script>/is, // Basic script tag check
        /eval\s*\(/i,                // eval function
        /function\(\)\s*{.*?}\s*\(\)/, // Self-executing functions
        /document\.cookie/i,         // Cookie access
        /exec\s*\(/i,                // exec calls
        /system\s*\(/i,              // system calls
      ];
      
      for (const pattern of dangerousPatterns) {
        if (pattern.test(content)) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logger.error('Error scanning text file:', error);
      return false; // Be cautious on error
    }
  }
  
  /**
   * Basic scan for binary files
   * @param {string} filePath - Path to binary file
   * @returns {Promise<boolean>} Is the file safe?
   */
  async scanBinaryFile(filePath) {
    try {
      // Read first 256 bytes for signature analysis
      const fd = await fs.promises.open(filePath, 'r');
      const buffer = Buffer.alloc(256);
      await fd.read(buffer, 0, 256, 0);
      await fd.close();
      
      // Convert to hex for signature comparison
      const fileSignature = buffer.toString('hex').toLowerCase();
      
      // Check against known dangerous signatures
      for (const signature of this.dangerousSignatures) {
        if (fileSignature.startsWith(signature)) {
          // This is potentially risky but depends on the file type
          // For example, PDFs are normally fine but should be checked thoroughly
          if (signature === '255044462d312e') { 
            // For PDFs, do deeper inspection in a real implementation
            return true; // Allow PDFs for now
          }
          
          // For other executable formats, be cautious
          return false;
        }
      }
      
      // Calculate file hash for potential virus database check
      // In a real implementation, this would query a virus database
      const fileHash = await this.calculateFileHash(filePath);
      logger.debug(`File hash for scan: ${fileHash}`);
      
      return true; // No dangerous signatures found
    } catch (error) {
      logger.error('Error scanning binary file:', error);
      return false; // Be cautious on error
    }
  }
  
  /**
   * Calculate SHA-256 hash of a file
   * @param {string} filePath - Path to the file
   * @returns {Promise<string>} File hash
   */
  async calculateFileHash(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', (data) => {
        hash.update(data);
      });
      
      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    });
  }
}

// Create singleton instance
const fileScanner = new FileScanner();

module.exports = fileScanner; 