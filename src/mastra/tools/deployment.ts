// Task 352: Create src/mastra/tools/deployment.ts file
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Task 353: Define service mappings dictionaries for AWS, GCP, and Azure
const SERVICE_MAPPINGS: Record<string, Record<string, string[]>> = {
    aws: {
        static: ['S3 Bucket', 'CloudFront Distribution'],
        server: ['ECS Fargate Service', 'Application Load Balancer', 'VPC Security Group'],
        serverless: ['Lambda Function', 'API Gateway']
    },
    gcp: {
        static: ['Cloud Storage Bucket', 'Load Balancer'],
        server: ['Cloud Run Service', 'Artifact Registry'],
        serverless: ['Cloud Functions', 'API Gateway']
    },
    azure: {
        static: ['Blob Storage Container', 'CDN Profile'],
        server: ['Container App', 'Container Registry'],
        serverless: ['Function App', 'Storage Account']
    }
};

const SERVICE_COSTS: Record<string, number> = {
    // AWS costs
    'S3 Bucket': 5,
    'CloudFront Distribution': 15,
    'ECS Fargate Service': 30,
    'Application Load Balancer': 20,
    'VPC Security Group': 0,
    'Lambda Function': 10,
    'API Gateway': 5,
    // GCP costs
    'Cloud Storage Bucket': 5,
    'Load Balancer': 15,
    'Cloud Run Service': 25,
    'Artifact Registry': 5,
    'Cloud Functions': 10,
    // Azure costs
    'Blob Storage Container': 5,
    'CDN Profile': 15,
    'Container App': 25,
    'Container Registry': 5,
    'Function App': 10,
    'Storage Account': 5
};

// Task 354: Define serviceMapperTool mapping inputs to mapped cloud services list
export const serviceMapperTool = createTool({
    id: 'service-mapper-tool',
    description: 'Maps project characteristics (language, framework) and cloud choice to target cloud services',
    inputSchema: z.object({
        cloud: z.enum(['aws', 'gcp', 'azure']).describe('Target cloud provider'),
        framework: z.string().describe('Application framework (e.g. Next.js, React, Express)'),
        language: z.string().describe('Programming language (e.g. javascript, python, go, static)')
    }),
    outputSchema: z.object({
        services: z.array(z.string())
    }),
    execute: async ({ context }) => {
        const cloud = context.cloud;
        const framework = context.framework.toLowerCase();
        const language = context.language.toLowerCase();

        // Determine if it is a static web hosting project
        const isStatic = language === 'static' || 
                         framework.includes('react') || 
                         framework.includes('vue') || 
                         framework.includes('static');
        
        // Determine if it is serverless
        const isServerless = framework.includes('lambda') || 
                             framework.includes('function') || 
                             framework.includes('serverless') ||
                             (language === 'python' && framework.includes('script'));

        const category = isStatic ? 'static' : (isServerless ? 'serverless' : 'server');
        const services = SERVICE_MAPPINGS[cloud]?.[category] || SERVICE_MAPPINGS[cloud]?.server || [];

        return { services };
    }
});

// Task 355: Define costEstimatorTool calculating monthly compute storage costs
export const costEstimatorTool = createTool({
    id: 'cost-estimator-tool',
    description: 'Calculates the estimated monthly resource cost based on provisioned services and scaling choice',
    inputSchema: z.object({
        services: z.array(z.string()).describe('List of services to estimate costs for'),
        scale: z.enum(['small', 'medium', 'large']).optional().default('small').describe('Scale level of resources')
    }),
    outputSchema: z.object({
        estimatedCost: z.number(),
        currency: z.string()
    }),
    // Task 356: Implement small/medium/large scaling multiplier calculations inside costEstimatorTool
    execute: async ({ context }) => {
        let baseCost = 0;

        for (const service of context.services) {
            const serviceCost = SERVICE_COSTS[service];
            baseCost += (serviceCost !== undefined ? serviceCost : 10);
        }

        const scale = context.scale || 'small';
        const multiplier = scale === 'large' ? 5.0 : (scale === 'medium' ? 2.5 : 1.0);
        const estimatedCost = baseCost * multiplier;

        return {
            estimatedCost,
            currency: 'USD'
        };
    }
});

