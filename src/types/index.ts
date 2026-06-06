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
