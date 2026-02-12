# Week 1 CI/CD Pipeline Documentation

## Table of Contents

1. [Overview](#overview)
2. [Pipeline Architecture](#pipeline-architecture)
3. [Workflow Files Guide](#workflow-files-guide)
4. [Setup Instructions](#setup-instructions)
5. [Understanding Each Stage](#understanding-each-stage)
6. [Security Checks Explained](#security-checks-explained)
7. [Deployment Process](#deployment-process)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### What is CI/CD?

**CI/CD** = Continuous Integration / Continuous Deployment

- **Continuous Integration (CI)**: Code is automatically tested and validated every time pushed
- **Continuous Deployment (CD)**: Code is automatically deployed to servers if all checks pass

### Why Use CI/CD?

✅ **Automation**: No manual testing or deployment  
✅ **Speed**: Deploy changes in minutes instead of hours  
✅ **Safety**: Automated checks catch bugs before production  
✅ **Consistency**: Same process every time, no human error  
✅ **Feedback**: Know immediately if something breaks  

### What We're Building

A pipeline that:
1. Validates code compiles (Build)
2. Runs tests (Test)
3. Checks for security vulnerabilities (Security)
4. Packages app in Docker (Docker)
5. Automatically deploys to AWS EC2 (Deploy)
6. Rolls back if deployment fails (Rollback)

---

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Pipeline                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  PUSH TO MAIN → Build → Test → Security → Docker → Deploy   │
│                                                               │
│  ✅ Build      | Install deps, check syntax, optional lint  │
│                                                               │
│  ✅ Test       | Run tests (optional if not configured)     │
│                                                               │
│  ✅ Security   | npm audit, CodeQL analysis                │
│                                                               │
│  ✅ Docker     | Build image, tag it, push to Docker Hub   │
│                                                               │
│  ✅ Deploy     | Pull image on EC2, start container        │
│                                                               │
│  ✅ Rollback   | If deploy fails, restore previous version │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### What Triggers the Pipeline?

- ✅ Push to `main` branch → Runs **all stages** (Build → Deploy)
- ✅ Push to `develop` branch → Runs Build/Test/Security only (no Deploy)
- ✅ Pull Request to `main` → Runs Build/Test/Security only (no Deploy)
- ✅ Manual trigger → Run workflow manually from GitHub UI

---

## Workflow Files Guide

### Where Do Workflow Files Live?

**Important:** GitHub Actions workflows **must** live in:
```
repo-root/
└── .github/
    └── workflows/
        ├── ci-cd-pipeline.yml        ← Main pipeline (Build→Deploy)
        ├── pr-validation.yml         ← PR checks
        └── dependency-scan.yml       ← Security monitoring
```

**NOT here (won't work):**
```
week1-cicd/
└── .github/
    └── workflows/          ❌ GitHub won't find this!
```

### Workflow Files Explained

#### 1. ci-cd-pipeline.yml

**What it does:**  
Main pipeline that builds, tests, secures, builds Docker image, and deploys.

**When it runs:**
- Every push to `main` (all stages)
- Every push to `develop` (skip Docker/Deploy)
- Every pull request to `main` (skip Docker/Deploy)

**Jobs inside:**
- `build` - Install deps, check syntax
- `test` - Run tests (if configured)
- `security` - npm audit + CodeQL
- `docker` - Build/push Docker image
- `deploy` - Deploy to EC2 (OIDC + SSM)

**Key features:**
- Runs jobs in parallel where possible (docker needs test+security)
- Cancels old runs if new push comes in (concurrency)
- Uses caching to speed up subsequent runs

---

#### 2. pr-validation.yml

**What it does:**  
Validates pull requests have description and shows changed files.

**When it runs:**
- When PR is opened
- When PR is updated (new commits)
- When PR is reopened

**Why this matters:**
- Ensures good PR hygiene (description required)
- Shows what files changed
- Helps code reviewers understand scope

---

#### 3. dependency-scan.yml

**What it does:**  
Scans npm dependencies for vulnerabilities weekly.

**When it runs:**
- Every Monday at 9 AM UTC (scheduled)
- Manually (workflow_dispatch)

**Why this matters:**
- Finds new vulnerabilities in your dependencies
- Can run independently from main pipeline
- Produces report artifact for download

---

## Setup Instructions

### Step 1: Ensure Correct Directory Structure

Your code must be in `week1-cicd/`:
```
week1-cicd/
├── server.js          ← Main app
├── package.json       ← Dependencies
├── Dockerfile         ← Docker config
├── MOCK_DATA.json     ← Sample data
└── node_modules/      ← Installed packages
```

Workflows must be at repo root:
```
.github/
└── workflows/
    ├── ci-cd-pipeline.yml
    ├── pr-validation.yml
    └── dependency-scan.yml
```

### Step 2: Add GitHub Secrets

Go to: **Settings → Secrets and variables → Actions**

Add these 4 secrets:

| Secret | Value | Get From |
|--------|-------|----------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username | docker.hub account |
| `DOCKERHUB_TOKEN` | Docker Hub access token | Docker Hub → Account Settings → Security |
| `AWS_ROLE_ARN` | Your IAM role ARN | AWS → IAM → Roles → Copy ARN |
| `EC2_INSTANCE_ID` | Your EC2 instance ID | AWS EC2 console (i-xxxxx) |

### Step 3: Prepare EC2 Instance

On your EC2 instance, ensure:

```bash
# 1. Docker is installed and running
docker --version
sudo systemctl status docker

# 2. SSM agent is installed and running
systemctl status amazon-ssm-agent

# 3. EC2 instance role has AmazonSSMManagedInstanceCore policy
# (Check in AWS IAM console)

# 4. Security group allows port 5000
# (Check in AWS EC2 console → Security Groups)
```

### Step 4: Push to Main

```bash
git add .
git commit -m "ci: add cicd pipeline"
git push origin main
```

This will trigger the pipeline automatically!

---

## Understanding Each Stage

### Stage 1: Build

**What happens:**
1. Checks out your code
2. Installs Node.js 20
3. Runs `npm ci` (clean install of dependencies)
4. Validates `server.js` syntax with `node -c`
5. Optionally runs `npm run lint` if you have a lint script

**Why this stage:**
- ✅ Catches syntax errors early
- ✅ Ensures dependencies can be installed
- ✅ Tests code style (if lint configured)

**Why `npm ci` instead of `npm install`?**

| npm ci | npm install |
|--------|-------------|
| ✅ Reproducible (exact versions) | ❌ May update versions |
| ✅ Fast in CI (clean slate) | ❌ Slower (compares versions) |
| ✅ Fails if lock file out of sync | ❌ Auto-fixes lock file |
| ✅ Recommended for CI/CD | ⚠️ Recommended for local dev |

**Success means:**
- ✅ All dependencies installed
- ✅ No syntax errors
- ✅ Code passes linting (if configured)

**Duration:** ~1-2 minutes

---

### Stage 2: Test

**What happens:**
1. Checks out code
2. Installs dependencies
3. Runs `npm test --if-present`
4. Generates coverage reports

**Why this stage:**
- ✅ Ensures code works as expected
- ✅ Catches regressions early
- ✅ Maintains test coverage standards

**Important:**
- This only runs if you have tests
- Stage uses `--if-present` so it doesn't fail if no tests yet
- Once you add tests, they'll automatically run here

**Success means:**
- ✅ All tests pass
- ✅ Coverage >= 80% (configurable)
- ✅ No timeouts or failures

**Duration:** ~1-3 minutes (if tests exist)

---

### Stage 3: Security

**What happens:**
1. Installs dependencies
2. Runs `npm audit --audit-level=moderate`
3. Runs CodeQL analysis

**Why this stage:**
- ✅ Finds known vulnerabilities in dependencies
- ✅ Scans code for security patterns
- ✅ Prevents deploying vulnerable code

### npm audit Explained

**What it does:**  
Scans your `package.json` against a database of known vulnerabilities.

**How it works:**
```bash
npm audit
```

Output example:
```
found 2 vulnerabilities (0 moderate, 2 high)

┌──────────────────────────────────────────────────────────┐
│ High        │ Denial of Service in lodash                 │
│ Package     │ lodash                                       │
│ Dependency  │ express > lodash                             │
│ More info   │ https://npmjs.com/advisories/1234           │
└──────────────────────────────────────────────────────────┘
```

**Severity levels:**
- 🔴 **Critical** - Exploit ready, deploy immediately
- 🟠 **High** - Serious vulnerability, fix soon
- 🟡 **Moderate** - Medium risk, plan to fix
- 🟢 **Low** - Low risk, document and monitor

**Why we use `--audit-level=moderate`:**
- Only shows Moderate and above (not noisy)
- `|| true` means: report results but don't fail
- Important: doesn't block deploy (for visibility), but you should fix them

**Fix vulnerabilities:**
```bash
npm audit fix              # Auto-fix if possible
npm audit fix --force      # Force major version updates (risky!)
```

### CodeQL Explained

**What it does:**  
Deep code analysis looking for security patterns and bugs.

**What it finds:**
- ❌ SQL injection possibilities
- ❌ Cross-site scripting (XSS)
- ❌ Command injection
- ❌ Hardcoded credentials
- ❌ Unsafe use of dangerous functions

**Why CodeQL vs npm audit:**
| npm audit | CodeQL |
|-----------|--------|
| Checks dependency vulnerabilities | Checks your code |
| Fast (30 seconds) | Slow (3-5 minutes) |
| Database of known issues | Analyzes code patterns |
| Can't detect custom code issues | Finds subtle bugs |

**Success means:**
- ✅ No critical/high vulnerabilities
- ✅ All scans complete
- ✅ Results visible in GitHub Security tab

**Duration:** ~4-7 minutes total

---

### Stage 4: Docker Build & Push

**What happens:**
1. Checks out code
2. Extracts Docker metadata (tags, labels)
3. Logs into Docker Hub
4. Sets up Docker Buildx (enhanced builder)
5. Builds Docker image for main branch
6. Pushes image to Docker Hub
7. Scans image with Trivy (looks for vulnerabilities in OS/packages)

**Why Docker?**
- ✅ Packages app + dependencies in one unit
- ✅ Same image runs everywhere (local → prod)
- ✅ Easy to deploy and rollback
- ✅ Isolates app from host OS

**Docker tags created:**
For a push to `main`:
```
yourusername/node-ci-demo:latest          ← Latest build
yourusername/node-ci-demo:main            ← Branch tag
yourusername/node-ci-demo:main-abc123d    ← Commit tag
```

**Why multiple tags?**
- `latest` → Easy reference to newest
- `main` → Identifies which branch
- `main-abc123d` → Specific commit for rollback

**Multi-stage Docker build:**

Your Dockerfile has 2 stages:

```dockerfile
# Stage 1: Builder (temporary)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production  ← Only production deps
# Generate node_modules

# Stage 2: Production (final image)
FROM node:20-alpine
COPY --from=builder /app/node_modules ./  ← Copy from builder
COPY server.js .
CMD ["node", "server.js"]
```

**Why 2 stages?**
- ✅ Smaller final image (no dev dependencies)
- ✅ Faster builds (reuse cache)
- ✅ No build tools in production (safer)
- ✅ Smaller attack surface

**Trivy scan:**
Scans Docker image for vulnerabilities in:
- OS packages (Alpine packages)
- Application dependencies
- Misconfigurations

**Success means:**
- ✅ Image builds successfully
- ✅ Image pushed to Docker Hub
- ✅ Trivy scan completes
- ✅ No critical vulnerabilities

**Duration:** ~4-6 minutes first time, ~2-3 minutes cached

---

### Stage 5: Deploy

**What happens:**
1. Authenticates with AWS using OIDC (no keys needed!)
2. Saves current running image name (for rollback)
3. Pulls latest image from Docker Hub to EC2
4. Stops and removes old container
5. Starts new container
6. If new container fails → Restores old container

**Why OIDC instead of AWS keys?**

| OIDC | AWS Keys |
|------|----------|
| ✅ No static credentials | ❌ Credentials in GitHub |
| ✅ GitHub validates identity | ❌ If key leaked, full access |
| ✅ Expires automatically | ❌ Must rotate manually |
| ✅ Tied to specific repo | ❌ Works on all repos |

**Rollback mechanism:**

```bash
# Step 1: Capture current image
CURRENT_IMAGE=$(docker inspect -f '{{.Image}}' node-ci-demo)

# Step 2: Try new deployment
docker run -d -p 5000:5000 yourusername/node-ci-demo:latest

# Step 3: If new fails
if [deployment failed]; then
  docker run -d -p 5000:5000 $CURRENT_IMAGE
  exit 1  # Fail workflow
fi
```

**Success means:**
- ✅ Image pulled successfully
- ✅ New container starts without errors
- ✅ Container listens on port 5000
- ✅ Workflow shows success

**Duration:** ~1-2 minutes

**What's running after deploy:**
```bash
# On EC2:
docker ps
# OUTPUT:
node-ci-demo   yourusername/node-ci-demo:latest   Running
```

---

## Security Checks Explained

### Why So Many Security Checks?

**Defense in Depth** = Multiple layers of security

```
Layer 1: Dependency scanning (npm audit)
         ↓ Finds known vulnerabilities in packages
Layer 2: Code scanning (CodeQL)
         ↓ Finds security patterns in your code
Layer 3: Container scanning (Trivy)
         ↓ Finds vulnerabilities in Docker image
Layer 4: Deployment verification
         ↓ Ensures deployment succeeded
```

### Comparison: Security Tools

| Tool | What | When | Speed | Cost |
|------|------|------|-------|------|
| npm audit | Dependency CVEs | Every build | 30s | Free |
| CodeQL | Code patterns | Every build | 5min | Free (public) |
| Trivy | Container/image | Docker builds | 1min | Free |
| Snyk | Dependency + code | On demand | 2min | Freemium |

**Why not Snyk?**
- Requires API token
- Might be overkill for learning
- npm audit + CodeQL cover basics
- Can add later if needed

### Which Vulnerabilities Get Blocked?

Your pipeline:
- ℹ️ Reports all findings
- ⚠️ Doesn't block Moderate/Low
- 🚫 SHOULD block High/Critical (but can configure)

**To make it stricter:**
Edit `ci-cd-pipeline.yml`:
```yaml
- name: Run npm audit
  run: npm audit --audit-level=high  # Only High/Critical
```

---

## Deployment Process

### What Happens When You Push to Main

```
1. You: git push origin main
                ↓
2. GitHub: Detects push to main
                ↓
3. GitHub Actions: Triggers ci-cd-pipeline.yml
                ↓
4. Build job: npm ci, syntax check
                ↓
5. Test job: npm test (if exists)
                ↓
6. Security job: npm audit + CodeQL
                ↓
7. Docker job: Build image, push to Docker Hub
                ↓
8. Deploy job: OIDC auth → SSM command → EC2 pulls & runs
                ↓
9. Success: Container running on EC2
   OR
   Rollback: Previous container restored
```

### Access Your App After Deploy

```bash
# From your terminal
curl http://<your-ec2-ip>:5000/

# Should return:
"Node CI demo is running."
```

### View Logs During Deploy

In GitHub:
1. Go to **Actions** tab
2. Click latest workflow run
3. Click **Deploy** job
4. See real-time logs

---

## Troubleshooting

### Build Fails: "package-lock.json not found"

**Why:**
`npm ci` requires `package-lock.json` to be committed.

**Fix:**
```bash
cd week1-cicd
npm install  # Generates package-lock.json
git add package-lock.json
git commit -m "chore: add package-lock.json"
git push
```

---

### Docker Push Fails: "denied: requested access"

**Why:**
Docker Hub credentials incorrect.

**Fix:**
1. Go to Docker Hub → Account Settings → Security
2. Create new **access token** (not password!)
3. Update GitHub secret `DOCKERHUB_TOKEN`
4. Retry

---

### Deploy Fails: SSM command returns error

**Why:**
EC2 instance not set up correctly.

**Check:**
```bash
# On your EC2 instance
systemctl status amazon-ssm-agent

# Should show "active (running)"

# If not running:
sudo systemctl start amazon-ssm-agent
```

---

### Deploy Fails: "docker: command not found"

**Why:**
Docker not installed on EC2.

**Fix:**
```bash
# On your EC2 instance
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user
```

---

### Workflow Doesn't Trigger

**Why:**
Workflow file not in correct location.

**Check:**
- ✅ Is file in `.github/workflows/`?
- ✅ Is filename exactly `ci-cd-pipeline.yml`?
- ✅ Did you push to `main` branch?

---

## Quick Reference

### Environment Variables (What the pipeline knows)

```yaml
NODE_VERSION: "20"        # Node.js version to use
APP_DIR: "week1-cicd"     # Where your app code is
IMAGE_NAME: username/nodeci-demo  # Docker image name
CONTAINER_NAME: node-ci-demo  # Container name on EC2
APP_PORT: "5000"          # Port to expose
AWS_REGION: "ap-south-1"  # AWS region
EC2_INSTANCE_ID: "i-xxx"  # Your EC2 instance
```

### Secrets (What you must add)

```
DOCKERHUB_USERNAME       # Your Docker Hub username
DOCKERHUB_TOKEN          # Docker Hub access token
AWS_ROLE_ARN             # IAM role ARN for OIDC
EC2_INSTANCE_ID          # EC2 instance ID
```

### Useful GitHub Actions URLs

```
# View your workflows
https://github.com/YOUR_USERNAME/devops-portfolio/actions

# View specific workflow run
https://github.com/YOUR_USERNAME/devops-portfolio/actions/runs/WORKFLOW_RUN_ID

# View security findings
https://github.com/YOUR_USERNAME/devops-portfolio/security/code-scanning
```

---

## Summary (5 W's)

### Who?
Developers pushing code to GitHub

### What?
A pipeline that automatically builds, tests, secures, containerizes, and deploys Node.js app

### When?
- Push to main → Full pipeline (Build→Deploy)
- Push to develop/PR → Limited pipeline (Build→Security)
- Scheduled → Weekly dependency scan

### Where?
- Workflows in `.github/workflows/` (repo root)
- App code in `week1-cicd/`
- Docker image on Docker Hub
- Running app on EC2 instance

### Why?
- Automation = faster, safer, consistent deployments
- Security checks = catch vulnerabilities early
- Docker = portable, reproducible containers
- OIDC = secure, keyless AWS authentication
- Rollback = safe deployments with auto-recovery

---

**Next Step:** Push a test commit to main and watch the pipeline run!

```bash
git add .
git commit -m "docs: add cicd documentation"
git push origin main
```

Then check: **GitHub → Actions tab → Watch it go!** 🚀
