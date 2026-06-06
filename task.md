# Agent-Cloud Build Checklist (400 Micro-Tasks)

Use this complete step-by-step checklist to build the **Agent-Cloud CLI** project from scratch. No details, settings, or lines of code are omitted.

---

## Phase 1: Project Initialization & Configuration (Tasks 1-30)

### Workspace Setup & Folder Structure
- [x] **Task 1**: Create the project root directory `agent-cloud`.
- [x] **Task 2**: Initialize git version control using `git init`.
- [x] **Task 3**: Create the directory structure: `src/`, `src/cli/`, `src/mastra/`, `src/mastra/agents/`, `src/mastra/tools/`, `src/mastra/workflows/`.
- [x] **Task 4**: Create the directory structure: `src/providers/`, `src/providers/aws/`, `src/providers/azure/`, `src/providers/gcp/`.
- [x] **Task 5**: Create the directory structure: `src/types/`, `src/utils/`.
- [x] **Task 6**: Create `.gitignore` file.
- [x] **Task 7**: Add `node_modules/`, `dist/`, `.env`, and `*.db*` to `.gitignore`.
- [x] **Task 8**: Add OS-specific files (`.DS_Store`, `Thumbs.db`) to `.gitignore`.
- [x] **Task 9**: Create `tsconfig.json` at the root directory.
- [x] **Task 10**: Configure `compilerOptions.target` to `"ES2022"` in `tsconfig.json`.
- [x] **Task 11**: Configure `compilerOptions.module` to `"NodeNext"` in `tsconfig.json`.
- [x] **Task 12**: Configure `compilerOptions.moduleResolution` to `"NodeNext"` in `tsconfig.json`.
- [x] **Task 13**: Set `compilerOptions.outDir` to `"./dist"` in `tsconfig.json`.
- [x] **Task 14**: Enable `compilerOptions.strict` type checking in `tsconfig.json`.
- [x] **Task 15**: Set `compilerOptions.esModuleInterop` to `true` in `tsconfig.json`.
- [x] **Task 16**: Configure `include` array to include `"src/**/*"` in `tsconfig.json`.

### Dependency Manifest Setup
- [x] **Task 17**: Run `npm init -y` to generate a default `package.json`.
- [x] **Task 18**: Set `"type": "module"` in `package.json`.
- [x] **Task 19**: Set `"main": "dist/cli/index.js"` in `package.json`.
- [x] **Task 20**: Configure the `"bin"` object with `"cloud": "./dist/cli/index.js"` in `package.json`.
- [x] **Task 21**: Define npm run script `"dev": "mastra dev"` in `package.json`.
- [x] **Task 22**: Define npm run script `"build": "tsc && mastra build"` in `package.json`.
- [x] **Task 23**: Define npm run script `"start": "node dist/cli/index.js"` in `package.json`.
- [x] **Task 24**: Define npm run script `"cli": "tsx src/cli/index.ts"` in `package.json`.
- [x] **Task 25**: Add production dependencies: `@mastra/core`, `@mastra/libsql`, `chalk`, `cli-progress`.
- [x] **Task 26**: Add production dependencies: `commander`, `dotenv`, `figlet`, `gradient-string`.
- [x] **Task 27**: Add production dependencies: `inquirer`, `ora`, `zod`.
- [x] **Task 28**: Add devDependencies: `@types/node`, `@types/figlet`, `@types/gradient-string`, `@types/inquirer`, `@types/cli-progress`.
- [x] **Task 29**: Add devDependencies: `mastra`, `tsx`, `typescript`, `vitest`.
- [x] **Task 30**: Create `.env.example` file detailing required API keys and provider environment variables.

---

## Phase 2: Core Utility Modules (Tasks 31-90)

