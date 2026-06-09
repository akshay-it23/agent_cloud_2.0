#!/usr/bin/env node

// Task 200: Import dotenv configuration variables
import 'dotenv/config';

// Task 201: Import commander Command class
import { Command } from 'commander';

// Task 202: Import setup wizard actions, workflow commands, banners, and handlers
import { displayBanner } from './banner.js';
import { setupGlobalErrorHandlers } from './error-handler.js';
import { 
    initCommand, 
    analyzeCommand, 
    historyCommand, 
    infoCommand 
} from './commands.js';
import { runWorkflowDeployment, runWorkflowStatus } from './workflow-commands.js';
import chalk from 'chalk';

// Setup global exception/signal catching
setupGlobalErrorHandlers();

// Task 203: Write CLI main setup
const program = new Command();

// Task 204: Configure CLI application name and description inside main
program
    .name('cloud')
    .description('AI-Powered Cloud Deployment CLI using Mastra')
    .version('1.0.0');

// Task 205: Define option --deploy (Fast Deployment demo trigger)
program
    .option('--deploy', 'Fast Deployment demo trigger');

// Task 206: Bind init command option structure
program
    .command('init')
    .description('Initialize environment configurations and cloud credentials')
    .action(async () => {
        await initCommand();
    });

// Task 207: Bind analyze command option structure matching local scans
program
    .command('analyze [path]')
    .description('Scan project frameworks, database drivers, and local configurations')
    .option('-l, --local', 'Force local scan without querying the AI agent', false)
    .action(async (pathArg, options) => {
        const targetPath = pathArg || '.';
        await analyzeCommand(targetPath, options);
    });

// Task 208: Bind deploy command options (cloud provider, path override, auto-approve, dry-run)
program
    .command('deploy [path]')
    .description('Package and deploy services to the target cloud provider')
    .option('-c, --cloud <cloud>', 'Selected cloud provider ("aws", "gcp", "azure")')
    .option('-a, --auto-approve', 'Automatically proceed without visual plan confirmation', false)
    .option('-d, --dry-run', 'Inspect planning logic and check resource access without execution', false)
    .action(async (pathArg, options) => {
        const targetPath = pathArg || '.';
        await runWorkflowDeployment(targetPath, options);
    });

// Task 209: Bind status command options
program
    .command('status')
    .description('Check execution progress or endpoints of your deployments')
    .action(async () => {
        await runWorkflowStatus();
    });

// Task 210 (part 1): Bind history and info commands
program
    .command('history')
    .description('Show execution log report and aggregate stats of recent releases')
    .action(async () => {
        await historyCommand();
    });

program
    .command('info [provider]')
    .description('Show cloud support information and doc references')
    .action(async (provider) => {
        await infoCommand(provider);
    });

// Task 210 (part 2): start runner process execution parsing logic
const args = process.argv;

if (args.length <= 2) {
    displayBanner();
    program.outputHelp();
} else {
    // Check if --deploy was passed directly
    if (args.includes('--deploy')) {
        displayBanner();
        console.log(chalk.green('\n🚀 Starting Fast Deployment demo trigger...'));
        console.log(chalk.gray('Demo mode: Running local project analysis in current directory.'));
        analyzeCommand('.', { local: true });
    } else {
        program.parse(args);
    }
}
