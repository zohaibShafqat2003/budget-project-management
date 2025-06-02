const logger = require('../config/logger');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY;
let genAI = null;

// Initialize Gemini client if API key is available
if (geminiApiKey) {
  genAI = new GoogleGenerativeAI(geminiApiKey);
  logger.info('Gemini AI service initialized successfully');
} else {
  logger.warn('Gemini AI service not initialized - API key missing');
}

// List available models (uncomment for debugging)
// async function listModels() {
//   if (!genAI) return [];
//   try {
//     const models = await genAI.listModels();
//     logger.info('Available models:', models.map(m => m.name));
//     return models;
//   } catch (error) {
//     logger.error('Error listing models:', error);
//     return [];
//   }
// }
// listModels();

/**
 * Generate AI insights based on project data
 * @param {Object} projectData - Project data to analyze
 * @returns {Array} Array of insights
 */
const generateAIInsights = async (projectData) => {
  try {
        // If Gemini is not available, return fallback insights
    if (!genAI) {
      logger.debug('Using fallback AI insights generation');
      return generateFallbackInsights(projectData);
    }

    // Format project data for the AI prompt
    const prompt = formatProjectDataForPrompt(projectData);

    // Get a model instance with the correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    return parseGeminiResponse(text);
  } catch (error) {
    logger.error('Error generating AI insights:', error);
    return generateFallbackInsights(projectData);
  }
};

/**
 * Format project data for AI prompt
 * @param {Object} projectData - Project data to format
 * @returns {String} Formatted prompt
 */
const formatProjectDataForPrompt = (projectData) => {
  return `
    As an AI project management assistant, analyze the following project data and provide insights and recommendations:
    
    Project: ${JSON.stringify(projectData)}
    
    Please provide the following in JSON format:
    1. Project risk assessment (risk level, budget overrun probability, timeline slippage probability, and recommendations)
    2. Performance prediction (will the project meet its deadline, projected budget variance, productivity forecast)
    3. Strategic recommendations (priority improvements, benefits of each recommendation)
    
    Format your response as a JSON array with these objects:
    [
      {
        "type": "Warning|Critical|Positive|Informational",
        "category": "Tasks|Budget|Timeline|General",
        "message": "Insight message",
        "recommendation": "Actionable recommendation"
      }
    ]
  `;
};

/**
 * Parse Gemini API response
 * @param {String} response - Raw response from Gemini API
 * @returns {Array} Parsed insights
 */
const parseGeminiResponse = (response) => {
  try {
    // Extract JSON from the response (in case there's additional text)
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // If no JSON found, try to parse the entire response
    return JSON.parse(response);
  } catch (error) {
    logger.error('Error parsing Gemini response:', error);
    return [
      {
        type: 'Informational',
        category: 'General',
        message: 'Unable to generate AI insights at this time.',
        recommendation: 'Please try again later or contact support if the issue persists.'
      }
    ];
  }
};

/**
 * Generate fallback insights when AI service is unavailable
 * @param {Object} projectData - Project data to analyze
 * @returns {Array} Fallback insights
 */