### Shell Utilities (`src/utils/shell.ts`)
- [ ] **Task 31**: Create `src/utils/shell.ts` file.
- [ ] **Task 32**: Import necessary Node modules or typings.
- [ ] **Task 33**: Write `shellEscape` function signature to accept a string argument.
- [ ] **Task 34**: Implement logic in `shellEscape` to strip null bytes (`\0`).
- [ ] **Task 35**: Implement regex filter in `shellEscape` to only allow safe characters (alphanumeric, hyphens, underscores, dots, forward slashes, spaces).
- [ ] **Task 36**: Export `shellEscape` function.
- [ ] **Task 37**: Write `sanitizeResourceName` function signature to accept a resource name string.
- [ ] **Task 38**: Implement lowercase conversion in `sanitizeResourceName`.
- [ ] **Task 39**: Add regex to replace non-alphanumeric/hyphen characters with a single hyphen.
- [ ] **Task 40**: Add regex to replace multiple consecutive hyphens with a single hyphen.
- [ ] **Task 41**: Add regex to strip leading and trailing hyphens.
- [ ] **Task 42**: Limit resource name length to 63 characters in `sanitizeResourceName` and export it.
- [ ] **Task 43**: Write `sanitizePath` function signature to accept a path string.
- [ ] **Task 44**: Implement null-byte removal in `sanitizePath`.
- [ ] **Task 45**: Implement traversal prevention by replacing `../` and `..\` with empty strings.
- [ ] **Task 46**: Export `sanitizePath` function.

### Logging Utility (`src/utils/logger.ts`)
- [ ] **Task 47**: Create `src/utils/logger.ts` file.
- [ ] **Task 48**: Import `chalk`, `fs`, and `path`.
- [ ] **Task 49**: Define `LogLevel` union type: `'debug' | 'info' | 'warn' | 'error' | 'success'`.
- [ ] **Task 50**: Define `LogEntry` interface with `timestamp`, `level`, `message`, `metadata`, and `error` attributes.
- [ ] **Task 51**: Declare `Logger` class.
- [ ] **Task 52**: Define private class members: `logDir`, `logFile`, `sessionId`, `minLevel`, `levelPriority`.
- [ ] **Task 53**: Initialize `levelPriority` map to rank levels: debug (0), info (1), success (2), warn (3), error (4).
- [ ] **Task 54**: Create constructor for `Logger` with optional options parameter.
- [ ] **Task 55**: Resolve log folder path, default to `.agent-cloud/logs`.
- [ ] **Task 56**: Resolve unique session ID, default to timestamp.
- [ ] **Task 57**: Build log filepath string inside constructor.
- [ ] **Task 58**: Write `ensureLogDir` private method to check for directory existence and create if missing.
- [ ] **Task 59**: Write `shouldLog` private method to compare candidate levels against minimum logging level.
- [ ] **Task 60**: Write `formatMessage` private method returning a bracketed timestamp and log level prefix.
- [ ] **Task 61**: Write `writeToFile` private method that appends JSON serialized log entry strings.
- [ ] **Task 62**: Write `log` private method containing write-to-file and console colored-printing branches.
- [ ] **Task 63**: Add console output console logs with chalk styling (gray for debug, cyan for info, green for success, yellow for warn, red for error).
- [ ] **Task 64**: Add metadata printing block to `log` method.
- [ ] **Task 65**: Implement `debug` public method on `Logger`.
- [ ] **Task 66**: Implement `info` public method on `Logger`.
- [ ] **Task 67**: Implement `success` public method on `Logger`.
- [ ] **Task 68**: Implement `warn` public method on `Logger`.
- [ ] **Task 69**: Implement `error` public method on `Logger` handling stack traces.
- [ ] **Task 70**: Implement `getLogFile` public method on `Logger`.
- [ ] **Task 71**: Implement `getLogEntries` public method to read and parse the JSONL file.
- [ ] **Task 72**: Implement static `cleanupOldLogs` method to prune logs older than N days.
- [ ] **Task 73**: Define global variables and export `getLogger` and `resetLogger` functions.

### Progress & Spinner Utilities (`src/utils/progress.ts`)
- [ ] **Task 74**: Create `src/utils/progress.ts` file.
- [ ] **Task 75**: Import `ora`, `cli-progress`, and `chalk`.
- [ ] **Task 76**: Declare `Spinner` class.
- [ ] **Task 77**: Define private `spinner` instance variable.
- [ ] **Task 78**: Implement constructor in `Spinner` initializing the `ora` object with cyan color.
- [ ] **Task 79**: Implement `start` method on `Spinner`.
- [ ] **Task 80**: Implement `update` method on `Spinner`.
- [ ] **Task 81**: Implement `succeed`, `fail`, `warn`, `info`, and `stop` methods on `Spinner`.
- [ ] **Task 82**: Declare `ProgressBar` class.
- [ ] **Task 83**: Define private instance properties: `bar` and `total`.
- [ ] **Task 84**: Implement constructor inside `ProgressBar` initializing the `cli-progress.SingleBar` object.
- [ ] **Task 85**: Implement `start`, `update`, `increment`, and `stop` methods on `ProgressBar`.
- [ ] **Task 86**: Declare `ProgressTracker` class for multi-step tasks.
- [ ] **Task 87**: Define private array tracking steps and statuses.
- [ ] **Task 88**: Implement constructor mapping list of steps to pending states.
- [ ] **Task 89**: Implement `start`, `nextStep`, `failCurrentStep`, `complete`, `display`, and `getStatus` methods.
- [ ] **Task 90**: Implement `delay` helper function and spinner execution wrappers `withSpinner` / `withProgress`.

---

## Phase 3: Project Configuration & Domain Errors (Tasks 91-140)

### Config Manager (`src/utils/config.ts`)
- [ ] **Task 91**: Create `src/utils/config.ts` file.
- [ ] **Task 92**: Import `fs`, `path`, and types.
- [ ] **Task 93**: Define `DeploymentRecord` interface.
- [ ] **Task 94**: Define `ProjectConfig` interface.
- [ ] **Task 95**: Declare `ConfigManager` class.
- [ ] **Task 96**: Declare private properties: `configDir`, `configFile`, `config`.
- [ ] **Task 97**: Create constructor that builds configuration paths and loads configurations.
- [ ] **Task 98**: Implement private `loadConfig` method checking file existence.
- [ ] **Task 99**: Implement private `saveConfig` method creating directories and writing files.
- [ ] **Task 100**: Implement `getConfig` public method.
- [ ] **Task 101**: Implement `updateConfig` public method.
- [ ] **Task 102**: Implement `setDefaultCloud` and `getDefaultCloud` methods.
- [ ] **Task 103**: Implement `setAutoApprove` and `getAutoApprove` methods.
- [ ] **Task 104**: Implement `addDeployment` method limiting saved list to last 50 entries.
- [ ] **Task 105**: Implement `getDeployments` and `getLastDeployment` methods.
- [ ] **Task 106**: Implement filtering methods: `getDeploymentsByCloud`, `getSuccessfulDeployments`, `getFailedDeployments`.
- [ ] **Task 107**: Implement `getStats` calculation summarizing count, costs, and durations.
- [ ] **Task 108**: Implement `setPreferredRegion` and `getPreferredRegion` preference settings.
- [ ] **Task 109**: Implement `clearHistory` history cleaner method.
- [ ] **Task 110**: Implement `export` and `import` JSON configuration serializers.
- [ ] **Task 111**: Export `getConfigManager` factory function.

### Custom Domain Errors (`src/utils/error-handler.ts`)
- [ ] **Task 112**: Create `src/utils/error-handler.ts` file.
- [ ] **Task 113**: Import `chalk` and logging functions.
- [ ] **Task 114**: Declare `DeploymentError` extending base `Error` class.
- [ ] **Task 115**: Implement constructor parameters: `message`, `code`, `cloud`, `recoverable`, `suggestions`.
- [ ] **Task 116**: Declare `AuthenticationError` extending base `Error` class.
- [ ] **Task 117**: Declare `ValidationError` extending base `Error` class.
- [ ] **Task 118**: Declare `WorkflowError` extending base `Error` class.
- [ ] **Task 119**: Declare `ErrorHandler` orchestrator class.
- [ ] **Task 120**: Create constructor setting private logger instance.
- [ ] **Task 121**: Implement `handleDeploymentError` print formatting logic.
- [ ] **Task 122**: Implement `handleAuthenticationError` user-facing fix advice formatting.
- [ ] **Task 123**: Implement `handleValidationError` printing problematic fields.
- [ ] **Task 124**: Implement `handleWorkflowError` resume/retry details printer.
- [ ] **Task 125**: Implement `handleGenericError` printing stack trace if debug is on.
- [ ] **Task 126**: Implement route detection in `handle` to forward errors to correct typed handler.
- [ ] **Task 127**: Implement `wrap` utility wrapping asynchronous code executions.
- [ ] **Task 128**: Define global error handler export helper.
- [ ] **Task 129**: Create `ErrorFactory` object literal configuration.
- [ ] **Task 130**: Implement AWS deployment error builder helper.
- [ ] **Task 131**: Implement GCP deployment error builder helper.
- [ ] **Task 132**: Implement Azure deployment error builder helper.
- [ ] **Task 133**: Implement AWS auth failed error builder helper.
- [ ] **Task 134**: Implement GCP auth failed error builder helper.
- [ ] **Task 135**: Implement Azure auth failed error builder helper.
- [ ] **Task 136**: Implement workflow step failure builder helper.
- [ ] **Task 137**: Implement invalid cloud validation builder helper.
- [ ] **Task 138**: Implement missing project path validation builder helper.

### Project Interfaces & Types (`src/types/index.ts`)
- [ ] **Task 139**: Create `src/types/index.ts` file.
- [ ] **Task 140**: Export type declarations for `CloudProvider`, `DeploymentRequirements`, `CloudProviderConfig`, `ProjectAnalysis`, `DeploymentPlan`, and `ProgressStep`.

---

## Phase 4: CLI Interface, Banners, & Wizards (Tasks 141-190)

### Banner & Layout (`src/cli/banner.ts`)
- [ ] **Task 141**: Create `src/cli/banner.ts` file.
- [ ] **Task 142**: Import `figlet`, `gradient-string`, and `chalk`.
- [ ] **Task 143**: Write `displayBanner` method executing `figlet.textSync` with 'Small' font.
- [ ] **Task 144**: Configure gradient string color arrays for CLI banner header.
- [ ] **Task 145**: Write `displayHeader` function using repeat repeat block styling.
- [ ] **Task 146**: Write `displayDivider` method to print simple horizontal rules.
- [ ] **Task 147**: Write validation warning displayers: `displaySuccess`, `displayError`, `displayInfo`, `displayWarning`.

### Global CLI Error Handlers (`src/cli/error-handler.ts`)
- [ ] **Task 148**: Create `src/cli/error-handler.ts` file.
- [ ] **Task 149**: Import `chalk` and banner displays.
- [ ] **Task 150**: Write CLI `handleError` checking for key-related error substring patterns.
- [ ] **Task 151**: Map `ENOENT` error conditions to user actions.
- [ ] **Task 152**: Map `EACCES` file access block conditions to user actions.
- [ ] **Task 153**: Map `ECONNREFUSED` network disconnection conditions to user actions.
- [ ] **Task 154**: Implement system-wide termination setup helper `setupGlobalErrorHandlers`.
- [ ] **Task 155**: Write `SIGINT` catch block to quit CLI gracefully.
- [ ] **Task 156**: Write `SIGTERM` handler.
- [ ] **Task 157**: Implement environment validation checker `validateEnvironment`.

### Guided Setup Wizards (`src/cli/prompts.ts`)
- [ ] **Task 158**: Create `src/cli/prompts.ts` file.
- [ ] **Task 159**: Import `inquirer`, `chalk`, and models.
- [ ] **Task 160**: Define `CLOUD_PROVIDERS` configuration dictionary with CLI paths and doc links.
- [ ] **Task 161**: Implement `displayWelcome` information writer.
- [ ] **Task 162**: Implement `collectDeploymentRequirements` questionnaire builder.
- [ ] **Task 163**: Setup deployment description input with inquirer validation rule (minimum 3 chars).
- [ ] **Task 164**: Setup cloud selection prompt with pretty icons and descriptions.
- [ ] **Task 165**: Implement `confirmDeploymentPlan` review layout logic.
- [ ] **Task 166**: Implement `collectEnvironmentVariables` password collection prompt hidden input mask.
- [ ] **Task 167**: Implement `withLoadingMessage` inline async tracker.
- [ ] **Task 168**: Implement `selectFromList` prompt choice builder.
- [ ] **Task 169**: Implement `getTextInput` and `getConfirmation` interactive inquirer builders.
- [ ] **Task 170**: Implement `getCloudProviderConfig` and `displayCloudProviders` CLI summary printers.

---

## Phase 5: CLI Entrypoint Commands & Routing (Tasks 171-210)

### Action Routing (`src/cli/commands.ts`)
- [ ] **Task 171**: Create `src/cli/commands.ts` file.
- [ ] **Task 172**: Import libraries: filesystem tools, prompts, utilities, and models.
- [ ] **Task 173**: Declare `initCommand` wizard function.
- [ ] **Task 174**: Implement `.env` path resolution and check file accessibility in `initCommand`.
- [ ] **Task 175**: Setup API key wizard prompts selecting Google Gemini vs OpenAI.
- [ ] **Task 176**: Write file-appender logic to save keys into local `.env` values.
- [ ] **Task 177**: Program CLI scanner iteration checking `aws`, `gcloud`, and `az` versions.
- [ ] **Task 178**: Configure provider preferences setup loop based on detected command-line CLIs.
- [ ] **Task 179**: Declare `analyzeCommand` analyzer handler.
- [ ] **Task 180**: Implement toggle logic supporting offline local scans vs AI analyzer agent stream lookups.
- [ ] **Task 181**: Parse stream chunk outputs from analyzer agent in `analyzeCommand`.
- [ ] **Task 182**: Extract JSON arrays from AI responses using regex match logic.
- [ ] **Task 183**: Implement offline project analyzer `runLocalAnalysis`.
- [ ] **Task 184**: Add Docker configuration files scanner (Dockerfile, docker-compose).
- [ ] **Task 185**: Read Node.js properties: package manager locks (`pnpm`, `yarn`, `bun`), scripts, dependency imports.
- [ ] **Task 186**: Set runtime detection targets for framework matches (Express, NestJS, Next.js, Fastify, Vue, React).
- [ ] **Task 187**: Add backend service dependency lookups (Postgres, Mongo, MySQL, Redis, SQLite).
- [ ] **Task 188**: Set Python requirement files checker (requirements.txt, FastAPI, Flask, Django).
- [ ] **Task 189**: Set Go backend module checker (`go.mod`).
- [ ] **Task 190**: Configure static index.html checkers and print analysis details in console logs.

### Action Routing Continued (`src/cli/commands.ts`)
- [ ] **Task 191**: Implement fallback project classifications if type scans fail.
- [ ] **Task 192**: Setup static project recommendations lists mapping to local config recommendations.
- [ ] **Task 193**: Declare `historyCommand` history listing viewer.
- [ ] **Task 194**: Fetch deployments from config manager inside `historyCommand`.
- [ ] **Task 195**: Handle empty history list by showing run instructions.
- [ ] **Task 196**: Compute summary reports inside `historyCommand`.
- [ ] **Task 197**: Format deployment dates and duration statistics.
- [ ] **Task 198**: Declare `infoCommand` mapping to provider details print views.

### CLI Index Entrypoint (`src/cli/index.ts`)
- [ ] **Task 199**: Create `src/cli/index.ts` file.
- [ ] **Task 200**: Import dotenv configuration variables.
- [ ] **Task 201**: Import commander `Command` class.
- [ ] **Task 202**: Import setup wizard actions, workflow commands, banners, and handlers.
- [ ] **Task 203**: Write CLI `main` setup.
- [ ] **Task 204**: Configure CLI application name and description inside `main`.
- [ ] **Task 205**: Define option `--deploy` (Fast Deployment demo trigger).
- [ ] **Task 206**: Bind `init` command option structure.
- [ ] **Task 207**: Bind `analyze` command option structure matching local scans.
- [ ] **Task 208**: Bind `deploy` command options (cloud provider, path override, auto-approve, dry-run).
- [ ] **Task 209**: Bind `status` command options.
- [ ] **Task 210**: Bind `history` and `info` commands, and start runner process execution parsing logic.

---

## Phase 6: Cloud Provider Integrations (Tasks 211-300)

### AWS Provider (`src/providers/aws/index.ts`)
- [ ] **Task 211**: Create `src/providers/aws/index.ts` file.
- [ ] **Task 212**: Import exec helpers, fs writes, resource string sanitizers.
- [ ] **Task 213**: Define configuration options interface `AWSConfig`.
- [ ] **Task 214**: Define AWS `DeploymentResult` format.
- [ ] **Task 215**: Declare `AWSProvider` class interface.
- [ ] **Task 216**: Implement constructor initializing profile and target region values.
- [ ] **Task 217**: Implement `authenticate` calling caller-identity command.
- [ ] **Task 218**: Implement `deployToECS` ECS service deployer function.
- [ ] **Task 219**: Sanitize deployment app names for ECS clusters.
- [ ] **Task 220**: Build AWS CLI target execution script mapping cluster creations.
- [ ] **Task 221**: Prepare task definition parameter configurations.
- [ ] **Task 222**: Write task definition configuration files to path `/tmp/task-definition.json`.
- [ ] **Task 223**: Run task definition registration commands using exec.
- [ ] **Task 224**: Execute VPC query commands fetching default settings.
- [ ] **Task 225**: Select subnets list from CLI query results.
- [ ] **Task 226**: Create deployment target security groups.
- [ ] **Task 227**: Authorize security group ingress commands.
- [ ] **Task 228**: Launch ECS Service creation script with launch type FARGATE.
- [ ] **Task 229**: Return deployment outcomes containing URLs and resource mappings.
- [ ] **Task 230**: Implement `deployLambda` function.
- [ ] **Task 231**: Create trust relationship policy configurations.
- [ ] **Task 232**: Create IAM execution roles using aws CLI commands.
- [ ] **Task 233**: Bind AWS managed service execution policies to created roles.
- [ ] **Task 234**: Wait for IAM roles to propagate globally.
- [ ] **Task 235**: Deploy AWS lambda packages using CLI commands.
- [ ] **Task 236**: Return function ARN and properties.
- [ ] **Task 237**: Implement `deployStaticSite` hosting files inside AWS S3 buckets.
- [ ] **Task 238**: Create target S3 buckets using mb commands.
- [ ] **Task 239**: Set S3 website property settings.
- [ ] **Task 240**: Write bucket policy JSON payload allowing public access.

### AWS Provider Continued (`src/providers/aws/index.ts`)
- [ ] **Task 241**: Apply policy payloads to AWS S3 buckets.
- [ ] **Task 242**: Run sync commands uploads updating build folders to S3.
- [ ] **Task 243**: Return live website URL endpoint.
- [ ] **Task 244**: Implement `cleanup` removing created ecs services.
- [ ] **Task 245**: Implement `cleanup` removing ecs clusters.

### GCP Provider (`src/providers/gcp/index.ts`)
- [ ] **Task 246**: Create `src/providers/gcp/index.ts` file.
- [ ] **Task 247**: Import utilities and types.
- [ ] **Task 248**: Define `GCPConfig` format parameters.
- [ ] **Task 249**: Declare `GCPProvider` class interface.
- [ ] **Task 250**: Implement constructor setting target projects and location configurations.
- [ ] **Task 251**: Implement `authenticate` validating active GCP CLI login listings.
- [ ] **Task 252**: Implement `deployToCloudRun` container deployer.
- [ ] **Task 253**: Check docker image presence or build from source using Cloud Build tag submissions.
- [ ] **Task 254**: Run managed platform deploy scripts inside target region values.
- [ ] **Task 255**: Parse URL formats from terminal print strings.
- [ ] **Task 256**: Implement `deployCloudFunction` setup commands.
- [ ] **Task 257**: Trigger deployment functions with http entry points.
- [ ] **Task 258**: Return function details from GCP CLI response logs.
- [ ] **Task 259**: Implement `deployStaticSite` setting Google Storage hosting.
- [ ] **Task 260**: Create Storage buckets using bucket command utilities.
- [ ] **Task 261**: Set uniform bucket level permissions to allow open listings.
- [ ] **Task 262**: Configure public storage IAM policy bindings.
- [ ] **Task 263**: Apply main page suffixes onto Storage web buckets.
- [ ] **Task 264**: Execute copy actions syncing build folders up to Storage buckets.
- [ ] **Task 265**: Implement `deployToAppEngine` engine deployments.
- [ ] **Task 266**: Create `app.yaml` runtime details declarations dynamically.
- [ ] **Task 267**: Execute app engine deploy commands.
- [ ] **Task 268**: Implement `deployToFirebase` helper script.
- [ ] **Task 269**: Write configurations inside `firebase.json` formats.
- [ ] **Task 270**: Deploy firebase projects using deployment CLI commands.
- [ ] **Task 271**: Extract live Firebase hosting urls.
- [ ] **Task 272**: Implement GCP `cleanup` removing run services, functions, and storage buckets.

### Azure Provider (`src/providers/azure/index.ts`)
- [ ] **Task 273**: Create `src/providers/azure/index.ts` file.
- [ ] **Task 274**: Import dependencies and helpers.
- [ ] **Task 275**: Declare `AzureProvider` class interface.
- [ ] **Task 276**: Implement constructor initializing subscription, resources groups, and location settings.
- [ ] **Task 277**: Implement `authenticate` validating Azure account details.
- [ ] **Task 278**: Write private `ensureResourceGroup` verifying resource groups exist.
- [ ] **Task 279**: Implement `deployToContainerApps` service setup.
- [ ] **Task 280**: Execute Container App environment creation tools.
- [ ] **Task 281**: Deploy Container Apps with ingress external settings.
- [ ] **Task 282**: Implement `deployAzureFunctions` serverless script.
- [ ] **Task 283**: Create Azure storage accounts for function states.
- [ ] **Task 284**: Create function apps configurations.
- [ ] **Task 285**: Deploy function app code using publishing commands.
- [ ] **Task 286**: Implement `deployStaticWebApp` hosting deployments.
- [ ] **Task 287**: Launch static web apps creation script in Azure CLI.
- [ ] **Task 288**: Fetch app key secrets inside Azure.
- [ ] **Task 289**: Run static web apps CLI deploy tools.
- [ ] **Task 290**: Implement `deployBlobStorage` hosting setup.
- [ ] **Task 291**: Create storage accounts utilizing Standard_LRS sku configurations.
- [ ] **Task 292**: Update blob service properties enabling static website hosting.
- [ ] **Task 293**: Upload batch assets updating target blobs container.
- [ ] **Task 294**: Implement App Service deployment function `deployAppService`.
- [ ] **Task 295**: Create simulated fast deployment logging steps inside `deployAppService`.
- [ ] **Task 296**: Generate App Service live URL mock outputs.
- [ ] **Task 297**: Implement `cleanup` command delete targets: containerApp.
- [ ] **Task 298**: Implement `cleanup` command delete targets: function.
- [ ] **Task 299**: Implement `cleanup` command delete targets: app, storage.
- [ ] **Task 300**: Implement `cleanupResourceGroup` script initiating background removals.

---

## Phase 7: AI Integrations & Mastra Setup (Tasks 301-340)

### Mastra Configuration & Instances (`src/mastra/index.ts`)
- [ ] **Task 301**: Create `src/mastra/index.ts` file at the mastra subdirectory.
- [ ] **Task 302**: Import `Mastra` core engine module class.
- [ ] **Task 303**: Import `LibSQLStore` database manager.
- [ ] **Task 304**: Import custom AI agents (analyzer, deployment, validator).
- [ ] **Task 305**: Import workflows configuration settings.
- [ ] **Task 306**: Configure Mastra constructor settings binding agent instances.
- [ ] **Task 307**: Register deployment workflows inside Mastra config declarations.
- [ ] **Task 308**: Initialize local storage configuration `LibSQLStore` URL pointing to local database path file `./agent-cloud.db`.
- [ ] **Task 309**: Export initialized Mastra instance parameters.
- [ ] **Task 310**: Create `mastra.config.ts` configuration options at project root directories.

### AI Analyzer Agent (`src/mastra/agents/analyzer.ts`)
- [ ] **Task 311**: Create `src/mastra/agents/analyzer.ts` file.
- [ ] **Task 312**: Import `Agent` class constructor from Mastra.
- [ ] **Task 313**: Import analyzer tools configurations.
- [ ] **Task 314**: Declare `analyzerAgent` instance.
- [ ] **Task 315**: Setup agent configuration ID (`project-analyzer`) and name.
- [ ] **Task 316**: Write System prompts defining DevOps project scanning logic steps.
- [ ] **Task 317**: Embed structural JSON response schemas inside analyzer prompt guidelines.
- [ ] **Task 318**: Configure model selection checks prioritizing `XAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, or `OPENAI_API_KEY` models.
- [ ] **Task 319**: Register fileSystem, reader, analyzer, parser tools onto the analyzer agent.
- [ ] **Task 320**: Set maximum retries properties.

