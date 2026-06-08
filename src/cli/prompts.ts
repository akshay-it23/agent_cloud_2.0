import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { 
    CloudProvider, 
    DeploymentRequirements, 
    CloudProviderConfig, 
    DeploymentPlan 
} from '../types/index.js';

// Task 160: Define CLOUD_PROVIDERS configuration dictionary with CLI paths and doc links
export const CLOUD_PROVIDERS = {
    aws: {
        name: 'Amazon Web Services (AWS)',
        cli: 'aws',
        docs: 'https://docs.aws.amazon.com/'
    },
    gcp: {
        name: 'Google Cloud Platform (GCP)',
        cli: 'gcloud',
        docs: 'https://cloud.google.com/docs'
    },
    azure: {
        name: 'Microsoft Azure',
        cli: 'az',
        docs: 'https://docs.microsoft.com/azure/'
    }
};

/**
 * Task 161: Implement displayWelcome information writer.
 */
export function displayWelcome(): void {
    console.log();
    console.log(chalk.bold.cyan('============================================================'));
    console.log(chalk.bold.cyan('           Welcome to Agent-Cloud Deployment CLI            '));
    console.log(chalk.bold.cyan('============================================================'));
    console.log(chalk.gray('  Your AI-powered assistant for analyzing, preparing, and  '));
    console.log(chalk.gray('  deploying services to AWS, GCP, and Microsoft Azure.     '));
    console.log();
}

/**
 * Task 162: Implement collectDeploymentRequirements questionnaire builder.
 */
export async function collectDeploymentRequirements(): Promise<DeploymentRequirements> {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'appName',
            message: 'Enter application name:',
            validate: (val: string) => {
                if (val.trim().length < 3) {
                    return 'Application name must be at least 3 characters long.';
                }
                return true;
            }
        },
        // Task 163: Setup deployment description input with inquirer validation rule (minimum 3 chars)
        {
            type: 'input',
            name: 'description',
            message: 'Enter deployment description:',
            validate: (val: string) => {
                if (val.trim().length < 3) {
                    return 'Description must be at least 3 characters long.';
                }
                return true;
            }
        },
        // Task 164: Setup cloud selection prompt with pretty icons and descriptions
        {
            type: 'list',
            name: 'cloud',
            message: 'Select target cloud provider:',
            choices: [
                { 
                    name: `${chalk.yellow('☁️  AWS')} - Amazon Web Services (Fargate, Lambda, S3)`, 
                    value: 'aws' 
                },
                { 
                    name: `${chalk.green('☁️  GCP')} - Google Cloud Platform (Cloud Run, Cloud Functions, GAE)`, 
                    value: 'gcp' 
                },
                { 
                    name: `${chalk.blue('☁️  Azure')} - Microsoft Azure (Container Apps, Azure Functions)`, 
                    value: 'azure' 
                }
            ]
        }
    ]);

    let defaultRegion = 'us-east-1';
    if (answers.cloud === 'gcp') defaultRegion = 'us-central1';
    if (answers.cloud === 'azure') defaultRegion = 'eastus';

    const regionAnswer = await inquirer.prompt([
        {
            type: 'input',
            name: 'region',
            message: `Enter target region for ${answers.cloud.toUpperCase()}:`,
            default: defaultRegion
        }
    ]);

    return {
        appName: answers.appName,
        cloud: answers.cloud as CloudProvider,
        region: regionAnswer.region
    };
}

/**
 * Task 165: Implement confirmDeploymentPlan review layout logic.
 */
export async function confirmDeploymentPlan(plan: DeploymentPlan): Promise<boolean> {
    console.log();
    const border = '━'.repeat(60);
    console.log(chalk.cyan(border));
    console.log(chalk.bold.cyan(`   DEPLOYMENT PLAN REVIEW FOR: ${plan.appName.toUpperCase()}`));
    console.log(chalk.cyan(border));
    console.log(`   Cloud Provider : ${chalk.bold(plan.cloud.toUpperCase())}`);
    console.log(`   Target Region  : ${chalk.bold(plan.region)}`);
    console.log(chalk.cyan(border));
    console.log(chalk.bold('   Estimated Resources to be Provisioned:'));
    
    plan.services.forEach(service => {
        console.log(`    - ${chalk.yellow(service.name)} [${service.type}]: $${service.costEstimate}/mo`);
    });
    
    console.log(chalk.cyan(border));
    console.log(`   Total Estimated Monthly Cost: ${chalk.bold.green(`$${plan.totalEstimatedCost.toFixed(2)}`)}`);
    console.log(chalk.cyan(border));
    console.log(chalk.bold('   Execution Steps:'));
    plan.steps.forEach((step, idx) => {
        console.log(`    ${idx + 1}. ${step}`);
    });
    console.log(chalk.cyan(border));
    console.log();

    return getConfirmation('Do you want to proceed with this deployment plan?');
}

