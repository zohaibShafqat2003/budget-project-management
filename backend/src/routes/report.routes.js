const express = require('express');
const { 
  getProjectSummaryReports, 
  getBudgetAnalysisReports, 
  getTeamPerformanceReports, 
  getAIInsightReports, 
  exportReports 
} = require('../controllers/report.controller');
const { validateRequest, validationRules } = require('../middleware/validation.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkUserPermission } = require('../middleware/permission.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route GET /api/reports/projects
 * @desc Get project summary reports
 * @access Private
 */
router.get(
  '/projects',
  checkUserPermission('reports', 'read'),
  getProjectSummaryReports
);

/**
 * @route GET /api/reports/budget
 * @desc Get budget analysis reports
 * @access Private
 */
router.get(
  '/budget',
  checkUserPermission('reports', 'read'),
  getBudgetAnalysisReports
);

/**
 * @route GET /api/reports/team
 * @desc Get team performance reports
 * @access Private
 */
router.get(
  '/team',
  checkUserPermission('reports', 'read'),
  getTeamPerformanceReports
);

/**
 * @route GET /api/reports/ai-insights
 * @desc Get AI-generated insights
 * @access Private
 */
router.get(
  '/ai-insights',
  checkUserPermission('reports', 'read'),
  getAIInsightReports
);

/**
 * @route POST /api/reports/export
 * @desc Export reports in various formats (PDF, CSV, etc.)
 * @access Private
 */
router.post(
  '/export',
  checkUserPermission('reports', 'export'),
  validateRequest(validationRules.reportExport),
  exportReports
);

module.exports = router; 