### AI Validator Agent (`src/mastra/agents/validator.ts`)
- [ ] **Task 321**: Create `src/mastra/agents/validator.ts` file.
- [ ] **Task 322**: Import `Agent` class constructor.
- [ ] **Task 323**: Import validator checker tools.
- [ ] **Task 324**: Declare `validatorAgent` instance.
- [ ] **Task 325**: Configure agent ID `environment-validator` and name properties.
- [ ] **Task 326**: Design validator prompts outlining verification checks (CLI tools, auth, env, network, permissions).
- [ ] **Task 327**: Configure agent LLM model fallback chains.
- [ ] **Task 328**: Register checker tools onto the validator agent config.

### AI Deployment Planner Agent (`src/mastra/agents/deployment.ts`)
- [ ] **Task 329**: Create `src/mastra/agents/deployment.ts` file.
- [ ] **Task 330**: Import `Agent` class.
- [ ] **Task 331**: Import serviceMapper, costEstimator, commandGenerator tools.
- [ ] **Task 332**: Declare `deploymentAgent` instance.
- [ ] **Task 333**: Write planner instructions mapping inputs to services, costs, and setup steps.
- [ ] **Task 334**: Embed planner JSON schemas.
- [ ] **Task 335**: Register tools onto the deployment agent.
- [ ] **Task 336**: Set retries.

