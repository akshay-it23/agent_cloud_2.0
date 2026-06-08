// Task 301: Create src/mastra/index.ts file at the mastra subdirectory
// Task 302: Import Mastra core engine module class
import { Mastra } from '@mastra/core';

// Task 303: Import LibSQLStore database manager
import { LibSQLStore } from '@mastra/libsql';

// Task 304: Import custom AI agents (analyzer, deployment, validator)
import { 
    analyzerAgent, 
    validatorAgent, 
    deploymentAgent 
} from './agents/index.js';

// Task 305: Import workflows configuration settings
import { deploymentWorkflow } from './workflows/deployment.js';

// Task 308: Initialize local storage configuration LibSQLStore URL pointing to local database path file ./agent-cloud.db
const storage = new LibSQLStore({
    id: 'agent-cloud-storage',
    url: 'file:./agent-cloud.db'
});

// Task 306: Configure Mastra constructor settings binding agent instances
// Task 307: Register deployment workflows inside Mastra config declarations
const mastraInstance = new Mastra({
    agents: {
        'project-analyzer': analyzerAgent,
        'environment-validator': validatorAgent,
        'deployment-planner': deploymentAgent
    },
    workflows: {
        'deployment-workflow': deploymentWorkflow
    },
    storage
});

// Task 309: Export initialized Mastra instance parameters
export const mastra = mastraInstance;

export function getMastra(): Mastra {
    return mastraInstance;
}