const generateFallbackInsights = (projectData) => {
  const insights = [];
  
  // Basic project progress insight
  if (projectData.progress) {
    const progress = projectData.progress;
    if (progress < 25) {
      insights.push({
        type: 'Informational',
        category: 'General',
        message: 'Project is in its early stages.',
        recommendation: 'Ensure requirements are clear and team is aligned on objectives.'
      });
    } else if (progress >= 25 && progress < 50) {
      insights.push({
        type: 'Informational',
        category: 'General',
        message: 'Project is approaching the midpoint.',
        recommendation: 'Review initial progress and adjust timeline if necessary.'
      });
    } else if (progress >= 50 && progress < 75) {
      insights.push({
        type: 'Informational',
        category: 'General',
        message: 'Project is past the halfway point.',
        recommendation: 'Focus on completing critical path tasks and addressing any blockers.'
      });
    } else {
      insights.push({
        type: 'Positive',
        category: 'General',
        message: 'Project is nearing completion.',
        recommendation: 'Prepare for final delivery and ensure all deliverables meet requirements.'
      });
    }
  }
  
  // Budget insight
  if (projectData.totalBudget && projectData.usedBudget) {
    const budgetUsagePercentage = (projectData.usedBudget / projectData.totalBudget) * 100;
    if (budgetUsagePercentage > 90 && (projectData.progress || 0) < 80) {
      insights.push({
        type: 'Critical',
        category: 'Budget',
        message: 'Budget usage is significantly ahead of project progress.',
        recommendation: 'Review expenses immediately and implement cost-control measures.'
      });
    } else if (budgetUsagePercentage > 75 && (projectData.progress || 0) < 60) {
      insights.push({
        type: 'Warning',
        category: 'Budget',
        message: 'Budget usage is ahead of project progress.',
        recommendation: 'Monitor expenses closely and identify potential areas for savings.'
      });
    }
  }
  
  // Timeline insight
  if (projectData.startDate && projectData.completionDate) {
    const now = new Date();
    const start = new Date(projectData.startDate);
    const end = new Date(projectData.completionDate);
    
    if (end < now) {
      insights.push({
        type: 'Critical',
        category: 'Timeline',
        message: 'Project has passed its planned completion date.',
        recommendation: 'Establish a revised timeline and communicate with stakeholders.'
      });
    } else {
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      const timePercentUsed = (elapsed / totalDuration) * 100;
      
      if (timePercentUsed > 70 && (projectData.progress || 0) < 50) {
        insights.push({
          type: 'Warning',
          category: 'Timeline',
          message: 'Project progress is behind schedule.',
          recommendation: 'Consider adding resources or adjusting scope to meet the deadline.'
        });
      }
    }
  }
  
  // Task insight
  if (projectData.tasks) {
    const tasks = projectData.tasks;
    const overdueTasks = tasks.filter(task => 
      task.status !== 'Completed' && 
      task.dueDate && 
      new Date(task.dueDate) < new Date()
    );
    
    if (overdueTasks.length > 0) {
      insights.push({
        type: 'Warning',
        category: 'Tasks',
        message: `There are ${overdueTasks.length} overdue tasks.`,
        recommendation: 'Prioritize overdue tasks and consider reassigning if necessary.'
      });
    }
  }
  
  // Ensure we have at least one insight
  if (insights.length === 0) {
    insights.push({
      type: 'Informational',
      category: 'General',
      message: 'Project appears to be progressing normally.',
      recommendation: 'Continue regular monitoring and team check-ins.'
    });
  }
  
  return insights;
};

/**
 * Generate a project summary
 * @param {Object} projectData - Project data to summarize
 * @returns {String} Project summary
 */
const generateProjectSummary = async (projectData) => {
  try {
    // If Gemini is not available, return fallback summary
    if (!genAI) {
      logger.debug('Using fallback project summary generation');
      return generateFallbackProjectSummary(projectData);
    }

    // Get a model instance with the correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Generate a concise summary (max 2 paragraphs) for this project:
      Project Name: ${projectData.name}
      Progress: ${projectData.progress || 0}%
      Budget: $${projectData.totalBudget || 0} (${projectData.budgetUtilization || 0}% utilized)
      Status: ${projectData.status || 'Unknown'}
      Start Date: ${projectData.startDate ? new Date(projectData.startDate).toLocaleDateString() : 'Not set'}
      Completion Date: ${projectData.completionDate ? new Date(projectData.completionDate).toLocaleDateString() : 'Not set'}
      Description: ${projectData.description || 'No description provided'}
      
      Include current status, progress assessment, budget utilization, and timeline projection.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    logger.error('Error generating project summary:', error);
    return generateFallbackProjectSummary(projectData);
  }
};

/**
 * Generate fallback project summary when AI service is unavailable
 * @param {Object} projectData - Project data to summarize
 * @returns {String} Fallback project summary
 */
const generateFallbackProjectSummary = (projectData) => {
  const progress = projectData.progress || 0;
  const status = projectData.status || 'Unknown';
  const budgetUtilization = projectData.budgetUtilization || 0;
  
  const completionDate = projectData.completionDate 
    ? new Date(projectData.completionDate).toLocaleDateString() 
    : 'unspecified date';
  
  let timelineAssessment = 'on track';
  if (projectData.timelineStatus === 'Behind Schedule') {
    timelineAssessment = 'behind schedule';
  } else if (projectData.timelineStatus === 'Ahead of Schedule') {
    timelineAssessment = 'ahead of schedule';
  }
  
  let budgetAssessment = 'within budget';
  if (budgetUtilization > 90) {
    budgetAssessment = 'near budget limits';
  } else if (budgetUtilization > 100) {
    budgetAssessment = 'over budget';
  }
  
  return `The ${projectData.name} project is currently ${progress}% complete with a status of "${status}". It is ${timelineAssessment} to meet its ${completionDate} deadline and is ${budgetAssessment} with ${budgetUtilization}% of the total budget utilized.`;
};

module.exports = {
  generateAIInsights,
  generateProjectSummary
}; 