import figlet from 'figlet';
import gradient from 'gradient-string';
import chalk from 'chalk';

// Task 144: Configure gradient string color arrays for CLI banner header
const BLUE_CYAN_GRADIENT = ['#4FACFE', '#00F2FE'];
const SUCCESS_GRADIENT = ['#00F260', '#0575E6'];
const WARNING_GRADIENT = ['#FAD961', '#F76B1C'];

/**
 * Display the main CLI application ASCII banner.
 */
export function displayBanner(): void {
    const bannerText = figlet.textSync('AGENT-CLOUD', {
        font: 'Small',
        horizontalLayout: 'default',
        verticalLayout: 'default',
    });
    
    // Apply the gradient color array configuration
    console.log(gradient(BLUE_CYAN_GRADIENT).multiline(bannerText));
}

/**
 * Print a stylized header block for sections or steps in CLI execution.
 */
export function displayHeader(title: string): void {
    const width = 60;
    const border = '━'.repeat(width);
    
    console.log(gradient(BLUE_CYAN_GRADIENT)(border));
    console.log(chalk.bold.cyan(`  ${title.toUpperCase()}`));
    console.log(gradient(BLUE_CYAN_GRADIENT)(border));
}

/**
 * Print a simple horizontal separator rule.
 */
export function displayDivider(char: string = '─', length: number = 60): void {
    console.log(chalk.gray(char.repeat(length)));
}

/**
 * Print success messages with colored checkboxes and text.
 */
export function displaySuccess(message: string): void {
    console.log(`${chalk.green('✔')} ${chalk.bold.green('SUCCESS:')} ${message}`);
}

/**
 * Print error messages with cross icons and text.
 */
export function displayError(message: string): void {
    console.log(`${chalk.red('✖')} ${chalk.bold.red('ERROR:')} ${message}`);
}

/**
 * Print info messages with information marks and text.
 */
export function displayInfo(message: string): void {
    console.log(`${chalk.blue('ℹ')} ${chalk.bold.blue('INFO:')} ${message}`);
}

/**
 * Print warning messages with warning icons and text.
 */
export function displayWarning(message: string): void {
    console.log(`${chalk.yellow('⚠')} ${chalk.bold.yellow('WARNING:')} ${message}`);
}