### Agents Index (`src/mastra/agents/index.ts`)
- [ ] **Task 337**: Create `src/mastra/agents/index.ts` file.
- [ ] **Task 338**: Export `analyzerAgent` config object references.
- [ ] **Task 339**: Export `validatorAgent` config object references.
- [ ] **Task 340**: Export `deploymentAgent` config object references.

---

## Phase 8: Custom AI Tools (Tasks 341-380)

### Code Scanners & Parsers (`src/mastra/tools/index.ts`)
- [ ] **Task 341**: Create `src/mastra/tools/index.ts` file.
- [ ] **Task 342**: Import `createTool` from Mastra core tools.
- [ ] **Task 343**: Import `zod` for schemas definitions.
- [ ] **Task 344**: Define `fileSystemTool` parameter configurations.
- [ ] **Task 345**: Implement folder scanners inside `fileSystemTool` ignoring node_modules/git directories.
- [ ] **Task 346**: Define `fileReaderTool` parameter configurations.
- [ ] **Task 347**: Implement file reader logic inside `fileReaderTool` returning file content strings.
- [ ] **Task 348**: Define `dependencyAnalyzerTool` parameter configurations.
- [ ] **Task 349**: Implement dependency analyzer logic mapping framework configurations.
- [ ] **Task 350**: Define `packageJsonParserTool` parameter configurations.
- [ ] **Task 351**: Implement JSON parsing logic extracting build/start script properties.

