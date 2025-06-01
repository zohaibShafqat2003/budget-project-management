const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

// Get logger or default to console
const logger = require('../config/logger') || console;

/**
 * Log audit events for file operations
 */
class AuditLogger {
  constructor() {
    this.auditDir = path.join(__dirname, '../../logs/audit');
    
    // Ensure audit directory exists
    if (!fs.existsSync(this.auditDir)) {
      fs.mkdirSync(this.auditDir, { recursive: true });
    }
    
    this.todayFile = null;
    this.todayDate = null;
    this.updateDateFile();
  }
  
  /**
   * Update the file reference when day changes
   */
  updateDateFile() {
    const today = new Date();
    const dateStr = format(today, 'yyyy-MM-dd');
    
    if (this.todayDate !== dateStr) {
      this.todayDate = dateStr;
      this.todayFile = path.join(this.auditDir, `file-audit-${dateStr}.log`);
    }
    
    return this.todayFile;
  }
  
  /**
   * Write an audit log entry
   * @param {Object} data - Audit data to log 
   */
  async log(data) {
    try {
      const fileToUse = this.updateDateFile();
      
      // Create structured log entry
      const entry = {
        timestamp: new Date().toISOString(),
        ...data,
      };
      
      // Sanitize sensitive data
      if (entry.filePath) {
        entry.fileName = path.basename(entry.filePath);
        delete entry.filePath;
      }
      
      // Append to log file
      const logLine = JSON.stringify(entry) + '\n';
      await fs.promises.appendFile(fileToUse, logLine, 'utf8');
      
      // Also log to standard logger if in development
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`File Audit: ${entry.action}`, entry);
      }
    } catch (err) {
      // Log to console as fallback
      console.error('Failed to write audit log:', err);
    }
  }
  
  /**
   * Log file upload
   * @param {Object} data - Upload details
   */
  async logUpload(data) {
    await this.log({
      action: 'upload',
      ...data,
    });
  }
  
  /**
   * Log file download
   * @param {Object} data - Download details
   */
  async logDownload(data) {
    await this.log({
      action: 'download',
      ...data,
    });
  }
  
  /**
   * Log file deletion
   * @param {Object} data - Deletion details
   */
  async logDelete(data) {
    await this.log({
      action: 'delete',
      ...data,
    });
  }
  
  /**
   * Log file update (metadata changes)
   * @param {Object} data - Update details
   */
  async logUpdate(data) {
    await this.log({
      action: 'update',
      ...data,
    });
  }
  
  /**
   * Log file version creation
   * @param {Object} data - Version details
   */
  async logVersionCreate(data) {
    await this.log({
      action: 'version_create',
      ...data,
    });
  }
}

// Create singleton instance
const auditLogger = new AuditLogger();

module.exports = auditLogger; 