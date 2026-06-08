import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
    DeploymentError, 
    AuthenticationError, 
    ValidationError, 
    WorkflowError, 
    getErrorHandler, 
    ErrorFactory 
} from './error-handler.js';

describe('Custom Domain Errors', () => {
    it('should correctly instantiate DeploymentError', () => {
        const err = new DeploymentError('AWS deployment failed', 'AWS_ERR', 'aws', true, ['Check logs']);
        expect(err.message).toBe('AWS deployment failed');
        expect(err.code).toBe('AWS_ERR');
        expect(err.cloud).toBe('aws');
        expect(err.recoverable).toBe(true);
        expect(err.suggestions).toEqual(['Check logs']);
        expect(err.name).toBe('DeploymentError');
    });

    it('should correctly instantiate AuthenticationError', () => {
        const err = new AuthenticationError('GCP login expired', 'gcp', ['Run gcloud auth login']);
        expect(err.message).toBe('GCP login expired');
        expect(err.cloud).toBe('gcp');
        expect(err.suggestions).toEqual(['Run gcloud auth login']);
        expect(err.name).toBe('AuthenticationError');
    });

    it('should correctly instantiate ValidationError', () => {
        const err = new ValidationError('Invalid CPU value', ['cpu'], ['Provide valid cpu value']);
        expect(err.message).toBe('Invalid CPU value');
        expect(err.fields).toEqual(['cpu']);
        expect(err.suggestions).toEqual(['Provide valid cpu value']);
        expect(err.name).toBe('ValidationError');
    });

    it('should correctly instantiate WorkflowError', () => {
        const err = new WorkflowError('Step failed', 'build', false, ['Fix build config']);
        expect(err.message).toBe('Step failed');
        expect(err.step).toBe('build');
        expect(err.recoverable).toBe(false);
        expect(err.suggestions).toEqual(['Fix build config']);
        expect(err.name).toBe('WorkflowError');
    });
});

describe('ErrorFactory', () => {
    it('should build proper awsDeployment error', () => {
        const err = ErrorFactory.awsDeployment('Fargate deploy failed', 'ECS_ERR');
        expect(err.message).toBe('Fargate deploy failed');
        expect(err.cloud).toBe('aws');
        expect(err.code).toBe('ECS_ERR');
        expect(err.recoverable).toBe(false);
        expect(err.suggestions).toContain('Verify you have sufficient permissions for ECS, Lambda, IAM, and CloudWatch');
    });

    it('should build proper gcpDeployment error', () => {
        const err = ErrorFactory.gcpDeployment('Cloud run deploy failed');
        expect(err.message).toBe('Cloud run deploy failed');
        expect(err.cloud).toBe('gcp');
        expect(err.code).toBe('GCP_DEPLOY_FAILED');
    });

    it('should build proper azureDeployment error', () => {
        const err = ErrorFactory.azureDeployment('App service failed');
        expect(err.message).toBe('App service failed');
        expect(err.cloud).toBe('azure');
        expect(err.code).toBe('AZURE_DEPLOY_FAILED');
    });

    it('should build proper awsAuthFailed error', () => {
        const err = ErrorFactory.awsAuthFailed();
        expect(err.message).toBe('Failed to authenticate with AWS credentials');
        expect(err.cloud).toBe('aws');
    });

    it('should build proper gcpAuthFailed error', () => {
        const err = ErrorFactory.gcpAuthFailed();
        expect(err.message).toBe('Failed to authenticate with GCP credentials');
        expect(err.cloud).toBe('gcp');
    });

    it('should build proper azureAuthFailed error', () => {
        const err = ErrorFactory.azureAuthFailed();
        expect(err.message).toBe('Failed to authenticate with Azure credentials');
        expect(err.cloud).toBe('azure');
    });

    it('should build proper workflowStepFailed error', () => {
        const err = ErrorFactory.workflowStepFailed('init', 'Pre-checks failed');
        expect(err.message).toBe('Pre-checks failed');
        expect(err.step).toBe('init');
        expect(err.recoverable).toBe(true);
    });

    it('should build proper invalidCloud error', () => {
        const err = ErrorFactory.invalidCloud('digitalocean');
        expect(err.message).toBe('Unsupported cloud provider: "digitalocean"');
        expect(err.fields).toEqual(['cloud']);
    });

    it('should build proper missingProjectPath error', () => {
        const err = ErrorFactory.missingProjectPath();
        expect(err.message).toBe('Missing project root directory path parameter');
        expect(err.fields).toEqual(['path']);
    });
});

describe('ErrorHandler', () => {
    let errorHandler: ReturnType<typeof getErrorHandler>;
    
    beforeEach(() => {
        errorHandler = getErrorHandler();
    });

    it('should return singleton instance', () => {
        const another = getErrorHandler();
        expect(errorHandler).toBe(another);
    });

    it('should wrap async operations and catch errors', async () => {
        const testFunc = async () => {
            throw new Error('Async test error');
        };

        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        const result = await errorHandler.wrap(testFunc);
        expect(result).toBeNull();
        consoleSpy.mockRestore();
    });
});
