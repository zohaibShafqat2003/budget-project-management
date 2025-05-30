import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface AITaskSuggestion {
  title: string
  description: string
  estimatedHours: number
  estimatedCost: number
  priority: "low" | "medium" | "high" | "urgent"
  subtasks?: string[]
}

export interface AIProjectInsight {
  type: "budget_alert" | "timeline_risk" | "resource_optimization" | "performance_insight"
  title: string
  description: string
  severity: "low" | "medium" | "high"
  recommendation: string
}

export async function generateTaskSuggestions(
  projectDescription: string,
  existingTasks: string[],
  budget: number,
): Promise<AITaskSuggestion[]> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an expert project manager. Generate realistic task suggestions for a project based on the description, considering existing tasks and budget constraints. Return a JSON array of task objects with title, description, estimatedHours, estimatedCost, priority, and optional subtasks array.`,
      prompt: `
        Project Description: ${projectDescription}
        Existing Tasks: ${existingTasks.join(", ")}
        Available Budget: $${budget}
        
        Generate 3-5 new task suggestions that complement the existing tasks and fit within the budget.
      `,
    })

    return JSON.parse(text) as AITaskSuggestion[]
  } catch (error) {
    console.error("AI task generation error:", error)
    return []
  }
}

export async function generateProjectInsights(
  projectData: any,
  tasks: any[],
  budgetEntries: any[],
): Promise<AIProjectInsight[]> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an AI project management consultant. Analyze project data and provide actionable insights about budget, timeline, resources, and performance. Return a JSON array of insight objects.`,
      prompt: `
        Project: ${JSON.stringify(projectData)}
        Tasks: ${JSON.stringify(tasks)}
        Budget Entries: ${JSON.stringify(budgetEntries)}
        
        Analyze this data and provide 2-4 key insights with recommendations.
      `,
    })

    return JSON.parse(text) as AIProjectInsight[]
  } catch (error) {
    console.error("AI insights generation error:", error)
    return []
  }
}

export async function estimateTaskCost(
  taskDescription: string,
  complexity: "simple" | "medium" | "complex",
  hourlyRate = 75,
): Promise<{ hours: number; cost: number }> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an expert project estimator. Provide realistic time and cost estimates for tasks. Return JSON with "hours" and "cost" properties.`,
      prompt: `
        Task: ${taskDescription}
        Complexity: ${complexity}
        Hourly Rate: $${hourlyRate}
        
        Estimate the hours needed and calculate the total cost.
      `,
    })

    return JSON.parse(text)
  } catch (error) {
    console.error("AI cost estimation error:", error)
    return { hours: 8, cost: hourlyRate * 8 }
  }
}
