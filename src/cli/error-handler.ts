import chalk from 'chalk';
import { displayError, displayWarning, displayInfo } from './banner.js';

/**
 * Global CLI Error Handler
 * Evaluates error properties and outputs clean, actionable user guidelines.
 */
export function handleError(error: any): void {
    if (!error) return;

    const message = error.message || String(error);

    // Task 150: Write CLI handleError checking for key-related error substring patterns.
    if (
        message.includes('API_KEY') ||
        message.includes('access key') ||
        message.includes('ACCESS_KEY') ||
        message.includes('secret') ||
        message.includes('credentials') ||
        message.includes('auth') ||
        message.includes('Authentication')
    ) {
        displayError('Authentication or credentials error detected.');
        displayWarning('Please check your environment variables (.env) or provider access credentials.');
        displayInfo('You can run "cloud init" to set up API keys and configure cloud options.');
        return;
    }

    // Task 151: Map ENOENT error conditions to user actions.
    if (error.code === 'ENOENT') {
        displayError(`Required file or path does not exist: ${error.path || ''}`);
        displayInfo('Please check path locations and verify files are correctly positioned.');
        return;
    }

    // Task 152: Map EACCES file access block conditions to user actions.
    if (error.code === 'EACCES' || error.code === 'EPERM') {
        displayError(`Access permission blocked: ${error.path || ''}`);
        displayInfo('Verify you have sufficient permissions to read/write this path.');
        return;
    }

    // Task 153: Map ECONNREFUSED network disconnection conditions to user actions.
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        displayError('Network connection failed or endpoint unreachable.');
        displayWarning('Check your internet connection, proxy settings, or cloud endpoint status.');
        return;
    }

    // Generic error printout fallback
    displayError(message);
    if (error.stack && process.env.LOG_LEVEL === 'debug') {
        console.error(chalk.gray(`\n${error.stack}\n`));
    }
}

/**
 * Task 154: Implement system-wide termination setup helper `setupGlobalErrorHandlers`.
 */
export function setupGlobalErrorHandlers(): void {
    // Intercept uncaught sync exceptions
    process.on('uncaughtException', (error: Error) => {
        handleError(error);
        process.exit(1);
    });

    // Intercept unhandled async promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
        handleError(reason);
        process.exit(1);
    });

    // Task 155: Write SIGINT catch block to quit CLI gracefully.
    process.on('SIGINT', () => {
        console.log(); // print a newline
        displayWarning('Process interrupted by user (SIGINT). Exiting.');
        process.exit(0);
    });

    // Task 156: Write SIGTERM handler.
    process.on('SIGTERM', () => {
        console.log(); // print a newline
        displayWarning('Process terminated (SIGTERM). Exiting.');
        process.exit(0);
    });
}

/**
 * Task 157: Implement environment validation checker `validateEnvironment`.
 */
export function validateEnvironment(): void {
    const hasKeys = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.OPENAI_API_KEY || process.env.XAI_API_KEY;
    if (!hasKeys) {
        displayWarning('No LLM API keys (GOOGLE_GENERATIVE_AI_API_KEY, OPENAI_API_KEY, XAI_API_KEY) found in your environment.');
        displayInfo('Run "cloud init" to configure environment files.');
    }
}
