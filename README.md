<<<<<<< HEAD
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
=======
# Agent-Cloud CLI ☁️🤖

Agent-Cloud CLI is an AI-powered DevOps deployment orchestrator built with Node.js, TypeScript, and the **Mastra AI Agent Framework**. It is designed to scan local codebases, design cloud resource blueprints, estimate monthly costs, request human approval, and provision resources securely.

---

## 🛠️ Key Features

*   **Multi-Agent Coordination**: Orchestrates three specialized AI agents (`project-analyzer`, `deployment-planner`, and `environment-validator`) to handle scanning, planning, and system verification.
*   **Stateful Mastra Workflows**: Implements a robust 5-phase deployment pipeline with durable execution, featuring a **suspend & resume approval gate** for human-in-the-loop validation.
*   **Local State Persistence**: Stores configuration preferences, default cloud targets, and deployment histories securely in a local SQLite database via `LibSQLStore`.
*   **Rigorous Shell Security**: Employs null-byte removal, strict regex whitelists, subdomain validation, and directory traversal prevention to block command injection.
*   **Double-Stream Logging**: Spits clean, colorized feedback to the console while appending structured JSON Lines (JSONL) metrics to a persistent log file.
*   **Polished CLI Visuals**: Features custom layout dividers, loaders, progress spinners, and interactive welcome banners.

---

## 🏗️ Architectural Flow

The deployment workflow processes through 5 sequential phases:

```
[User Command] ──> Phase 1: Env Validation (CLI, credentials, permissions checks)
                       │
                       └──> Phase 2: Project Analysis (Inspect frameworks/dependencies)
                                │
                                └──> Phase 3: Infrastructure Planning (Map resources & estimate costs)
                                         │
                                         └──> Phase 4: Suspend & Approval (Interactive confirmation)
                                                  │
                                                  └──> Phase 5: Resource Execution (Azure CLI wrapper)
```

---

## 📂 Project Structure

```
├── .agent-cloud/          # Local logs and config database
├── src/
│   ├── cli/               # Commander CLI scripts, prompts, and actions
│   │   ├── banner.ts      # Visual banners and dividers
│   │   ├── commands.ts    # Setup commands and local project scanners
│   │   ├── prompts.ts     # Inquirer questionnaires & plan confirmers
│   │   └── workflow-commands.ts # Actions connecting CLI to the Mastra engine
│   ├── mastra/            # Core AI and orchestration layer
│   │   ├── agents/        # Analyzer, Validator, and Planner agents
│   │   ├── tools/         # Reusable capabilities given to agents
│   │   └── workflows/     # Stateful deployment workflows (suspend/resume)
│   ├── providers/         # Cloud provider wrapper scripts (Azure, AWS, GCP stubs)
│   ├── types/             # Shared TypeScript schemas and interfaces
│   └── utils/             # Singleton logger, config manager, and sanitizers
├── package.json
├── tsconfig.json
└── task.md                # 400 micro-tasks implementation checklist
```

---

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (>= 18.0.0)
*   [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) (Required for live Azure deployments)
*   Google Gemini API Key or OpenAI API Key (For AI-powered analysis)

### Installation

1.  Clone the repository and navigate to the project directory:
    ```bash
    cd agent_ultimate_cloude
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Compile the TypeScript codebase:
    ```bash
    npm run build
    ```

---

## 💻 CLI Usage

All commands are run using the prefix `npm run cli --`.

### 1. Initialize Settings
Create your `.env` configuration and configure your preferred AI model API keys:
```bash
npm run cli -- init
```

### 2. Scan Project Codebase
Analyze the framework and databases used in a target project folder:
```bash
# Scan current directory
npm run cli -- analyze .

# Scan another project directory
npm run cli -- analyze /path/to/another/project
```

### 3. Trigger Deployment Workflow
Orchestrate validation, scan, design, approval, and execution:
```bash
# Run deployment in simulation/dry-run mode (Recommended for testing)
npm run cli -- deploy . --dry-run

# Run auto-approve mode (bypasses manual approval prompt)
npm run cli -- deploy . --dry-run --auto-approve
```

### 4. Fetch Status
Display details of the latest deployment release:
```bash
npm run cli -- status
```

### 5. Review History Records
Query SQLite history logs and view monthly billing statistics:
```bash
npm run cli -- history
```

---

## 🛡️ Security Design (Interview Ready)

*   **Command Injection Mitigation**: When generating scripts dynamically, inputs are passed through a whitelist-based escaping filter (`shellEscape`) rejecting execution operators (`&`, `;`, `|`, `` ` ``).
*   **Path Traversal Prevention**: Path parameters are parsed to eliminate relative navigation shortcuts (`../`, `..\`) ensuring operations remain sandboxed.
*   **Cloud Extensibility**: AWS and GCP are built as clean interface stubs. This displays the **Adapter Design Pattern**, showing that the orchestrator is cloud-agnostic and new providers can be plugged in without changing the core workflow engine.
>>>>>>> fe98238 ( update the instruction and step to run the project in radme section)
