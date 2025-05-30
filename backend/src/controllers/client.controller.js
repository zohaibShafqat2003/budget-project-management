const { Client, Project } = require('../models');
const { Op } = require('sequelize');

// Get all clients with filtering and pagination
exports.getAllClients = async (req, res, next) => {
  try {
    const { 
      includeInactive, 
      name, 
      industry, 
      country, 
      limit = 10, 
      offset = 0 
    } = req.query;
    
    // Build filter object
    const where = {};
    
    // Only show active clients by default
    if (!includeInactive) where.isActive = true;
    
    // Additional filters
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (industry) where.industry = { [Op.iLike]: `%${industry}%` };
    if (country) where.country = { [Op.iLike]: `%${country}%` };
    
    // Get total count for pagination
    const count = await Client.count({ where });
    
    // Get paginated clients
    const clients = await Client.findAll({
      where,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['name', 'ASC']]
    });
    
    return res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: Math.floor(offset / limit) + 1,
      data: clients
    });
  } catch (error) {
    next(error);
  }
};

// Get a single client
exports.getClientById = async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [{ model: Project, as: 'projects' }]
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

// Create a new client
exports.createClient = async (req, res, next) => {
  try {
    // Sanitize input data by trimming strings
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
    
    const client = await Client.create(req.body);
    
    return res.status(201).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

// Update a client
exports.updateClient = async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Sanitize input data by trimming strings
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
    
    await client.update(req.body);
    
    return res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
};

// Delete a client
exports.deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [{ model: Project, as: 'projects', where: { deletedAt: null }, required: false }]
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Check if client has active projects
    if (client.projects && client.projects.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete client with active projects. Please archive or reassign projects first.',
        projectCount: client.projects.length
      });
    }
    
    // Soft delete the client (sets deletedAt timestamp because of paranoid: true)
    await client.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Toggle client active status
exports.toggleClientStatus = async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Toggle isActive status
    await client.update({ isActive: !client.isActive });
    
    return res.status(200).json({
      success: true,
      message: `Client ${client.isActive ? 'activated' : 'deactivated'} successfully`,
      data: client
    });
  } catch (error) {
    next(error);
  }
}; 