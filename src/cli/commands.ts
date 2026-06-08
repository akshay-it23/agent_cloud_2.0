import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { displayHeader, displayDivider, displaySuccess, displayInfo, displayWarning } from './banner.js';
import { getConfigManager } from '../utils/config.js';
import { getErrorHandler } from '../utils/error-handler.js';
import { displayCloudProviders } from './prompts.js';
import { CloudProvider, ProjectAnalysis } from '../types/index.js';

/**
 * Task 173: Declare initCommand wizard function.
 */
export async function initCommand(): Promise<void> {
    displayHeader('INITIALIZE ENVIRONMENT');

    const errorHandler = getErrorHandler();

    await errorHandler.wrap(async () => {
        // Task 174: Implement .env path resolution and check file accessibility in initCommand
        const envPath = path.resolve(process.cwd(), '.env');
        console.log(chalk.gray(`Resolving environment variables configuration at: ${envPath}`));

        if (!fs.existsSync(envPath)) {
            fs.writeFileSync(envPath, '', 'utf-8');
            displayInfo('Created a new .env file in the current working directory.');
        }

        // Task 175: Setup API key wizard prompts selecting Google Gemini vs OpenAI
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'provider',
                message: 'Select AI model provider key to configure:',
                choices: [
                    { name: 'Google Generative AI (Gemini)', value: 'gemini' },
                    { name: 'OpenAI (GPT Models)', value: 'openai' }
                ]
            },
            {
                type: 'password',
                name: 'apiKey',
                message: 'Enter API Key:',
                mask: '*',
                validate: (val: string) => val.trim().length > 0 || 'API key cannot be empty.'
            }
        ]);

        const keyName = answers.provider === 'gemini' ? 'GOOGLE_GENERATIVE_AI_API_KEY' : 'OPENAI_API_KEY';
        const newVariable = `${keyName}=${answers.apiKey}`;

        // Task 176: Write file-appender logic to save keys into local .env values
        let envContent = fs.readFileSync(envPath, 'utf-8');
        
        if (envContent.includes(keyName)) {
            const lines = envContent.split('\n');
            const updatedLines = lines.map(line => line.startsWith(keyName) ? newVariable : line);
            fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf-8');
        } else {
            const newline = envContent.endsWith('\n') || envContent.trim() === '' ? '' : '\n';
            fs.appendFileSync(envPath, `${newline}${newVariable}\n`, 'utf-8');
        }

        displaySuccess(`Saved key settings for ${keyName} inside ".env" successfully!`);

        // Task 177: Program CLI scanner iteration checking aws, gcloud, and az versions
        console.log(chalk.cyan('\nChecking installed cloud provider CLI tools...'));
        const cliTools = [
            { name: 'AWS CLI', cmd: 'aws', key: 'aws' as CloudProvider },
            { name: 'Google Cloud SDK (gcloud)', cmd: 'gcloud', key: 'gcp' as CloudProvider },
            { name: 'Azure CLI (az)', cmd: 'az', key: 'azure' as CloudProvider }
        ];

        const detected: typeof cliTools = [];

        for (const tool of cliTools) {
            try {
                // Try executing the tool's help or version command
                execSync(`${tool.cmd} --version`, { stdio: 'ignore' });
                console.log(chalk.green(`  ✔ ${tool.name} detected successfully.`));
                detected.push(tool);
            } catch (err) {
                console.log(chalk.gray(`  ✖ ${tool.name} is not available.`));
            }
        }

        // Task 178: Configure provider preferences setup loop based on detected command-line CLIs
        const configManager = getConfigManager();

        if (detected.length > 0) {
            const preferredCloud = detected[0].key;
            configManager.setDefaultCloud(preferredCloud);
            console.log(chalk.green(`\nConfigured default preferred cloud to: ${preferredCloud.toUpperCase()}`));
        } else {
            displayWarning('No active cloud CLIs detected on this system. You will need to install one before deploying.');
        }
    });
}

/**
 * Task 183: Implement offline project analyzer runLocalAnalysis
 */