/**
 * Task 166: Implement collectEnvironmentVariables password collection prompt hidden input mask.
 */
export async function collectEnvironmentVariables(keys: string[]): Promise<Record<string, string>> {
    const answers: Record<string, string> = {};
    for (const key of keys) {
        const isSecret = key.toLowerCase().includes('key') || 
                         key.toLowerCase().includes('secret') || 
                         key.toLowerCase().includes('token') || 
                         key.toLowerCase().includes('password') ||
                         key.toLowerCase().includes('cred');
        
        const ans = await inquirer.prompt([
            {
                type: isSecret ? 'password' : 'input',
                name: 'value',
                message: `Enter value for env variable ${chalk.bold.yellow(key)}:`,
                mask: isSecret ? '*' : undefined,
                validate: (val: string) => {
                    if (val.trim().length === 0) {
                        return 'Value cannot be empty.';
                    }
                    return true;
                }
            }
        ]);
        answers[key] = ans.value;
    }
    return answers;
}

/**
 * Task 167: Implement withLoadingMessage inline async tracker.
 */
export async function withLoadingMessage<T>(message: string, action: () => Promise<T>): Promise<T> {
    const spinner = ora({ text: message, color: 'cyan' }).start();
    try {
        const result = await action();
        spinner.succeed();
        return result;
    } catch (error) {
        spinner.fail();
        throw error;
    }
}

/**
 * Task 168: Implement selectFromList prompt choice builder.
 */
export async function selectFromList<T extends string>(message: string, choices: { name: string; value: T }[] | T[]): Promise<T> {
    const ans = await inquirer.prompt([
        {
            type: 'list',
            name: 'selection',
            message,
            choices
        }
    ]);
    return ans.selection;
}

/**
 * Task 169: Implement getTextInput and getConfirmation interactive inquirer builders.
 */
export async function getTextInput(message: string, validate?: (val: string) => boolean | string): Promise<string> {
    const ans = await inquirer.prompt([
        {
            type: 'input',
            name: 'value',
            message,
            validate
        }
    ]);
    return ans.value;
}

export async function getConfirmation(message: string, defaultVal: boolean = true): Promise<boolean> {
    const ans = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmed',
            message,
            default: defaultVal
        }
    ]);
    return ans.confirmed;
}

/**
 * Task 170 (part 1): Implement getCloudProviderConfig prompting for credentials.
 */
export async function getCloudProviderConfig(cloud: CloudProvider): Promise<CloudProviderConfig> {
    const config: CloudProviderConfig = {};
    
    console.log(chalk.cyan(`\nConfiguring access details for ${cloud.toUpperCase()}...`));

    if (cloud === 'aws') {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'profile',
                message: 'Enter AWS Profile name:',
                default: 'default'
            },
            {
                type: 'input',
                name: 'region',
                message: 'Enter AWS target region:',
                default: 'us-east-1'
            }
        ]);
        config.aws = {
            profile: answers.profile,
            region: answers.region
        };
    } else if (cloud === 'gcp') {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'projectId',
                message: 'Enter GCP Project ID:',
                validate: (val: string) => val.trim().length > 0 || 'Project ID cannot be empty.'
            },
            {
                type: 'input',
                name: 'region',
                message: 'Enter GCP target region:',
                default: 'us-central1'
            }
        ]);
        config.gcp = {
            projectId: answers.projectId,
            region: answers.region
        };
    } else if (cloud === 'azure') {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'subscriptionId',
                message: 'Enter Azure Subscription ID:',
                validate: (val: string) => val.trim().length > 0 || 'Subscription ID cannot be empty.'
            },
            {
                type: 'input',
                name: 'resourceGroup',
                message: 'Enter Azure Resource Group:',
                validate: (val: string) => val.trim().length > 0 || 'Resource Group cannot be empty.'
            },
            {
                type: 'input',
                name: 'location',
                message: 'Enter Azure Location:',
                default: 'eastus'
            }
        ]);
        config.azure = {
            subscriptionId: answers.subscriptionId,
            resourceGroup: answers.resourceGroup,
            location: answers.location
        };
    }
    
    return config;
}

/**
 * Task 170 (part 2): Implement displayCloudProviders CLI summary printers.
 */
export function displayCloudProviders(): void {
    console.log();
    const border = '━'.repeat(60);
    console.log(chalk.cyan(border));
    console.log(chalk.bold.cyan('            SUPPORTED CLOUD PROVIDERS & STATUS'));
    console.log(chalk.cyan(border));
    
    for (const [key, details] of Object.entries(CLOUD_PROVIDERS)) {
        console.log(`  ${chalk.bold.green('✔')} ${chalk.bold(details.name)}`);
        console.log(`     CLI Command : ${chalk.yellow(details.cli)}`);
        console.log(`     Documentation: ${chalk.underline.blue(details.docs)}`);
        console.log();
    }
    console.log(chalk.cyan(border));
    console.log();
}
