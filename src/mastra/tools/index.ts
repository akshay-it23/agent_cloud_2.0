// Task 342: Import createTool from Mastra core tools
import { createTool } from '@mastra/core/tools';
// Task 343: Import zod for schemas definitions
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Helper to recursively walk a directory
function walkDir(dir: string, baseDir: string = dir): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) {
        return results;
    }
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        // Task 345: Implement folder scanners inside fileSystemTool ignoring node_modules/git directories
        if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.agent-cloud') {
            continue;
        }
        
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(filePath, baseDir));
        } else {
            const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');
            results.push(relativePath);
        }
    }
    return results;
}

// Task 344: Define fileSystemTool parameter configurations
export const fileSystemTool = createTool({
    id: 'file-system-tool',
    description: 'Scans directory structure recursively and returns relative file paths, ignoring node_modules and .git directories',
    inputSchema: z.object({
        path: z.string().optional().describe('Target directory path to scan (defaults to project root)')
    }),
    outputSchema: z.object({
        files: z.array(z.string())
    }),
    execute: async ({ context }) => {
        const targetPath = path.resolve(process.cwd(), context.path || '.');
        const files = walkDir(targetPath);
        return { files };
    }
});

// Task 346: Define fileReaderTool parameter configurations
export const fileReaderTool = createTool({
    id: 'file-reader-tool',
    description: 'Reads any file content from the filesystem and returns its content as a UTF-8 string',
    inputSchema: z.object({
        path: z.string().describe('Target filepath to read')
    }),
    outputSchema: z.object({
        content: z.string()
    }),
    // Task 347: Implement file reader logic inside fileReaderTool returning file content strings
    execute: async ({ context }) => {
        const filePath = path.resolve(process.cwd(), context.path);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${context.path}`);
        }
        const stat = fs.statSync(filePath);
        if (!stat.isFile()) {
            throw new Error(`Target path is not a file: ${context.path}`);
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        return { content };
    }
});

// Task 348: Define dependencyAnalyzerTool parameter configurations
export const dependencyAnalyzerTool = createTool({
    id: 'dependency-analyzer-tool',
    description: 'Analyzes a list of dependencies to identify frameworks and databases',
    inputSchema: z.object({
        dependencies: z.array(z.string()).describe('List of dependencies package names to analyze')
    }),
    outputSchema: z.object({
        frameworks: z.array(z.string()),
        database: z.string().optional()
    }),
    // Task 349: Implement dependency analyzer logic mapping framework configurations
    execute: async ({ context }) => {
        const frameworkMap: Record<string, string> = {
            'next': 'Next.js',
            'express': 'Express',
            '@nestjs/core': 'NestJS',
            'fastify': 'Fastify',
            'vue': 'Vue',
            'react': 'React'
        };

        const dbMap: Record<string, string> = {
            'pg': 'PostgreSQL',
            'postgres': 'PostgreSQL',
            'mongodb': 'MongoDB',
            'mongoose': 'MongoDB',
            'mysql': 'MySQL',
            'mysql2': 'MySQL',
            'redis': 'Redis',
            'sqlite3': 'SQLite',
            'sqlite': 'SQLite'
        };

        const frameworks: string[] = [];
        let database: string | undefined = undefined;

        for (const dep of context.dependencies) {
            // Check direct match or substring map for framework name keys
            for (const key of Object.keys(frameworkMap)) {
                if (dep.includes(key)) {
                    frameworks.push(frameworkMap[key]);
                }
            }
            // Check db keys
            if (dbMap[dep]) {
                database = dbMap[dep];
            }
        }

        // Deduplicate frameworks
        const uniqueFrameworks = Array.from(new Set(frameworks));

        return {
            frameworks: uniqueFrameworks,
            database
        };
    }
});

// Task 350: Define packageJsonParserTool parameter configurations
export const packageJsonParserTool = createTool({
    id: 'package-json-parser-tool',
    description: 'Parses package.json to extract name, scripts, dependencies, and devDependencies',
    inputSchema: z.object({
        path: z.string().optional().describe('Relative path to package.json (defaults to package.json in current directory)')
    }),
    outputSchema: z.object({
        name: z.string().optional(),
        scripts: z.record(z.string()),
        dependencies: z.record(z.string()),
        devDependencies: z.record(z.string())
    }),
    // Task 351: Implement JSON parsing logic extracting build/start script properties
    execute: async ({ context }) => {
        const filePath = path.resolve(process.cwd(), context.path || 'package.json');
        if (!fs.existsSync(filePath)) {
            throw new Error(`package.json file not found at: ${context.path || 'package.json'}`);
        }
        const pkgContent = fs.readFileSync(filePath, 'utf-8');
        const pkg = JSON.parse(pkgContent);

        return {
            name: pkg.name || '',
            scripts: pkg.scripts || {},
            dependencies: pkg.dependencies || {},
            devDependencies: pkg.devDependencies || {}
        };
    }
});