### Planning Tools (`src/mastra/tools/deployment.ts`)
- [ ] **Task 352**: Create `src/mastra/tools/deployment.ts` file.
- [ ] **Task 353**: Define service mappings dictionaries for AWS, GCP, and Azure.
- [ ] **Task 354**: Define `serviceMapperTool` mapping inputs to mapped cloud services list.
- [ ] **Task 355**: Define `costEstimatorTool` calculating monthly compute storage costs.
- [ ] **Task 356**: Implement small/medium/large scaling multiplier calculations inside `costEstimatorTool`.
- [ ] **Task 357**: Define `commandGeneratorTool` schema configurations.
- [ ] **Task 358**: Implement command templates generation script mappings inside `commandGeneratorTool` for AWS.
- [ ] **Task 359**: Implement command templates generation script mappings inside `commandGeneratorTool` for GCP.
- [ ] **Task 360**: Implement command templates generation script mappings inside `commandGeneratorTool` for Azure.

### Validation Tools (`src/mastra/tools/validator.ts`)
- [ ] **Task 361**: Create `src/mastra/tools/validator.ts` file.
- [ ] **Task 362**: Define `cliCheckerTool` properties.
- [ ] **Task 363**: Implement command executions looking up version strings inside `cliCheckerTool`.
- [ ] **Task 364**: Define `authCheckerTool` properties.
- [ ] **Task 365**: Implement STS caller check operations inside `authCheckerTool` for AWS.
- [ ] **Task 366**: Implement account status check operations inside `authCheckerTool` for GCP.
- [ ] **Task 367**: Implement account configuration check operations inside `authCheckerTool` for Azure.
- [ ] **Task 368**: Define `envVarCheckerTool` properties.
- [ ] **Task 369**: Implement environment checks validating access properties in `envVarCheckerTool`.
- [ ] **Task 370**: Define `networkCheckerTool` properties.
- [ ] **Task 371**: Implement curl execution logic inside `networkCheckerTool` calculating connection latencies.
- [ ] **Task 372**: Define `permissionsCheckerTool` properties.
- [ ] **Task 373**: Implement bucket list commands inside `permissionsCheckerTool` checking AWS access permissions.
- [ ] **Task 374**: Implement projects list commands checking GCP permissions.
- [ ] **Task 375**: Implement resource groups list commands checking Azure permissions.

