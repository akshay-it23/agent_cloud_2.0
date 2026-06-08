import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { execSync } from 'child_process';

// Task 362: Define cliCheckerTool properties
export const cliCheckerTool = createTool({
    id: 'cli-checker-tool',
    description: 'Checks presence/version of CLI tools on the local system',
    inputSchema: z.object({
        clis: z.array(z.string()).describe('List of binaries to verify (e.g. ["aws", "gcloud", "az"])')
    }),
    outputSchema: z.object({
        available: z.record(z.boolean())
    }),
    // Task 363: Implement command executions looking up version strings inside cliCheckerTool
    execute: async ({ context }) => {
        const available: Record<string, boolean> = {};
        const safeClis = ['aws', 'gcloud', 'az', 'docker'];

        for (const cli of context.clis) {
            const cleanCli = cli.trim().toLowerCase();
            if (!safeClis.includes(cleanCli)) {
                available[cli] = false;
                continue;
            }

            try {
                // Execute version query to verify CLI is installed
                execSync(`${cleanCli} --version`, { stdio: 'ignore', timeout: 2000 });
                available[cli] = true;
            } catch (err) {
                available[cli] = false;
            }
        }

        return { available };
    }
});

// Task 364: Define authCheckerTool properties
export const authCheckerTool = createTool({
    id: 'auth-checker-tool',
    description: 'Checks validity of credential setup and authentication for cloud providers',
    inputSchema: z.object({
        cloud: z.string().describe('Target cloud provider to check authentication status')
    }),
    outputSchema: z.object({
        authenticated: z.boolean()
    }),
    execute: async ({ context }) => {
        const cloud = context.cloud.toLowerCase();
        let authenticated = false;

        try {
            // Task 365: Implement STS caller check operations inside authCheckerTool for AWS
            if (cloud === 'aws') {
                execSync('aws sts get-caller-identity', { stdio: 'ignore', timeout: 3000 });
                authenticated = true;
            } 
            // Task 366: Implement account status check operations inside authCheckerTool for GCP
            else if (cloud === 'gcp') {
                // Get active authentication account to verify auth session is valid
                execSync('gcloud auth list --filter=status:ACTIVE --format="value(account)"', { stdio: 'ignore', timeout: 3000 });
                authenticated = true;
            } 
            // Task 367: Implement account configuration check operations inside authCheckerTool for Azure
            else if (cloud === 'azure') {
                execSync('az account show', { stdio: 'ignore', timeout: 3000 });
                authenticated = true;
            }
        } catch (err) {
            authenticated = false;
        }

        return { authenticated };
    }
});

// Task 368: Define envVarCheckerTool properties
export const envVarCheckerTool = createTool({
    id: 'env-var-checker-tool',
    description: 'Checks required environment variables status',
    inputSchema: z.object({
        vars: z.array(z.string()).describe('List of environment variable keys to check')
    }),
    outputSchema: z.object({
        status: z.record(z.boolean())
    }),
    // Task 369: Implement environment checks validating access properties in envVarCheckerTool
    execute: async ({ context }) => {
        const status: Record<string, boolean> = {};

        for (const key of context.vars) {
            const value = process.env[key];
            status[key] = value !== undefined && value !== '';
        }

        return { status };
    }
});

// Task 370: Define networkCheckerTool properties
export const networkCheckerTool = createTool({
    id: 'network-checker-tool',
    description: 'Checks internet and cloud provider connection latency',
    inputSchema: z.object({
        host: z.string().describe('Target domain or endpoint hostname to check connectivity')
    }),
    outputSchema: z.object({
        online: z.boolean(),
        latencyMs: z.number()
    }),
    // Task 371: Implement curl execution logic inside networkCheckerTool calculating connection latencies
    execute: async ({ context }) => {
        const host = context.host.replace(/[^a-zA-Z0-9.-]/g, ''); // sanitize hostname input
        const start = Date.now();
        let online = false;
        let latencyMs = -1;

        try {
            // Measure connection latency using curl
            execSync(`curl -sI https://${host}`, { stdio: 'ignore', timeout: 3000 });
            latencyMs = Date.now() - start;
            online = true;
        } catch (err) {
            online = false;
            latencyMs = -1;
        }

        return { online, latencyMs };
    }
});

// Permissions checker remains a stub for now (implemented in tasks 372-375)
export const permissionsCheckerTool = createTool({
    id: 'permissions-checker-tool',
    description: 'Checks permissions and policies granted to the cloud user',
    inputSchema: z.object({
        cloud: z.string().describe('Target cloud provider to check IAM permission scope')
    }),
    outputSchema: z.object({
        hasPermission: z.boolean()
    }),
    execute: async ({ context }) => {
        return { hasPermission: true };
    }
});