// Task 357: Define commandGeneratorTool schema configurations
export const commandGeneratorTool = createTool({
    id: 'command-generator-tool',
    description: 'Generates deployment CLI command templates for the target cloud and services list',
    inputSchema: z.object({
        cloud: z.enum(['aws', 'gcp', 'azure']).describe('Selected cloud provider'),
        appName: z.string().optional().default('my-app').describe('Application name'),
        services: z.array(z.string()).describe('Target services to deploy')
    }),
    outputSchema: z.object({
        commands: z.array(z.string())
    }),
    execute: async ({ context }) => {
        const appName = context.appName || 'my-app';
        const commands: string[] = [];

        // Task 358: Implement command templates generation script mappings inside commandGeneratorTool for AWS
        if (context.cloud === 'aws') {
            for (const service of context.services) {
                if (service === 'S3 Bucket') {
                    commands.push(`aws s3 mb s3://${appName}-bucket --region us-east-1`);
                } else if (service === 'CloudFront Distribution') {
                    commands.push(`aws cloudfront create-distribution --origin-domain-name ${appName}-bucket.s3.amazonaws.com`);
                } else if (service === 'ECS Fargate Service') {
                    commands.push(`aws ecs create-cluster --cluster-name ${appName}-cluster`);
                    commands.push(`aws ecs register-task-definition --cli-input-json file://task-definition.json`);
                } else if (service === 'Application Load Balancer') {
                    commands.push(`aws elbv2 create-load-balancer --name ${appName}-alb --subnets subnet-12345678 subnet-87654321`);
                } else if (service === 'Lambda Function') {
                    commands.push(`aws lambda create-function --function-name ${appName}-fn --runtime nodejs18.x --role arn:aws:iam::123456789012:role/lambda-role --handler index.handler --zip-file fileb://function.zip`);
                } else if (service === 'API Gateway') {
                    commands.push(`aws apigateway create-rest-api --name ${appName}-api`);
                }
            }
        } 
        // Task 359: Implement command templates generation script mappings inside commandGeneratorTool for GCP
        else if (context.cloud === 'gcp') {
            for (const service of context.services) {
                if (service === 'Cloud Storage Bucket') {
                    commands.push(`gcloud storage buckets create gs://${appName}-bucket --location=us-central1`);
                } else if (service === 'Cloud Run Service') {
                    commands.push(`gcloud run deploy ${appName}-service --source . --region=us-central1 --allow-unauthenticated`);
                } else if (service === 'Artifact Registry') {
                    commands.push(`gcloud artifacts repositories create ${appName}-repo --repository-format=docker --location=us-central1`);
                } else if (service === 'Cloud Functions') {
                    commands.push(`gcloud functions deploy ${appName}-fn --runtime=nodejs18 --trigger-http --allow-unauthenticated`);
                } else if (service === 'Load Balancer') {
                    commands.push(`gcloud compute forwarding-rules create ${appName}-lb-rule --global --target-http-proxy=${appName}-proxy --ports=80`);
                }
            }
        } 
        // Task 360: Implement command templates generation script mappings inside commandGeneratorTool for Azure
        else if (context.cloud === 'azure') {
            for (const service of context.services) {
                if (service === 'Blob Storage Container') {
                    commands.push(`az storage container create --name ${appName}-container --account-name ${appName}store`);
                } else if (service === 'Container App') {
                    commands.push(`az containerapp up --name ${appName}-app --source . --resource-group ${appName}-rg`);
                } else if (service === 'Container Registry') {
                    commands.push(`az acr create --resource-group ${appName}-rg --name ${appName}registry --sku Basic`);
                } else if (service === 'Function App') {
                    commands.push(`az functionapp create --name ${appName}-fn --storage-account ${appName}store --resource-group ${appName}-rg --consumption-plan-location eastus`);
                } else if (service === 'Storage Account') {
                    commands.push(`az storage account create --name ${appName}store --resource-group ${appName}-rg --location eastus --sku Standard_LRS`);
                }
            }
        }

        return { commands };
    }
});