### Execution Tools (`src/mastra/tools/executor.ts`)
- [ ] **Task 376**: Create `src/mastra/tools/executor.ts` file.
- [ ] **Task 377**: Define `commandExecutorTool` properties executing command strings.
- [ ] **Task 378**: Define `awsCommandTool` execution parameters.
- [ ] **Task 379**: Define `dockerBuildTool` configuration properties.
- [ ] **Task 380**: Implement docker build terminal executor script logic.

---

## Phase 9: Workflow Orchestration & Verification (Tasks 381-400)

### Orchestration Workflows (`src/mastra/workflows/deployment.ts`)
- [ ] **Task 381**: Create `src/mastra/workflows/deployment.ts` file.
- [ ] **Task 382**: Import step creation modules from Mastra.
- [ ] **Task 383**: Declare `deploymentStep` defining input, output, and resume validation schemas.
- [ ] **Task 384**: Initialize production managers (logger, config, error) in `deploymentStep`.
- [ ] **Task 385**: Setup Phase 1 execution checking environment validation states.
- [ ] **Task 386**: Setup Phase 2 execution checking project frameworks details.
- [ ] **Task 387**: Setup Phase 3 deployment planning steps.
- [ ] **Task 388**: Setup Phase 4 user-facing approval gate trigger calls.
- [ ] **Task 389**: Configure suspend mechanisms returning payload items.
- [ ] **Task 390**: Setup user rejection log recording rules.
- [ ] **Task 391**: Configure Phase 5 cloud provider selection routers.
- [ ] **Task 392**: Setup AWS deployments execution paths inside Phase 5.
- [ ] **Task 393**: Setup GCP deployments execution paths inside Phase 5.
- [ ] **Task 394**: Setup Azure deployments execution paths inside Phase 5.
- [ ] **Task 395**: Add post-deployment validation logging, config recordings, and duration measurements.
- [ ] **Task 396**: Catch and handle outer errors inside workflow deployment.
- [ ] **Task 397**: Define the main `deploymentWorkflow` configuration settings.

### Interactive Orchestrator CLI commands (`src/cli/workflow-commands.ts`)
- [ ] **Task 398**: Create `src/cli/workflow-commands.ts` file.
- [ ] **Task 399**: Implement interactive status validator commands.
- [ ] **Task 400**: Implement interactive workflow deployment router triggers with approval gate inputs.
