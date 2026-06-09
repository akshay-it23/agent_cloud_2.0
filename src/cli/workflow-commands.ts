import { getMastra } from '../mastra/index.js';
import { displayHeader, displayDivider, displaySuccess, displayInfo, displayWarning, displayError } from './banner.js';
import { confirmDeploymentPlan } from './prompts.js';
import { getLogger } from '../utils/logger.js';
import { getConfigManager } from '../utils/config.js';
import chalk from 'chalk';

// Task 398: Create src/cli/workflow-commands.ts file
// Task 400: Implement interactive workflow deployment router triggers with approval gate inputs
export async function runWorkflowDeployment(
    targetPath: string, 
    options: { cloud?: string; autoApprove?: boolean; dryRun?: boolean }
): Promise<void> {
    const logger = getLogger();
    const configManager = getConfigManager();
    const mastra = getMastra();
    const workflow = mastra.getWorkflow('deployment-workflow');
    
    const cloud = options.cloud || configManager.getDefaultCloud() || 'azure';
    const autoApprove = !!options.autoApprove;
    const dryRun = !!options.dryRun;

    logger.info(`Starting deployment workflow orchestrator at: ${targetPath}`);
    
    // Execute the workflow
    const result = await workflow.execute({
        triggerData: {
            path: targetPath,
            cloud,
            autoApprove,
            dryRun
        }
    });

    if (result.status === 'suspended' || result.status === 'SUSPENDED') {
        // Retrieve the plan from the step result
        const stepResult = result.results['deployment-step'];
        const plan = stepResult?.info?.plan || stepResult?.payload?.plan || stepResult?.plan;
        
        if (!plan) {
            displayError('Failed to retrieve deployment plan from suspended workflow.');
            return;
        }

        // Prompt user for confirmation
        const approved = await confirmDeploymentPlan(plan);

        // Resume the workflow run
        const runInstance = await workflow.createRun({ runId: result.runId });
        const resumeResult = await runInstance.resume({
            step: 'deployment-step',
            resumeData: { approved }
        });

        // Handle the final status
        if (resumeResult.status === 'success' || resumeResult.status === 'SUCCESS') {
            const finalPayload = resumeResult.results['deployment-step']?.payload || resumeResult.results['deployment-step'];
            if (finalPayload?.status === 'success') {
                displaySuccess('Deployment completed successfully!');
                console.log(chalk.bold.green(`   Live Endpoint: ${finalPayload.url}`));
                console.log(chalk.gray(`   Estimated Cost: $${finalPayload.cost.toFixed(2)}/mo`));
                console.log(chalk.gray(`   Execution Time: ${(finalPayload.duration / 1000).toFixed(1)}s`));
            } else {
                displayError(`Deployment failed: ${finalPayload?.error || 'Unknown error'}`);
            }
        } else {
            const stepErr = resumeResult.results['deployment-step'];
            const errorMsg = stepErr?.error || stepErr?.payload?.error || 'Execution failed.';
            displayError(`Workflow execution failed: ${errorMsg}`);
        }
    } else if (result.status === 'success' || result.status === 'SUCCESS') {
        const finalPayload = result.results['deployment-step']?.payload || result.results['deployment-step'];
        if (finalPayload?.status === 'success') {
            displaySuccess('Deployment completed successfully!');
            console.log(chalk.bold.green(`   Live Endpoint: ${finalPayload.url}`));
            console.log(chalk.gray(`   Estimated Cost: $${finalPayload.cost.toFixed(2)}/mo`));
            console.log(chalk.gray(`   Execution Time: ${(finalPayload.duration / 1000).toFixed(1)}s`));
        } else if (finalPayload?.status === 'rejected') {
            displayWarning('Deployment plan rejected. Halting execution.');
        } else {
            displayError(`Deployment failed: ${finalPayload?.error || 'Unknown error'}`);
        }
    } else {
        const stepErr = result.results['deployment-step'];
        const errorMsg = stepErr?.error || stepErr?.payload?.error || 'Execution failed.';
        displayError(`Workflow execution failed: ${errorMsg}`);
    }
}

// Task 399: Implement interactive status validator commands
export async function runWorkflowStatus(): Promise<void> {
    displayHeader('DEPLOYMENT STATUS');

    const configManager = getConfigManager();
    const lastDeployment = configManager.getLastDeployment();

    if (!lastDeployment) {
        console.log(chalk.yellow('\nNo active deployments or records found.'));
        displayInfo('Deploy a service using the "cloud deploy" command.');
        return;
    }

    console.log();
    displayDivider('━', 60);
    console.log(chalk.bold.cyan('             LATEST DEPLOYMENT STATUS'));
    displayDivider('━', 60);
    console.log(`   Application Name  : ${chalk.bold(lastDeployment.appName)}`);
    console.log(`   Cloud Provider    : ${chalk.bold(lastDeployment.cloud.toUpperCase())}`);
    console.log(`   Deployment Status : ${lastDeployment.status === 'success' ? chalk.bold.green('ONLINE (SUCCESS)') : chalk.bold.red('OFFLINE (FAILED)')}`);
    console.log(`   Release Date/Time : ${new Date(lastDeployment.timestamp).toLocaleString()}`);
    console.log(`   Estimated Cost    : ${chalk.bold.green(`$${lastDeployment.cost.toFixed(2)}/mo`)}`);
    
    if (lastDeployment.url) {
        console.log(`   Live Endpoint URL : ${chalk.underline.blue(lastDeployment.url)}`);
    }
    
    if (lastDeployment.error) {
        console.log(`   Failure Reason    : ${chalk.red(lastDeployment.error)}`);
    }
    
    displayDivider('━', 60);
    console.log();
}
