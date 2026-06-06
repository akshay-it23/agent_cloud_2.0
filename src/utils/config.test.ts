import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getConfigManager, resetConfigManager } from './config.js';
import { DeploymentRecord } from '../types/index.js';

describe('ConfigManager', () => {
    const testDir = path.join(process.cwd(), '.agent-cloud-test-config');

    beforeEach(() => {
        resetConfigManager();
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
    });

    afterEach(() => {
        resetConfigManager();
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
    });

    it('should initialize with default config when no file exists', () => {
        const manager = getConfigManager(testDir);
        const config = manager.getConfig();

        expect(config.autoApprove).toBe(false);
        expect(config.preferredRegions?.aws).toBe('us-east-1');
        expect(config.preferredRegions?.gcp).toBe('us-central1');
        expect(config.preferredRegions?.azure).toBe('eastus');
        expect(config.deployments).toEqual([]);
    });

    it('should load and save configuration', () => {
        const manager = getConfigManager(testDir);
        manager.setDefaultCloud('aws');
        manager.setAutoApprove(true);
        manager.setPreferredRegion('aws', 'us-west-2');

        // Reset singleton and reload
        resetConfigManager();
        const reloadedManager = getConfigManager(testDir);
        const config = reloadedManager.getConfig();

        expect(config.defaultCloud).toBe('aws');
        expect(config.autoApprove).toBe(true);
        expect(config.preferredRegions?.aws).toBe('us-west-2');
    });

    it('should manage deployment history and limit to 50 records', () => {
        const manager = getConfigManager(testDir);

        // Add 55 records
        for (let i = 1; i <= 55; i++) {
            manager.addDeployment({
                appName: `app-${i}`,
                cloud: 'aws',
                status: i % 2 === 0 ? 'success' : 'failed',
                duration: i * 100,
                cost: i * 10
            });
        }

        const deployments = manager.getDeployments();
        expect(deployments.length).toBe(50);
        // The most recent deployment (55) should be first
        expect(deployments[0].appName).toBe('app-55');
        // The oldest deployment kept (6) should be last
        expect(deployments[49].appName).toBe('app-6');
    });

    it('should correctly filter deployments and get last deployment', () => {
        const manager = getConfigManager(testDir);

        manager.addDeployment({ appName: 'app-aws', cloud: 'aws', status: 'success', duration: 1000, cost: 50 });
        manager.addDeployment({ appName: 'app-gcp', cloud: 'gcp', status: 'failed', duration: 2000, cost: 70 });
        manager.addDeployment({ appName: 'app-azure', cloud: 'azure', status: 'success', duration: 1500, cost: 60 });

        const last = manager.getLastDeployment();
        expect(last?.appName).toBe('app-azure');

        const awsDeps = manager.getDeploymentsByCloud('aws');
        expect(awsDeps.length).toBe(1);
        expect(awsDeps[0].appName).toBe('app-aws');

        const successful = manager.getSuccessfulDeployments();
        expect(successful.length).toBe(2);

        const failed = manager.getFailedDeployments();
        expect(failed.length).toBe(1);
        expect(failed[0].appName).toBe('app-gcp');
    });

    it('should compute deployment stats correctly', () => {
        const manager = getConfigManager(testDir);

        manager.addDeployment({ appName: 'app-1', cloud: 'aws', status: 'success', duration: 1000, cost: 50 });
        manager.addDeployment({ appName: 'app-2', cloud: 'gcp', status: 'failed', duration: 2000, cost: 70 });
        manager.addDeployment({ appName: 'app-3', cloud: 'azure', status: 'success', duration: 3000, cost: 60 });

        const stats = manager.getStats();
        expect(stats.totalDeployments).toBe(3);
        expect(stats.successfulDeployments).toBe(2);
        expect(stats.failedDeployments).toBe(1);
        expect(stats.totalCost).toBe(180);
        expect(stats.totalDuration).toBe(6000);
        expect(stats.averageDuration).toBe(2000);
    });

    it('should clear deployment history', () => {
        const manager = getConfigManager(testDir);
        manager.addDeployment({ appName: 'app-1', cloud: 'aws', status: 'success', duration: 1000, cost: 50 });
        expect(manager.getDeployments().length).toBe(1);

        manager.clearHistory();
        expect(manager.getDeployments().length).toBe(0);
    });

    it('should export and import configurations', () => {
        const manager = getConfigManager(testDir);
        manager.setDefaultCloud('gcp');
        manager.setAutoApprove(true);
        manager.setPreferredRegion('gcp', 'europe-west1');

        const exported = manager.export();
        
        // Setup another manager with a clean test location
        const secondaryDir = path.join(process.cwd(), '.agent-cloud-test-config-sec');
        if (fs.existsSync(secondaryDir)) {
            fs.rmSync(secondaryDir, { recursive: true, force: true });
        }
        
        try {
            const secondaryManager = getConfigManager(secondaryDir);
            expect(secondaryManager.getDefaultCloud()).toBeUndefined();
            
            const importSuccess = secondaryManager.import(exported);
            expect(importSuccess).toBe(true);
            expect(secondaryManager.getDefaultCloud()).toBe('gcp');
            expect(secondaryManager.getAutoApprove()).toBe(true);
            expect(secondaryManager.getPreferredRegion('gcp')).toBe('europe-west1');
        } finally {
            if (fs.existsSync(secondaryDir)) {
                fs.rmSync(secondaryDir, { recursive: true, force: true });
            }
        }
    });
});
