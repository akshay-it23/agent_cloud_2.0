import { getLogger } from '../../utils/logger.js';

/**
 * AWSProvider Stub
 * Implements class shell to satisfy imports during GCP/Azure configurations.
 */
export class AWSProvider {
    private logger = getLogger();

    constructor(profile?: string, region?: string) {
        this.logger.warn('AWS Provider integration is disabled by project settings.');
    }

    async authenticate(): Promise<void> {
        throw new Error('AWS integration is disabled.');
    }

    async deployToECS(appName: string, imageUri: string, options?: any): Promise<any> {
        throw new Error('AWS integration is disabled.');
    }

    async deployLambda(functionName: string, zipPath: string, options?: any): Promise<any> {
        throw new Error('AWS integration is disabled.');
    }

    async deployStaticSite(bucketName: string, buildPath: string): Promise<any> {
        throw new Error('AWS integration is disabled.');
    }

    async cleanup(target: 'ecs' | 'lambda' | 's3', resourceName: string): Promise<void> {
        throw new Error('AWS integration is disabled.');
    }
}
