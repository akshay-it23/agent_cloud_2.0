import chalk from 'chalk';
import { getLogger, Logger } from './logger.js';
import { CloudProvider } from '../types/index.js';

/**
 * DeploymentError
 * Custom domain error representing failures during resource provisioning or deployment steps.
 */
export class DeploymentError extends Error {
    code: string;
    cloud?: CloudProvider;
    recoverable: boolean;
    suggestions: string[];

    constructor(
        message: string,
        code: string,
        cloud?: CloudProvider,
        recoverable: boolean = false,
        suggestions: string[] = []
    ) {
        super(message);
        this.name = 'DeploymentError';
        this.code = code;
        this.cloud = cloud;
        this.recoverable = recoverable;
        this.suggestions = suggestions;
    }
}

/**
 * AuthenticationError
 * Custom domain error representing login, IAM credential, or access key failures.
 */
export class AuthenticationError extends Error {
    cloud?: CloudProvider;
    suggestions: string[];

    constructor(
        message: string,
        cloud?: CloudProvider,
        suggestions: string[] = []
    ) {
        super(message);
        this.name = 'AuthenticationError';
        this.cloud = cloud;
        this.suggestions = suggestions;
    }
}

/**
 * ValidationError
 * Custom domain error representing schema discrepancies, bad configurations, or invalid parameters.
 */
export class ValidationError extends Error {
    fields: string[];
    suggestions: string[];

    constructor(
        message: string,
        fields: string[] = [],
        suggestions: string[] = []
    ) {
        super(message);
        this.name = 'ValidationError';
        this.fields = fields;
        this.suggestions = suggestions;
    }
}

/**
 * WorkflowError
 * Custom domain error representing failures during orchestration steps.
 */
export class WorkflowError extends Error {
    step: string;
    recoverable: boolean;
    suggestions: string[];

    constructor(
        message: string,
        step: string,
        recoverable: boolean = false,
        suggestions: string[] = []
    ) {
        super(message);
        this.name = 'WorkflowError';
        this.step = step;
        this.recoverable = recoverable;
        this.suggestions = suggestions;
    }
}

/**
 * ErrorHandler
 * Orchestrator class responsible for intercepting, formatting, and routing typed custom domain errors.
 */
export class ErrorHandler {
    private logger: Logger;

    constructor() {
        this.logger = getLogger();
    }

    /**
     * Handle deployment specific errors with customized formatting.
     */
    handleDeploymentError(error: DeploymentError): void {
        const providerPrefix = error.cloud ? `[${error.cloud.toUpperCase()}] ` : '';
        const statusText = error.recoverable ? chalk.green(' (Recoverable)') : chalk.red(' (Fatal)');
        
        this.logger.error(`${providerPrefix}Deployment Failure: ${error.message}${statusText} [Code: ${error.code}]`, error);
        
        if (error.suggestions && error.suggestions.length > 0) {
            console.log(chalk.yellow('\nSuggestions to resolve this issue:'));
            error.suggestions.forEach(suggestion => {
                console.log(chalk.yellow(` - ${suggestion}`));
            });
            console.log(); // empty line
        }
    }

    /**
     * Handle login and IAM credential validation failures.
     */
    handleAuthenticationError(error: AuthenticationError): void {
        const providerPrefix = error.cloud ? `[${error.cloud.toUpperCase()}] ` : '';
        
        this.logger.error(`${providerPrefix}Authentication Failed: ${error.message}`, error);
        
        if (error.suggestions && error.suggestions.length > 0) {
            console.log(chalk.yellow('\nSuggestions to authenticate:'));
            error.suggestions.forEach(suggestion => {
                console.log(chalk.yellow(` - ${suggestion}`));
            });
            console.log(); // empty line
        }
    }

    /**
     * Handle inputs validation schema and parameters checks.
     */
    handleValidationError(error: ValidationError): void {
        this.logger.error(`Validation Failed: ${error.message}`, error);
        
        if (error.fields && error.fields.length > 0) {
            console.log(chalk.red('\nProblematic fields:'));
            error.fields.forEach(field => {
                console.log(chalk.red(` - ${field}`));
            });
        }
        
        if (error.suggestions && error.suggestions.length > 0) {
            console.log(chalk.yellow('\nSuggestions:'));
            error.suggestions.forEach(suggestion => {
                console.log(chalk.yellow(` - ${suggestion}`));
            });
            console.log(); // empty line
        }
    }

    /**
     * Handle step validation, orchestration, and workflow engine status signals.
     */
    handleWorkflowError(error: WorkflowError): void {
        const statusText = error.recoverable ? chalk.green(' (Recoverable)') : chalk.red(' (Fatal)');
        
        this.logger.error(`Workflow step [${error.step}] failed: ${error.message}${statusText}`, error);
        
        if (error.suggestions && error.suggestions.length > 0) {
            console.log(chalk.yellow('\nSuggestions to resume or retry:'));
            error.suggestions.forEach(suggestion => {
                console.log(chalk.yellow(` - ${suggestion}`));
            });
            console.log(); // empty line
        }
    }

    /**
     * Handle fallback errors displaying details if debugging configurations are set.
     */
    handleGenericError(error: Error): void {
        this.logger.error(`An unexpected error occurred: ${error.message}`, error);
        
        const isDebug = process.env.LOG_LEVEL === 'debug';
        if (isDebug && error.stack) {
            console.log(chalk.gray(`\nStack trace:\n${error.stack}\n`));
        }
    }

