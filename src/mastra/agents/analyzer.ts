// Task 312: Import Agent class constructor from Mastra
import { Agent } from '@mastra/core/agent';
// Task 313: Import analyzer tools configurations
import { 
    fileSystemTool, 
    fileReaderTool, 
    dependencyAnalyzerTool, 
    packageJsonParserTool 
} from '../tools/index.js';

// Task 318: Configure model selection checks prioritizing XAI_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, or OPENAI_API_KEY models
function getModelSelection(): string {
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

// Task 316: Write System prompts defining DevOps project scanning logic steps
// Task 317: Embed structural JSON response schemas inside analyzer prompt guidelines
const analyzerInstructions = `You are a professional DevOps Project Analyzer.
Your task is to scan the project directory to determine:
1. The primary language (javascript, typescript, python, go, or static).
2. The web application framework (Express, NestJS, Next.js, FastAPI, Flask, etc.).
3. The database or caching backend if configured (PostgreSQL, MongoDB, MySQL, Redis, SQLite).
4. Whether Docker configurations exist (Dockerfile, docker-compose.yml).
5. Dependencies used in the project.

Use the provided tools to scan directories, read file contents, analyze dependencies, and parse configuration files.

You MUST respond strictly with a valid JSON object matching the following structure:
{
  "name": "string (project folder name)",
  "framework": "string (detected framework name, default 'Static / Unknown')",
  "language": "string ('javascript' | 'typescript' | 'python' | 'go' | 'static' | 'unknown')",
  "hasDocker": boolean,
  "dependencies": ["string"],
  "database": "string | null (e.g. 'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'SQLite')",
  "recommendedProvider": "string ('aws' | 'gcp' | 'azure')",
  "suggestedResources": ["string"]
}
Ensure no additional conversational text is output. Just output the raw JSON.`;

// Task 314: Declare analyzerAgent instance
// Task 315: Setup agent configuration ID ('project-analyzer') and name
// Task 319: Register fileSystem, reader, analyzer, parser tools onto the analyzer agent
// Task 320: Set maximum retries properties
export const analyzerAgent = new Agent({
    id: 'project-analyzer',
    name: 'Project Analyzer',
    instructions: analyzerInstructions,
    model: getModelSelection(),
    tools: {
        fileSystemTool,
        fileReaderTool,
        dependencyAnalyzerTool,
        packageJsonParserTool
    },
    // Set retries on the agent
    maxRetries: 3
});
