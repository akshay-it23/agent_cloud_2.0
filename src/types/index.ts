export type CloudProvider = 'aws' | 'gcp' | 'azure';

export interface DeploymentRecord {
    id: string;
    appName: string;
    cloud: CloudProvider;
    status: 'success' | 'failed' | 'pending';
    duration: number; // in milliseconds
    cost: number; // monthly estimated cost
    timestamp: string; // ISO string
    url?: string;
    error?: string;
}

export interface ProjectConfig {
    defaultCloud?: CloudProvider;
    autoApprove?: boolean;
    preferredRegions?: Record<CloudProvider, string>;
    deployments?: DeploymentRecord[];
}

export interface DeploymentRequirements {
    appName: string;
    cloud: CloudProvider;
    region?: string;
    framework?: string;
    database?: string;
    environmentVariables?: Record<string, string>;
    cpu?: string;
    memory?: string;
    instances?: number;
}

export interface CloudProviderConfig {
    aws?: {
        profile?: string;
        region?: string;
    };
    gcp?: {
        projectId?: string;
        region?: string;
    };
    azure?: {
        subscriptionId?: string;
        resourceGroup?: string;
        location?: string;
    };
}

export interface ProjectAnalysis {
    name: string;
    framework: string;
    language: 'javascript' | 'typescript' | 'python' | 'go' | 'static' | 'unknown';
    hasDocker: boolean;
    dependencies: string[];
    database?: string;
    recommendedProvider: CloudProvider;
    suggestedResources: string[];
}

export interface DeploymentPlan {
    cloud: CloudProvider;
    appName: string;
    region: string;
    services: Array<{
        name: string;
        type: string;
        costEstimate: number;
    }>;
    totalEstimatedCost: number;
    steps: string[];
}

export interface ProgressStep {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'success' | 'failed';
    message?: string;
}