    /**
     * General routing gate forwarding errors to the target typed printer handlers.
     */
    handle(error: unknown): void {
        if (error instanceof DeploymentError) {
            this.handleDeploymentError(error);
        } else if (error instanceof AuthenticationError) {
            this.handleAuthenticationError(error);
        } else if (error instanceof ValidationError) {
            this.handleValidationError(error);
        } else if (error instanceof WorkflowError) {
            this.handleWorkflowError(error);
        } else if (error instanceof Error) {
            this.handleGenericError(error);
        } else {
            this.handleGenericError(new Error(String(error)));
        }
    }

    /**
     * Wrapper block to execute operations securely and capture failures automatically.
     */
    async wrap<T>(fn: () => Promise<T>): Promise<T | null> {
        try {
            return await fn();
        } catch (error) {
            this.handle(error);
            return null;
        }
    }
}

// Global handler instance cache
let globalErrorHandler: ErrorHandler | null = null;

/**
 * Return global config instance.
 */
export function getErrorHandler(): ErrorHandler {
    if (!globalErrorHandler) {
        globalErrorHandler = new ErrorHandler();
    }
    return globalErrorHandler;
}

/**
 * ErrorFactory
 * Factory patterns config object to simplify building typed system exceptions.
 */
export const ErrorFactory = {
    /**
     * Construct a standard AWS deployment exception helper.
     */
    awsDeployment(message: string, code: string = 'AWS_DEPLOY_FAILED', recoverable: boolean = false): DeploymentError {
        return new DeploymentError(
            message,
            code,
            'aws',
            recoverable,
            [
                'Check your AWS CLI credentials using "aws sts get-caller-identity"',
                'Verify you have sufficient permissions for ECS, Lambda, IAM, and CloudWatch',
                'Ensure the target region has default VPC/subnets setup'
            ]
        );
    },

    /**
     * Construct a standard GCP deployment exception helper.
     */
    gcpDeployment(message: string, code: string = 'GCP_DEPLOY_FAILED', recoverable: boolean = false): DeploymentError {
        return new DeploymentError(
            message,
            code,
            'gcp',
            recoverable,
            [
                'Verify gcloud authentication status using "gcloud auth list"',
                'Ensure project billing is enabled and Cloud Build / Cloud Run APIs are enabled',
                'Verify project ID matches target project configuration'
            ]
        );
    },

    /**
     * Construct a standard Azure deployment exception helper.
     */
    azureDeployment(message: string, code: string = 'AZURE_DEPLOY_FAILED', recoverable: boolean = false): DeploymentError {
        return new DeploymentError(
            message,
            code,
            'azure',
            recoverable,
            [
                'Ensure active credentials via "az account show"',
                'Verify resource group and provider namespace permissions are mapped properly',
                'Check Azure CLI status parameters configurations'
            ]
        );
    },

    /**
     * Construct an AWS authentication failed helper.
     */
    awsAuthFailed(message: string = 'Failed to authenticate with AWS credentials'): AuthenticationError {
        return new AuthenticationError(
            message,
            'aws',
            [
                'Run "aws configure" to reset access credentials and regional options',
                'Check AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_SESSION_TOKEN environment settings',
                'Confirm IAM account status configurations'
            ]
        );
    },

    /**
     * Construct a GCP authentication failed helper.
     */
    gcpAuthFailed(message: string = 'Failed to authenticate with GCP credentials'): AuthenticationError {
        return new AuthenticationError(
            message,
            'gcp',
            [
                'Run "gcloud auth login" to authenticate client profile',
                'Configure application defaults using "gcloud auth application-default login"',
                'Ensure GOOGLE_APPLICATION_CREDENTIALS points to a valid service account JSON file'
            ]
        );
    },

    /**
     * Construct an Azure authentication failed helper.
     */
    azureAuthFailed(message: string = 'Failed to authenticate with Azure credentials'): AuthenticationError {
        return new AuthenticationError(
            message,
            'azure',
            [
                'Run "az login" to launch browser authentication workflow',
                'Verify service principal configuration variables: AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID'
            ]
        );
    },

    /**
     * Construct a workflow step failure helper.
     */
    workflowStepFailed(step: string, message: string, recoverable: boolean = true): WorkflowError {
        return new WorkflowError(
            message,
            step,
            recoverable,
            [
                `Analyze the logs inside ".agent-cloud/logs/" directory`,
                `Resolve inputs configuration schema issues and retry workflow execution`,
                `Restart the application or command if the error continues`
            ]
        );
    },

    /**
     * Construct a validation exception helper.
     */
    invalidCloud(cloud: string): ValidationError {
        return new ValidationError(
            `Unsupported cloud provider: "${cloud}"`,
            ['cloud'],
            [
                'Verify selected cloud parameter values match supported listings: "aws", "gcp", "azure"'
            ]
        );
    },

    /**
     * Construct a missing path validation exception helper.
     */
    missingProjectPath(): ValidationError {
        return new ValidationError(
            'Missing project root directory path parameter',
            ['path'],
            [
                'Specify the project root directory path in options or CLI wizard inputs',
                'Verify folder existence and path correctness'
            ]
        );
    }
};
