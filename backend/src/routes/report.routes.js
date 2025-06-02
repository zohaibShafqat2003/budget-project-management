const express = require('express');
const { 
  getProjectSummaryReports, 
  getBudgetAnalysisReports, 
  getTeamPerformanceReports, 
  getAIInsightReports, 
  exportReports,
  getProjectComprehensiveReport,
  downloadReport
} = require('../controllers/report.controller');
const { validateRequest, validationRules } = require('../middleware/validation.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkUserPermission } = require('../middleware/permission.middleware');

const router = express.Router();

// We'll apply authentication selectively to routes instead of using router.use(authenticateToken)

/**
 * @route GET /api/reports/projects
 * @desc Get project summary reports
 * @access Private
 */
router.get(
  '/projects',
  authenticateToken,
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
  authenticateToken,
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
  authenticateToken,
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
  authenticateToken,
  checkUserPermission('reports', 'read'),
  getAIInsightReports
);

/**
 * @route GET /api/reports/projects/:projectId/comprehensive
 * @desc Get comprehensive report for a specific project
 * @access Private
 */
router.get(
  '/projects/:projectId/comprehensive',
  authenticateToken,
  checkUserPermission('reports', 'read'),
  getProjectComprehensiveReport
);

/**
 * @route POST /api/reports/export
 * @desc Export reports in various formats (PDF, CSV, etc.)
 * @access Private
 */
router.post(
  '/export',
  authenticateToken,
  checkUserPermission('reports', 'export'),
  validateRequest(validationRules.reportExport),
  exportReports
);

/**
 * @route GET /api/reports/download/:filename
 * @desc Download an exported report
 * @access Public
 */
router.get(
  '/download/:filename',
  downloadReport
);

module.exports = router;