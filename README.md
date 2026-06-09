1. Initial Setup & Compilation
Before running the CLI, you must install dependencies and compile the TypeScript files:

powershell
# Install Node modules
npm install
# Compile TypeScript to JavaScript (creates the /dist directory)
npm run build
2. CLI Entrypoint Commands
Use the npm run cli -- prefix to run the CLI directly:

Initialize the CLI (Setup your API keys & configure default cloud):
powershell
npm run cli -- init
Analyze a target project (Scan framework and database of a project folder):
powershell
# Scan the current folder
npm run cli -- analyze .
# Or scan another folder
npm run cli -- analyze C:\path\to\your\app
Run a Deployment (Orchestrates validation, analysis, planning, approval gate, and execution):
powershell
# Run in dry-run/simulation mode (recommended for testing)
npm run cli -- deploy . --dry-run
# Run auto-approve mode (skips approval gate)
npm run cli -- deploy . --dry-run --auto-approve
Check latest deployment status:
powershell
npm run cli -- status
View history records and monthly billing statistics (Queries the local SQLite DB):
powershell
npm run cli -- history
Show cloud directory details & documentation links:
powershell
npm run cli -- info
Display help options:
powershell
npm run cli -- --help