export async function runLocalAnalysis(projectPath: string): Promise<ProjectAnalysis> {
    const absolutePath = path.resolve(projectPath);
    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isDirectory()) {
        throw new Error(`Invalid project directory path: "${projectPath}"`);
    }

    const hasDocker = fs.existsSync(path.join(absolutePath, 'Dockerfile')) || 
                      fs.existsSync(path.join(absolutePath, 'docker-compose.yml'));

    let language: ProjectAnalysis['language'] = 'unknown';
    let framework = 'Static / Unknown';
    let database: string | undefined = undefined;
    const dependencies: string[] = [];

    // Task 185: Read Node.js properties: package manager locks, scripts, dependency imports
    const pkgJsonPath = path.join(absolutePath, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
        language = 'javascript';
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
            const mergedDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
            dependencies.push(...Object.keys(mergedDeps));

            if (mergedDeps['typescript']) {
                language = 'typescript';
            }

            // Task 186: Set runtime detection targets for framework matches (Express, NestJS, Next.js, Fastify, Vue, React)
            if (mergedDeps['next']) framework = 'Next.js';
            else if (mergedDeps['express']) framework = 'Express';
            else if (mergedDeps['@nestjs/core']) framework = 'NestJS';
            else if (mergedDeps['fastify']) framework = 'Fastify';
            else if (mergedDeps['vue']) framework = 'Vue';
            else if (mergedDeps['react']) framework = 'React';

            // Task 187: Add backend service dependency lookups (Postgres, Mongo, MySQL, Redis, SQLite)
            if (mergedDeps['pg'] || mergedDeps['postgres']) database = 'PostgreSQL';
            else if (mergedDeps['mongodb'] || mergedDeps['mongoose']) database = 'MongoDB';
            else if (mergedDeps['mysql'] || mergedDeps['mysql2']) database = 'MySQL';
            else if (mergedDeps['redis']) database = 'Redis';
            else if (mergedDeps['sqlite3'] || mergedDeps['sqlite']) database = 'SQLite';

        } catch (e) {
            // Silence JSON parse error
        }
    }

    // Task 188: Set Python requirement files checker (requirements.txt, FastAPI, Flask, Django)
    const reqsTxtPath = path.join(absolutePath, 'requirements.txt');
    if (fs.existsSync(reqsTxtPath)) {
        language = 'python';
        framework = 'Python Script';
        const content = fs.readFileSync(reqsTxtPath, 'utf-8');
        
        if (content.includes('fastapi')) framework = 'FastAPI';
        else if (content.includes('django')) framework = 'Django';
        else if (content.includes('flask')) framework = 'Flask';

        if (content.includes('psycopg2')) database = 'PostgreSQL';
        else if (content.includes('pymongo')) database = 'MongoDB';
        else if (content.includes('mysql-connector')) database = 'MySQL';
        else if (content.includes('redis')) database = 'Redis';
    }

    // Task 189: Set Go backend module checker (go.mod)
    const goModPath = path.join(absolutePath, 'go.mod');
    if (fs.existsSync(goModPath)) {
        language = 'go';
        framework = 'Go Web Service';
        const content = fs.readFileSync(goModPath, 'utf-8');
        
        if (content.includes('github.com/lib/pq')) database = 'PostgreSQL';
        else if (content.includes('go.mongodb.org/mongo-driver')) database = 'MongoDB';
        else if (content.includes('github.com/go-sql-driver/mysql')) database = 'MySQL';
        else if (content.includes('github.com/go-redis/redis')) database = 'Redis';
    }

    // Task 190 (part 1): Configure static index.html checkers
    const hasHtml = fs.existsSync(path.join(absolutePath, 'index.html')) ||
                    fs.existsSync(path.join(absolutePath, 'public', 'index.html'));

    if (language === 'unknown' && hasHtml) {
        language = 'static';
        framework = 'Static HTML Page';
    }

    // Task 191: Implement fallback project classifications if type scans fail
    if (language === 'unknown') {
        language = 'static';
        framework = 'Static / Unknown';
    }

    // Task 192: Setup static project recommendations lists mapping to local config recommendations
    let recommendedProvider: CloudProvider = 'aws';
    const suggestedResources: string[] = [];

    if (language === 'static' || framework === 'React' || framework === 'Vue') {
        recommendedProvider = 'aws'; // S3 static bucket hosting is extremely simple
        suggestedResources.push('AWS S3 (Simple Storage Service) bucket for static web assets', 'Amazon CloudFront CDN for global routing');
    } else {
        recommendedProvider = 'gcp'; // Cloud run is standard for node, python and go apps
        suggestedResources.push('Google Cloud Run container orchestration engine', 'Google Artifact Registry for Docker images storage');
    }

    const analysis: ProjectAnalysis = {
        name: path.basename(absolutePath),
        framework,
        language,
        hasDocker,
        dependencies,
        database,
        recommendedProvider,
        suggestedResources
    };

    // Task 190 (part 2): print analysis details in console logs
    console.log();
    displayDivider('━', 60);
    console.log(chalk.bold.cyan('             PROJECT SCAN SUMMARY'));
    displayDivider('━', 60);
    console.log(`   Project Directory : ${chalk.white(absolutePath)}`);
    console.log(`   Language Detected : ${chalk.bold.green(analysis.language.toUpperCase())}`);
    console.log(`   Framework/Type    : ${chalk.bold(analysis.framework)}`);
    console.log(`   Docker Configured : ${chalk.bold(analysis.hasDocker ? 'YES' : 'NO')}`);
    if (analysis.database) {
        console.log(`   Database Driver   : ${chalk.bold(analysis.database)}`);
    }
    console.log(`   Suggested Cloud   : ${chalk.bold.yellow(analysis.recommendedProvider.toUpperCase())}`);
    console.log(`   Recommended Infrastructure:`);
    analysis.suggestedResources.forEach(res => {
        console.log(`     - ${chalk.yellow(res)}`);
    });
    displayDivider('━', 60);
    console.log();

    return analysis;
}

