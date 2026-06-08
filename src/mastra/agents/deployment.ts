// Task 330: Import Agent class
import { Agent } from '@mastra/core/agent';
// Task 331: Import serviceMapper, costEstimator, commandGenerator tools
import { 
    serviceMapperTool, 
    costEstimatorTool, 
    commandGeneratorTool 
} from '../tools/deployment.js';

// Prioritize API key models
function getDeploymentModel(): string {
    if (process.env.XAI_API_KEY) {
        return 'xai/grok-2';
    }
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY) {
        return 'google/gemini-2.0-flash';
    }
    if (process.env.OPENAI_API_KEY) {
        return 'openai/gpt-4o';
    }
    return 'google/gemini-2.0-flash'; // Fallback default
}

// Task 333: Write planner instructions mapping inputs to services, costs, and setup steps
// Task 334: Embed planner JSON schemas
const plannerInstructions = `You are an expert Cloud Deployment Planner.
Given the target cloud provider, region, and project details, your task is to plan the required cloud infrastructure:
1. Map project framework features to specific cloud services (AWS, GCP, or Azure).
2. Calculate the total monthly resource cost estimate.
3. List the sequential setup/deploy steps.
4. Generate the required terminal commands.

You MUST output your response strictly as a JSON object matching this schema:
{
  "appName": "string (e.g. 'my-app')",
  "cloud": "string ('aws' | 'gcp' | 'azure')",
  "region": "string",
  "services": [
    {
      "name": "string (unique name for the service)",
      "type": "string (type of service, e.g., 'Cloud Run', 'S3 Bucket')",
      "costEstimate": number (monthly cost in USD)
    }
  ],
  "totalEstimatedCost": number (sum of service costs),
  "steps": ["string (step description)"],
  "commands": ["string (concrete cli command)"]
}
Ensure no additional conversational text is output. Just output the raw JSON.`;

// Task 332: Declare deploymentAgent instance
// Task 335: Register tools onto the deployment agent
// Task 336: Set retries
export const deploymentAgent = new Agent({
    id: 'deployment-planner',
    name: 'Deployment Planner',
    instructions: plannerInstructions,
    model: getDeploymentModel(),
    tools: {
        serviceMapperTool,
        costEstimatorTool,
        commandGeneratorTool
    },
    // Set retries on the agent
    maxRetries: 3
});
