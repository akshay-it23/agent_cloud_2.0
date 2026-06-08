// Task 376: Create src/mastra/tools/executor.ts file
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { execSync } from 'child_process';

// Task 377: Define commandExecutorTool properties executing command strings
export const commandExecutorTool = createTool({
    id: 'command-executor-tool',
    description: 'Executes generic shell command strings directly on the system',
    inputSchema: z.object({
        command: z.string().describe('The command string to execute')
    }),
    outputSchema: z.object({
        stdout: z.string(),
        stderr: z.string(),
        success: z.boolean()
    }),
    execute: async ({ context }) => {
        try {
            const stdout = execSync(context.command, { encoding: 'utf-8', timeout: 30000 });
            return { stdout, stderr: '', success: true };
        } catch (err: any) {
            return {
                stdout: err.stdout || '',
                stderr: err.stderr || err.message || 'Execution error',
                success: false
            };
        }
    }
});

// Task 378: Define awsCommandTool execution parameters
export const awsCommandTool = createTool({
    id: 'aws-command-tool',
    description: 'Safely executes AWS CLI commands helper',
    inputSchema: z.object({
        args: z.array(z.string()).describe('The array of arguments for aws command, e.g. ["s3", "ls"]')
    }),
    outputSchema: z.object({
        stdout: z.string(),
        stderr: z.string(),
        success: z.boolean()
    }),
    execute: async ({ context }) => {
        // Sanitize arguments to block command injection
        const cleanArgs = context.args.map(arg => arg.replace(/[^a-zA-Z0-9_./=\-]/g, ''));
        const fullCmd = `aws ${cleanArgs.join(' ')}`;

        try {
            const stdout = execSync(fullCmd, { encoding: 'utf-8', timeout: 30000 });
            return { stdout, stderr: '', success: true };
        } catch (err: any) {
            return {
                stdout: err.stdout || '',
                stderr: err.stderr || err.message || 'Execution error',
                success: false
            };
        }
    }
});

// Task 379: Define dockerBuildTool configuration properties
export const dockerBuildTool = createTool({
    id: 'docker-build-tool',
    description: 'Builds a Docker container image using local Docker client tool',
    inputSchema: z.object({
        imageName: z.string().describe('Target docker image repository tag name'),
        contextPath: z.string().optional().default('.').describe('Relative or absolute path for Docker build context')
    }),
    outputSchema: z.object({
        success: z.boolean(),
        log: z.string()
    }),
    // Task 380: Implement docker build terminal executor script logic
    execute: async ({ context }) => {
        const buildPath = context.contextPath || '.';
        // Sanitize image name and build path to prevent command injection
        const cleanImage = context.imageName.replace(/[^a-zA-Z0-9_.\-:/]/g, '');
        const cleanPath = buildPath.replace(/[^a-zA-Z0-9_.\-\\/]/g, '');
        const cmd = `docker build -t ${cleanImage} ${cleanPath}`;

        try {
            const log = execSync(cmd, { encoding: 'utf-8', timeout: 60000 });
            return { success: true, log };
        } catch (err: any) {
            return {
                success: false,
                log: err.stdout || err.message || 'Docker build failed'
            };
        }
    }
});
