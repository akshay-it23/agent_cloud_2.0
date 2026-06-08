import { getLogger } from '../../utils/logger.js';

/**
 * GCPProvider Stub
 * Implements class shell to satisfy imports during Azure configurations.
 */
export class GCPProvider {
    private logger = getLogger();

    constructor(projectId?: string, region?: string) {
        this.logger.warn('GCP Provider integration is disabled by project settings.');
    }

    async authenticate(): Promise<void> {
        throw new Error('GCP integration is disabled.');
    }

    async deployToCloudRun(appName: string, imageUri: string, options?: any): Promise<any> {
        throw new Error('GCP integration is disabled.');
    }

    async deployCloudFunction(functionName: string, sourcePath: string, options?: any): Promise<any> {
        throw new Error('GCP integration is disabled.');
    }

    async deployStaticSite(bucketName: string, buildPath: string): Promise<any> {
        throw new Error('GCP integration is disabled.');
    }

    async deployToAppEngine(appName: string, buildPath: string): Promise<any> {
        throw new Error('GCP integration is disabled.');
    }

    async deployToFirebase(projectName: string, buildPath: string): Promise<any> {
        throw new Error('GCP integration is disabled.');
    }

    async cleanup(target: string, resourceName: string): Promise<void> {
        throw new Error('GCP integration is disabled.');
    }
}
