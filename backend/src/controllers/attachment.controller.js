const { Attachment, User, sequelize } = require('../models');
const path = require('path');
const fs = require('fs');
const { uploadDir, versionsDir, moveFileFromTemp } = require('../middleware/upload.middleware');
const { validateFileSignature } = require('../utils/attachment.util');
const auditLogger = require('../utils/audit.util');
const fileScanner = require('../utils/scanner.util');

// Debug logging to verify sequelize is loaded
console.log('✅ Attachment controller loaded with sequelize:', sequelize ? 'Instance available' : 'Missing!');

/**
 * Get all attachments for an entity (project, epic, story, task)
 */
const getAttachments = async (req, res) => {
  try {
    const { projectId, epicId, storyId, taskId } = req.params;
    
    // Determine which entity we're looking for
    const where = {};
    if (projectId) where.projectId = projectId;
    if (epicId) where.epicId = epicId;
    if (storyId) where.storyId = storyId;
    if (taskId) where.taskId = taskId;
    
    // By default, only get latest versions
    if (!req.query.includeAllVersions) {
      where.isLatestVersion = true;
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Get all attachments for the entity
    const attachments = await Attachment.findAll({
      where,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    // Get total count for pagination
    const total = await Attachment.count({ where });
    
    // Clean up sensitive data
    const safeAttachments = attachments.map(attachment => {
      const data = attachment.toJSON();
      // Remove full file path for security
      delete data.filePath;
      return data;
    });
    
    return res.status(200).json({
      success: true,
      data: safeAttachments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting attachments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve attachments',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * Upload a new attachment
 */
const uploadAttachment = async (req, res) => {
  let transaction = null;
  let finalPath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const { projectId, epicId, storyId, taskId } = req.params;
    const { description, isPublic = false } = req.body;
    
    // Determine entity type for directory organization
    let entityType = 'general';
    if (projectId) entityType = 'projects';
    else if (epicId) entityType = 'epics';
    else if (storyId) entityType = 'stories';
    else if (taskId) entityType = 'tasks';
    
    // Validate file content matches its extension
    console.log(`Starting file signature validation for: ${req.file.originalname} (${req.file.mimetype})`);
    const validationResult = await validateFileSignature(req.file.path, req.file.mimetype);
    console.log(`Signature validation result:`, validationResult);
    
    if (!validationResult.valid) {
      // Clean up the invalid file
      try {
        fs.unlinkSync(req.file.path);
        console.log(`Deleted invalid file: ${req.file.path}`);
      } catch (err) {
        console.error('Error cleaning up invalid file:', err);
      }
      
      return res.status(400).json({
        success: false,
        message: 'File content doesn\'t match its extension or type',
        error: validationResult.message
      });
    }
    
    // Scan file for malicious content
    const scanResult = await fileScanner.scanFile(req.file.path, req.file.mimetype);
    if (!scanResult.safe) {
      // Clean up the potentially malicious file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error cleaning up malicious file:', err);
      }
      
      // Log the security event
      await auditLogger.log({
        action: 'security_blocked',
        userId: req.user.id,
        userName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        reason: scanResult.reason,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      return res.status(400).json({
        success: false,
        message: 'File was blocked for security reasons',
        error: scanResult.reason
      });
    }
    
    // Move file from temp to permanent storage
    finalPath = await moveFileFromTemp(req.file.path, entityType);
    
    // Create transaction here inside the try block
    transaction = await sequelize.transaction();
    
    // Create the attachment record
    const attachment = await Attachment.create({
      projectId,
      epicId,
      storyId,
      taskId,
      uploadedBy: req.user.id,
      fileName: path.basename(finalPath),
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      filePath: finalPath,
      description,
      isPublic: isPublic === 'true' || isPublic === true,
      versionNumber: 1,
      isLatestVersion: true
    }, { transaction });
    
    await transaction.commit();
    transaction = null; // Clear transaction after commit
    
    // Log file upload to audit
    await auditLogger.logUpload({
      userId: req.user.id,
      userName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
      fileId: attachment.id,
      fileName: attachment.originalName,
      fileSize: attachment.fileSize,
      fileType: attachment.fileType,
      entityType,
      entityId: projectId || epicId || storyId || taskId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // Don't return the full file path in the response
    const safeAttachment = attachment.toJSON();
    delete safeAttachment.filePath;
    
    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: safeAttachment
    });
  } catch (error) {
    // Only try to rollback if transaction exists
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }
    
    // Clean up the uploaded file if it exists
    // First try the finalPath (if we moved the file)
    if (finalPath) {
      try {
        fs.unlinkSync(finalPath);
      } catch (err) {
        console.error('Error cleaning up moved file after failed upload:', err);
      }
    }
    // Then try the original temp file
    else if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error cleaning up temp file after failed upload:', err);
      }
    }
    
    console.error('Error uploading attachment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * Upload a new version of an existing attachment
 */
const uploadNewVersion = async (req, res) => {
  let transaction = null;
  let finalPath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const { id } = req.params;
    const { versionComment } = req.body;
    
    // Find the original attachment
    const originalAttachment = await Attachment.findByPk(id);
    
    if (!originalAttachment) {
      // Clean up the uploaded file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error cleaning up file after attachment not found:', err);
      }
      
      return res.status(404).json({
        success: false,
        message: 'Original attachment not found'
      });
    }
    
    // Validate file content matches its extension
    const validationResult = await validateFileSignature(req.file.path, req.file.mimetype);
    if (!validationResult.valid) {
      // Clean up the invalid file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error cleaning up invalid file:', err);
      }
      
      return res.status(400).json({
        success: false,
        message: 'File content doesn\'t match its extension or type',
        error: validationResult.message
      });
    }
    
    // Check if the file type matches the original attachment's type
    if (req.file.mimetype !== originalAttachment.fileType) {
      // Clean up the file with mismatched type
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error cleaning up file with mismatched type:', err);
      }
      
      return res.status(400).json({
        success: false,
        message: 'New version must have the same file type as the original',
        error: `Original file is ${originalAttachment.fileType}, but uploaded file is ${req.file.mimetype}`
      });
    }
    
    // Scan file for malicious content
    const scanResult = await fileScanner.scanFile(req.file.path, req.file.mimetype);
    if (!scanResult.safe) {
      // Clean up the potentially malicious file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error cleaning up malicious file:', err);
      }
      
      // Log the security event
      await auditLogger.log({
        action: 'security_blocked',
        userId: req.user.id,
        userName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        reason: scanResult.reason,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      return res.status(400).json({
        success: false,
        message: 'File was blocked for security reasons',
        error: scanResult.reason
      });
    }
    
    // Determine entity type for directory organization
    let entityType = 'general';
    if (originalAttachment.projectId) entityType = 'projects';
    else if (originalAttachment.epicId) entityType = 'epics';
    else if (originalAttachment.storyId) entityType = 'stories';
    else if (originalAttachment.taskId) entityType = 'tasks';
    
    // Move file from temp to permanent storage
    finalPath = await moveFileFromTemp(req.file.path, entityType);
    
    // Create transaction here inside the try block
    transaction = await sequelize.transaction();
    
    // Find parent attachment ID (if this is already a version, use its parent)
    const parentId = originalAttachment.parentAttachmentId || originalAttachment.id;
    
    // Find the latest version number
    const latestVersion = await Attachment.findOne({
      where: {
        [sequelize.Op.or]: [
          { id: parentId },
          { parentAttachmentId: parentId }
        ]
      },
      order: [['versionNumber', 'DESC']]
    });
    
    const newVersionNumber = latestVersion.versionNumber + 1;
    
    // Update previous latest version - we'll commit this only if the new version creation succeeds
    await Attachment.update(
      { isLatestVersion: false },
      { 
        where: { 
          [sequelize.Op.or]: [
            { id: parentId, isLatestVersion: true },
            { parentAttachmentId: parentId, isLatestVersion: true }
          ]
        },
        transaction 
      }
    );
    
    // Create new version
    const newVersion = await Attachment.create({
      projectId: originalAttachment.projectId,
      epicId: originalAttachment.epicId,
      storyId: originalAttachment.storyId,
      taskId: originalAttachment.taskId,
      uploadedBy: req.user.id,
      fileName: path.basename(finalPath),
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      filePath: finalPath,
      description: originalAttachment.description,
      isPublic: originalAttachment.isPublic,
      parentAttachmentId: parentId,
      versionNumber: newVersionNumber,
      isLatestVersion: true,
      versionComment
    }, { transaction });
    
    await transaction.commit();
    transaction = null; // Clear transaction after commit
    
    // Log version creation to audit
    await auditLogger.logVersionCreate({
      userId: req.user.id,
      userName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
      fileId: newVersion.id,
      fileName: newVersion.originalName,
      parentId: parentId,
      versionNumber: newVersionNumber,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // Don't return the full file path in the response
    const safeVersion = newVersion.toJSON();
    delete safeVersion.filePath;
    
    return res.status(201).json({
      success: true,
      message: 'New version uploaded successfully',
      data: safeVersion
    });
  } catch (error) {
    // Only try to rollback if transaction exists
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }
    
    // Clean up the uploaded file if it exists
    // First try the finalPath (if we moved the file)
    if (finalPath) {
      try {
        fs.unlinkSync(finalPath);
      } catch (err) {
        console.error('Error cleaning up moved file after failed version upload:', err);
      }
    }
    // Then try the original temp file
    else if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error cleaning up temp file after failed version upload:', err);
      }
    }
    
    console.error('Error uploading new version:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload new version',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * Get all versions of an attachment
 */
const getAttachmentVersions = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the original attachment
    const attachment = await Attachment.findByPk(id);
    
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }
    
    // Find parent ID
    const parentId = attachment.parentAttachmentId || attachment.id;
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get all versions with pagination
    const versions = await Attachment.findAll({
      where: {
        [sequelize.Op.or]: [
          { id: parentId },
          { parentAttachmentId: parentId }
        ]
      },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['versionNumber', 'DESC']],
      limit,
      offset
    });
    
    // Get total count for pagination
    const total = await Attachment.count({
      where: {
        [sequelize.Op.or]: [
          { id: parentId },
          { parentAttachmentId: parentId }
        ]
      }
    });
    
    // Clean up sensitive data
    const safeVersions = versions.map(version => {
      const data = version.toJSON();
      // Remove full file path for security
      delete data.filePath;
      return data;
    });
    
    return res.status(200).json({
      success: true,
      data: safeVersions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting attachment versions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve attachment versions',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * Get a specific attachment by ID
 */
const getAttachmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const attachment = await Attachment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
    
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }
    
    // Clean up sensitive data
    const safeAttachment = attachment.toJSON();
    // Remove full file path for security
    delete safeAttachment.filePath;
    
    return res.status(200).json({
      success: true,
      data: safeAttachment
    });
  } catch (error) {
    console.error('Error getting attachment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve attachment',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * Generate a signed URL for downloading an attachment
 */
const generateDownloadUrl = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Generating download URL for attachment: ${id}`);
    
    const attachment = await Attachment.findByPk(id);
    
    if (!attachment) {
      console.error(`Attachment not found for URL generation: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }
    
    // Generate a signed token for this download
    const jwt = require('jsonwebtoken');
    const secretKey = process.env.JWT_SECRET;
    
    if (!secretKey) {
      console.error('JWT_SECRET environment variable not set');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }
    
    const token = jwt.sign(
      { 
        id: attachment.id,
        fileName: attachment.fileName,
        timestamp: Date.now()
      }, 
      secretKey, 
      { expiresIn: '15m' } // Token expires in 15 minutes
    );
    
    // Generate the download URL with the signed token
    const streamEndpoint = `/attachments/${id}/stream`;
    const downloadUrl = `${streamEndpoint}?token=${token}`;
    
    console.log(`Download URL generated: ${downloadUrl}`);
    
    return res.status(200).json({
      success: true,
      data: {
        url: downloadUrl,
        expires: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        fileName: attachment.originalName,
        fileType: attachment.fileType,
        fileSize: attachment.fileSize
      }
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate download URL',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * Stream an attachment file with a valid signed token
 */
const streamAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;
    
    console.log(`Streaming attachment: ${id}, token provided: ${!!token}`);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No download token provided'
      });
    }
    
    // Verify token
    const jwt = require('jsonwebtoken');
    const secretKey = process.env.JWT_SECRET;
    
    if (!secretKey) {
      console.error('JWT_SECRET environment variable not set');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, secretKey);
      console.log(`Token verified for attachment: ${id}, token data:`, decoded);
    } catch (err) {
      console.error(`Token verification failed: ${err.message}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired download token'
      });
    }
    
    // Check if token is for this attachment
    if (decoded.id !== id) {
      console.error(`Token mismatch: token for ${decoded.id}, requested ${id}`);
      return res.status(401).json({
        success: false,
        message: 'Token does not match the requested attachment'
      });
    }
    
    // Get the attachment
    const attachment = await Attachment.findByPk(id);
    
    if (!attachment) {
      console.error(`Attachment not found in database: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }
    
    // Check if file exists on disk
    if (!fs.existsSync(attachment.filePath)) {
      console.error(`File not found on disk: ${attachment.filePath}`);
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }
    
    // Log file download to audit
    await auditLogger.logDownload({
      fileId: attachment.id,
      fileName: attachment.originalName,
      fileType: attachment.fileType,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      tokenInfo: {
        tokenId: decoded.timestamp,
        issuedAt: new Date(decoded.timestamp).toISOString()
      }
    });
    
    // Set appropriate headers
    res.setHeader('Content-Type', attachment.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
    
    console.log(`Streaming file: ${attachment.filePath}`);
    
    // Stream the file
    const fileStream = fs.createReadStream(attachment.filePath);
    fileStream.on('error', (error) => {
      console.error(`Error streaming file ${attachment.filePath}:`, error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming file'
        });
      }
    });
    
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error streaming attachment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to stream file',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * Update attachment details
 */
const updateAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, isPublic } = req.body;
    
    const attachment = await Attachment.findByPk(id);
    
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }
    
    // Check if user has permission to update (owner or admin)
    if (attachment.uploadedBy !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this attachment'
      });
    }
    
    // Update only allowed fields
    const updates = {};
    if (description !== undefined) updates.description = description;
    if (isPublic !== undefined) updates.isPublic = isPublic === 'true' || isPublic === true;
    
    await attachment.update(updates);
    
    // Log metadata update to audit
    await auditLogger.logUpdate({
      userId: req.user.id,
      userName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
      fileId: attachment.id,
      fileName: attachment.originalName,
      changes: updates,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // Clean up sensitive data
    const safeAttachment = attachment.toJSON();
    delete safeAttachment.filePath;
    
    return res.status(200).json({
      success: true,
      message: 'Attachment updated successfully',
      data: safeAttachment
    });
  } catch (error) {
    console.error('Error updating attachment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update attachment',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

/**
 * Delete an attachment
 */
const deleteAttachment = async (req, res) => {
  let transaction = null;
  
  try {
    const { id } = req.params;
    
    const attachment = await Attachment.findByPk(id);
    
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }
    
    // Check if user has permission to delete (owner or admin)
    if (attachment.uploadedBy !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this attachment'
      });
    }
    
    // Collect information for audit log before deletion
    const auditInfo = {
      userId: req.user.id,
      userName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
      fileId: attachment.id,
      fileName: attachment.originalName,
      fileType: attachment.fileType,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    };
    
    // Create transaction inside try block
    transaction = await sequelize.transaction();
    
    // Delete the attachment (hooks will handle file deletion)
    await attachment.destroy({ transaction });
    
    await transaction.commit();
    transaction = null; // Clear transaction after commit
    
    // Log file deletion to audit
    await auditLogger.logDelete(auditInfo);
    
    return res.status(200).json({
      success: true,
      message: 'Attachment deleted successfully'
    });
  } catch (error) {
    // Only try to rollback if transaction exists
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }
    
    console.error('Error deleting attachment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete attachment',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

module.exports = {
  getAttachments,
  uploadAttachment,
  getAttachmentById,
  generateDownloadUrl,
  streamAttachment,
  updateAttachment,
  deleteAttachment,
  uploadNewVersion,
  getAttachmentVersions
}; 