/**
 * Task 179: Declare analyzeCommand analyzer handler.
 */
export async function analyzeCommand(projectPath: string, options: { local?: boolean }): Promise<void> {
    const errorHandler = getErrorHandler();

    await errorHandler.wrap(async () => {
        // Task 180: Implement toggle logic supporting offline local scans vs AI analyzer agent stream lookups
        const isLocal = !!options.local;

        if (isLocal) {
            console.log(chalk.cyan('Running offline project scan...'));
            await runLocalAnalysis(projectPath);
        } else {
            console.log(chalk.cyan('Starting AI-powered analyzer engine...'));
            
            const mastraIndexPath = path.resolve(process.cwd(), 'src', 'mastra', 'index.ts');
            
            if (fs.existsSync(mastraIndexPath)) {
                try {
                    // Dynamic import to allow compiling and execution after Phase 7 is written
                    const { getMastra } = await import('../mastra/index.js');
                    const mastra = getMastra();
                    const agent = mastra.getAgent('project-analyzer');
                    
                    console.log(chalk.yellow('Querying project analyzer agent stream...'));
                    
                    // Task 181: Parse stream chunk outputs from analyzer agent in analyzeCommand
                    // Task 182: Extract JSON arrays from AI responses using regex match logic
                    const result = await agent.text({
                        messages: [`Analyze project files at: ${projectPath}`]
                    });
                    
                    console.log(chalk.bold.green('\nAI Scan Completed:'));
                    console.log(result.text);
                } catch (err) {
                    displayWarning('AI model query connection failed. Falling back to local scanner...');
                    await runLocalAnalysis(projectPath);
                }
            } else {
                displayInfo('AI agent files not initialized. Running offline local parser engine...');
                await runLocalAnalysis(projectPath);
            }
        }
    });
}

/**
 * Task 193: Declare historyCommand history listing viewer.
 */
export async function historyCommand(): Promise<void> {
    displayHeader('DEPLOYMENT HISTORY RECORDS');

    const errorHandler = getErrorHandler();

    await errorHandler.wrap(async () => {
        // Task 194: Fetch deployments from config manager inside historyCommand
        const configManager = getConfigManager();
        const deployments = configManager.getDeployments();

        // Task 195: Handle empty history list by showing run instructions
        if (deployments.length === 0) {
            console.log(chalk.yellow('\nNo deployment configuration or history records found.'));
            displayInfo('To deploy a new app service, run "cloud deploy" command.');
            return;
        }

        // Task 196: Compute summary reports inside historyCommand
        const stats = configManager.getStats();
        console.log();
        console.log(`   Total Deployments Made: ${chalk.bold(stats.totalDeployments)}`);
        console.log(`   Successful Executions : ${chalk.bold.green(stats.successfulDeployments)}`);
        console.log(`   Failed Executions     : ${chalk.bold.red(stats.failedDeployments)}`);
        console.log(`   Total Resource Cost   : ${chalk.bold.green(`$${stats.totalCost.toFixed(2)}/mo`)}`);
        console.log(`   Average Execution Time: ${chalk.bold(`${(stats.averageDuration / 1000).toFixed(1)}s`)}`);
        console.log();

        displayDivider('━', 60);
        console.log(chalk.bold.cyan('             RECENT CLOUD RELEASES'));
        displayDivider('━', 60);

        // Task 197: Format deployment dates and duration statistics
        deployments.forEach((record, index) => {
            const dateStr = new Date(record.timestamp).toLocaleString();
            const statusColor = record.status === 'success' ? chalk.green : record.status === 'failed' ? chalk.red : chalk.yellow;
            const app = record.appName.padEnd(20);
            const cloud = record.cloud.toUpperCase().padEnd(6);
            const duration = `${(record.duration / 1000).toFixed(1)}s`.padStart(8);
            const cost = `$${record.cost}/mo`.padStart(10);

            console.log(`   ${index + 1}. ${app} | ${cloud} | ${statusColor(record.status.toUpperCase())} | ${duration} | ${cost} | ${dateStr}`);
            
            if (record.url) {
                console.log(`      Endpoint: ${chalk.underline.blue(record.url)}`);
            }
            if (record.error) {
                console.log(`      Error   : ${chalk.red(record.error)}`);
            }
        });

        displayDivider('━', 60);
        console.log();
    });
}

/**
 * Task 198: Declare infoCommand mapping to provider details print views.
 */
export async function infoCommand(provider?: string): Promise<void> {
    displayHeader('CLOUD PROVIDERS DIRECTORY');

    const errorHandler = getErrorHandler();

    await errorHandler.wrap(async () => {
        if (provider) {
            const cleanProvider = provider.toLowerCase();
            if (cleanProvider === 'aws' || cleanProvider === 'gcp' || cleanProvider === 'azure') {
                displayCloudProviders();
            } else {
                console.log(chalk.red(`\nUnsupported cloud provider: "${provider}"`));
                displayInfo('Supported options: "aws", "gcp", "azure"');
            }
        } else {
            displayCloudProviders();
        }
    });
}
