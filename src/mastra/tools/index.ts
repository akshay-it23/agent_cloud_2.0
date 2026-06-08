import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const fileSystemTool = createTool({
  id: 'file-system-tool',
  description: 'Scans directory structure ignoring node_modules/git directories',
  inputSchema: z.object({ path: z.string().optional() }),
  outputSchema: z.object({ files: z.array(z.string()) }),
  execute: async ({ context }) => {
    return { files: [] };
  }
});

export const fileReaderTool = createTool({
  id: 'file-reader-tool',
  description: 'Reads a file content and returns file content strings',
  inputSchema: z.object({ path: z.string() }),
  outputSchema: z.object({ content: z.string() }),
  execute: async ({ context }) => {
    return { content: '' };
  }
});

export const dependencyAnalyzerTool = createTool({
  id: 'dependency-analyzer-tool',
  description: 'Analyzes project dependencies and maps framework configurations',
  inputSchema: z.object({ dependencies: z.array(z.string()) }),
  outputSchema: z.object({ frameworks: z.array(z.string()) }),
  execute: async ({ context }) => {
    return { frameworks: [] };
  }
});

export const packageJsonParserTool = createTool({
  id: 'package-json-parser-tool',
  description: 'Parses package.json to extract build and start scripts and other properties',
  inputSchema: z.object({ path: z.string() }),
  outputSchema: z.object({ packageJson: z.any() }),
  execute: async ({ context }) => {
    return { packageJson: {} };
  }
});
