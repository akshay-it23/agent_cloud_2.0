import fs from 'fs';
import path from 'path';
import { CloudProvider, DeploymentRecord, ProjectConfig } from '../types/index.js';

/**
 * ConfigManager
 * Production-grade utility to manage CLI settings, region preferences, and deployment history.
 */
export class ConfigManager {
    private configDir: string;
    private configFile: string;
    private config: ProjectConfig;

    constructor(customConfigDir?: string) {
        this.configDir = customConfigDir || path.join(process.cwd(), '.agent-cloud');
        this.configFile = path.join(this.configDir, 'config.json');

        // Default initial settings
        this.config = {
            preferredRegions: {
                aws: 'us-east-1',
                gcp: 'us-central1',
                azure: 'eastus'
            },
            autoApprove: false,
            deployments: []
        };

        this.loadConfig();
    }

    /**
     * Load config file from disk. Falls back to defaults if not present or corrupt.
     */
    private loadConfig(): void {
        try {
            if (fs.existsSync(this.configFile)) {
                const data = fs.readFileSync(this.configFile, 'utf-8');
                const parsed = JSON.parse(data);
                
                this.config = {
                    ...this.config,
                    ...parsed,
                    preferredRegions: {
                        ...this.config.preferredRegions,
                        ...(parsed.preferredRegions || {})
                    },
                    deployments: Array.isArray(parsed.deployments) ? parsed.deployments : []
                };
            }
        } catch (error) {
            // Silence error and use current config
        }
    }

    /**
     * Save the config file to disk. Creates directory if missing.
     */
    private saveConfig(): void {
        try {
            if (!fs.existsSync(this.configDir)) {
                fs.mkdirSync(this.configDir, { recursive: true });
            }
            fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2), 'utf-8');
        } catch (error) {
            console.error('Failed to save configuration:', error);
        }
    }

    /**
     * Retrieve the current configuration object.
     */
    getConfig(): ProjectConfig {
        return this.config;
    }

    /**
     * Update the configuration object with partial modifications and persist.
     */
    updateConfig(updatedConfig: Partial<ProjectConfig>): void {
        this.config = {
            ...this.config,
            ...updatedConfig,
            preferredRegions: {
                ...this.config.preferredRegions,
                ...(updatedConfig.preferredRegions || {})
            }
        };
        this.saveConfig();
    }

    /**
     * Set the default cloud provider.
     */
    setDefaultCloud(cloud: CloudProvider): void {
        this.updateConfig({ defaultCloud: cloud });
    }

    /**
     * Get the default cloud provider.
     */
    getDefaultCloud(): CloudProvider | undefined {
        return this.config.defaultCloud;
    }

    /**
     * Enable or disable auto-approval for deployments.
     */
    setAutoApprove(autoApprove: boolean): void {
        this.updateConfig({ autoApprove });
    }

    /**
     * Get the auto-approve setting.
     */
    getAutoApprove(): boolean {
        return !!this.config.autoApprove;
    }

    /**
     * Append a deployment record. Limits the history array to the last 50 entries.
     */
    addDeployment(record: Omit<DeploymentRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): void {
        const fullRecord: DeploymentRecord = {
            ...record,
            id: record.id || `dep-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            timestamp: record.timestamp || new Date().toISOString()
        };

        const deployments = [...(this.config.deployments || [])];
        deployments.unshift(fullRecord);

        // Keep only the most recent 50 deployments
        if (deployments.length > 50) {
            deployments.length = 50;
        }

        this.updateConfig({ deployments });
    }

    /**
     * Get list of all deployment records.
     */
    getDeployments(): DeploymentRecord[] {
        return this.config.deployments || [];
    }

    /**
     * Retrieve the latest deployment record.
     */
    getLastDeployment(): DeploymentRecord | undefined {
        const deployments = this.getDeployments();
        return deployments.length > 0 ? deployments[0] : undefined;
    }

    /**
     * Filter deployments by a specific cloud provider.
     */
    getDeploymentsByCloud(cloud: CloudProvider): DeploymentRecord[] {
        return this.getDeployments().filter(d => d.cloud === cloud);
    }

    /**
     * Filter deployments by successful status.
     */
    getSuccessfulDeployments(): DeploymentRecord[] {
        return this.getDeployments().filter(d => d.status === 'success');
    }

    /**
     * Filter deployments by failed status.
     */
    getFailedDeployments(): DeploymentRecord[] {
        return this.getDeployments().filter(d => d.status === 'failed');
    }

    /**
     * Calculate aggregate stats for deployments (count, cost, and duration).
     */
    getStats() {
        const deployments = this.getDeployments();
        const totalDeployments = deployments.length;
        
        let successfulDeployments = 0;
        let failedDeployments = 0;
        let totalCost = 0;
        let totalDuration = 0;

        deployments.forEach(d => {
            if (d.status === 'success') {
                successfulDeployments++;
            } else if (d.status === 'failed') {
                failedDeployments++;
            }
            totalCost += d.cost || 0;
            totalDuration += d.duration || 0;
        });

        const averageDuration = totalDeployments > 0 ? totalDuration / totalDeployments : 0;

        return {
            totalDeployments,
            successfulDeployments,
            failedDeployments,
            totalCost,
            totalDuration,
            averageDuration
        };
    }

    /**
     * Save the preferred region for a specific cloud provider.
     */
    setPreferredRegion(cloud: CloudProvider, region: string): void {
        const preferredRegions = {
            ...(this.config.preferredRegions || {}),
            [cloud]: region
        } as Record<CloudProvider, string>;

        this.updateConfig({ preferredRegions });
    }

    /**
     * Get the preferred region for a cloud provider.
     */
    getPreferredRegion(cloud: CloudProvider): string | undefined {
        return this.config.preferredRegions?.[cloud];
    }

    /**
     * Clear deployment history.
     */
    clearHistory(): void {
        this.updateConfig({ deployments: [] });
    }

    /**
     * Serialize the current configuration to a JSON string.
     */
    export(): string {
        return JSON.stringify(this.config, null, 2);
    }

    /**
     * Parse and import configuration from a JSON string.
     */
    import(jsonStr: string): boolean {
        try {
            const parsed = JSON.parse(jsonStr);
            if (parsed && typeof parsed === 'object') {
                this.config = {
                    ...this.config,
                    ...parsed,
                    preferredRegions: {
                        ...this.config.preferredRegions,
                        ...(parsed.preferredRegions || {})
                    },
                    deployments: Array.isArray(parsed.deployments) ? parsed.deployments : []
                };
                this.saveConfig();
                return true;
            }
        } catch (error) {
            // Import failed
        }
        return false;
    }
}

// Global ConfigManager instance
let globalConfigManager: ConfigManager | null = null;

/**
 * Factory function to retrieve or instantiate the ConfigManager singleton.
 */
export function getConfigManager(customConfigDir?: string): ConfigManager {
    if (!globalConfigManager || customConfigDir) {
        globalConfigManager = new ConfigManager(customConfigDir);
    }
    return globalConfigManager;
}

/**
 * Resets the global ConfigManager instance (mainly for testing).
 */
export function resetConfigManager(): void {
    globalConfigManager = null;
}
