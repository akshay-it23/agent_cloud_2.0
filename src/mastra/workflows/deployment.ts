import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { getLogger } from '../../utils/logger.js';
import { getConfigManager } from '../../utils/config.js';
import { getErrorHandler } from '../../utils/error-handler.js';
import { runLocalAnalysis } from '../../cli/commands.js';
import { 
    cliCheckerTool, 
    authCheckerTool, 
    permissionsCheckerTool 
} from '../tools/validator.js';
import { 
    serviceMapperTool, 
    costEstimatorTool, 
    commandGeneratorTool 
} from '../tools/deployment.js';

// Task 383: Declare deploymentStep defining input, output, and resume validation schemas
export const deploymentStep = createStep({
    id: 'deployment-step',
    inputSchema: z.object({
        path: z.string(),
        cloud: z.enum(['aws', 'gcp', 'azure']).optional(),
        autoApprove: z.boolean().optional(),
        dryRun: z.boolean().optional()
    }),
    suspendSchema: z.object({
        plan: z.any()
    }),
    resumeSchema: z.object({
        approved: z.boolean()
    }),
    execute: async ({ inputData, resumeData, suspend }) => {
        // Task 384: Initialize production managers (logger, config, error) in deploymentStep
        const logger = getLogger();
        const configManager = getConfigManager();
        const errorHandler = getErrorHandler();
        const startTime = Date.now();
        
        let appName = 'unknown-app';
        let cloud = inputData.cloud || configManager.getDefaultCloud() || 'azure';
        
        try {
            // Task 385: Setup Phase 1 execution checking environment validation states
            logger.info(`Phase 1: Validating environment settings for ${cloud.toUpperCase()}...`);
            const cliCheck = await cliCheckerTool.execute({ context: { clis: [cloud] } });
            if (!cliCheck.available[cloud]) {
                throw new Error(`CLI tool for ${cloud} is not installed or available in PATH.`);
            }

            const authCheck = await authCheckerTool.execute({ context: { cloud } });
            if (!authCheck.authenticated) {
                throw new Error(`Authentication validation failed for ${cloud}. Please authenticate using CLI.`);
            }

            const permCheck = await permissionsCheckerTool.execute({ context: { cloud } });
            if (!permCheck.hasPermission) {
                throw new Error(`Insufficient permissions on ${cloud} to list resources or deploy.`);
            }
            
            // Task 386: Setup Phase 2 execution checking project frameworks details
            logger.info('Phase 2: Analyzing project structure...');
            const analysis = await runLocalAnalysis(inputData.path);
            appName = analysis.name;
            
            // Task 387: Setup Phase 3 deployment planning steps
            logger.info('Phase 3: Designing deployment infrastructure plan...');
            const mapperResult = await serviceMapperTool.execute({
                context: {
                    cloud,
                    framework: analysis.framework,
                    language: analysis.language
                }
            });

            const costResult = await costEstimatorTool.execute({
                context: {
                    services: mapperResult.services,
                    scale: 'small'
                }
            });

            const cmdResult = await commandGeneratorTool.execute({
                context: {
                    cloud,
                    appName: analysis.name,
                    services: mapperResult.services
                }
            });

            const plan = {
                cloud,
                appName: analysis.name,
                region: configManager.getPreferredRegion(cloud) || (cloud === 'azure' ? 'eastus' : cloud === 'gcp' ? 'us-central1' : 'us-east-1'),
                services: mapperResult.services.map(s => ({
                    name: s,
                    type: s,
                    costEstimate: costResult.estimatedCost / mapperResult.services.length
                })),
                totalEstimatedCost: costResult.estimatedCost,
                steps: [
                    `Validate target credentials on ${cloud.toUpperCase()}`,
                    ...mapperResult.services.map(s => `Deploy resource: ${s}`),
                    `Expose public service endpoint`
                ],
                commands: cmdResult.commands
            };
            
            // Task 388: Setup Phase 4 user-facing approval gate trigger calls
            // Task 389: Configure suspend mechanisms returning payload items
            let approved = true;
            if (!inputData.autoApprove && !resumeData) {
                logger.info('Phase 4: Suspending workflow to wait for deployment plan approval...');
                return await suspend({ plan });
            }

            if (resumeData) {
                approved = resumeData.approved;
            }

            // Task 390: Setup user rejection log recording rules
            if (!approved) {
                logger.warn('Deployment plan was rejected by the user. Halting deployment.');
                configManager.addDeployment({
                    appName: analysis.name,
                    cloud,
                    status: 'failed',
                    duration: Date.now() - startTime,
                    cost: 0,
                    error: 'Deployment plan rejected by user.'
                });
                return {
                    status: 'rejected',
                    appName: analysis.name,
                    cloud,
                    error: 'Deployment plan rejected by user.'
                };
            }
            
            // Task 391: Configure Phase 5 cloud provider selection routers
            let resultUrl = '';
            if (inputData.dryRun) {
                logger.info(`[Dry Run] Simulating deployment steps to ${cloud.toUpperCase()}...`);
                resultUrl = cloud === 'azure' ? `https://${analysis.name}.azurewebsites.net` : `https://${analysis.name}.example.com`;
            } else {
                // Task 392: Setup AWS deployments execution paths inside Phase 5
                if (cloud === 'aws') {
                    throw new Error('AWS Provider integration is disabled by project settings.');
                } 
                // Task 393: Setup GCP deployments execution paths inside Phase 5
                else if (cloud === 'gcp') {
                    throw new Error('GCP Provider integration is disabled by project settings.');
                } 
                // Task 394: Setup Azure deployments execution paths inside Phase 5
                else if (cloud === 'azure') {
                    logger.info('Phase 5: Deploying app resources to Azure...');
                    const { AzureProvider } = await import('../../providers/azure/index.js');
                    const azure = new AzureProvider(
                        process.env.AZURE_SUBSCRIPTION_ID,
                        'agent-cloud-rg',
                        configManager.getPreferredRegion('azure') || 'eastus'
                    );
                    
                    await azure.authenticate();

                    const isStatic = analysis.language === 'static' || 
                                     analysis.framework.includes('React') || 
                                     analysis.framework.includes('Vue') || 
                                     analysis.framework.includes('Static');
                    
                    if (isStatic) {
                        const deployResult = await azure.deployBlobStorage(analysis.name, inputData.path);
                        resultUrl = deployResult.url;
                    } else {
                        const deployResult = await azure.deployAppService(analysis.name, inputData.path);
                        resultUrl = deployResult.url;
                    }
                } else {
                    throw new Error(`Unsupported cloud provider: ${cloud}`);
                }
            }
            
            // Task 395: Add post-deployment validation logging, config recordings, and duration measurements
            const duration = Date.now() - startTime;
            logger.success(`Deployment finished successfully in ${(duration / 1000).toFixed(1)}s!`);
            logger.info(`URL: ${resultUrl}`);

            // Save success record
            configManager.addDeployment({
                appName: analysis.name,
                cloud,
                status: 'success',
                duration,
                cost: plan.totalEstimatedCost,
                url: resultUrl
            });

            return {
                status: 'success',
                appName: analysis.name,
                cloud,
                url: resultUrl,
                duration,
                cost: plan.totalEstimatedCost
            };
            
        } catch (error: any) {
            // Task 396: Catch and handle outer errors inside workflow deployment
            const duration = Date.now() - startTime;
            const errorMsg = error.message || 'Unknown deployment error';
            logger.error(`Deployment failed: ${errorMsg}`);
            
            configManager.addDeployment({
                appName: appName,
                cloud,
                status: 'failed',
                duration,
                cost: 0,
                error: errorMsg
            });

            return {
                status: 'failed',
                appName: appName,
                cloud,
                error: errorMsg,
                duration,
                cost: 0
            };
        }
    }
});

// Task 397: Define the main deploymentWorkflow configuration settings
export const deploymentWorkflow = createWorkflow({
    name: 'deployment-workflow',
})
.then(deploymentStep)
.commit();
