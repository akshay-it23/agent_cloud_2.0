// Task 322: Import Agent class constructor
import { Agent } from '@mastra/core/agent';
// Task 323: Import validator checker tools
import { 
    cliCheckerTool, 
    authCheckerTool, 
    envVarCheckerTool, 
    networkCheckerTool, 
    permissionsCheckerTool 
} from '../tools/validator.js';

// Task 327: Configure agent LLM model fallback chains
function getValidatorModelFallback(): string[] {
    const models: string[] = [];
    if (process.env.XAI_API_KEY) {
        models.push('xai/grok-2');
    }
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY) {
        models.push('google/gemini-2.0-flash');
        models.push('google/gemini-pro');
    }
    if (process.env.OPENAI_API_KEY) {
        models.push('openai/gpt-4o');
    }
    // Ensure we have at least one fallback in the list
    if (models.length === 0) {
        models.push('google/gemini-2.0-flash');
    }
    return models;
}

// Task 326: Design validator prompts outlining verification checks (CLI tools, auth, env, network, permissions)
const validatorInstructions = `You are an Environment Validation Agent.
Your job is to check the local development environment and cloud settings to ensure readiness for deployment.
Perform validation checks across these areas:
1. CLI Tools: Determine if necessary cloud CLI binaries (aws, gcloud, az) are installed.
2. Cloud Authentication: Validate if the credentials for the target cloud provider are active and valid.
3. Environment Variables: Verify if required configuration variables are correctly defined.
4. Network Status: Check network connectivity and latency to target cloud platforms.
5. Cloud Permissions: Verify if the current user/role has sufficient permissions to create resources.

Utilize the validator tools to execute these checks. Generate a final validation report outlining errors, warnings, and recommendations.`;

// Task 324: Declare validatorAgent instance
// Task 325: Configure agent ID 'environment-validator' and name properties
// Task 328: Register checker tools onto the validator agent config
export const validatorAgent = new Agent({
    id: 'environment-validator',
    name: 'Environment Validator',
    instructions: validatorInstructions,
    model: getValidatorModelFallback(),
    tools: {
        cliCheckerTool,
        authCheckerTool,
        envVarCheckerTool,
        networkCheckerTool,
        permissionsCheckerTool
    }
});
