# Week 1 Blog: Building a Production CI/CD Pipeline (Node + Docker + AWS)

This blog walks through the complete Week 1 project: a real CI/CD pipeline that builds, tests, scans, containerizes, and deploys a Node.js API to AWS EC2 using GitHub Actions, OIDC, and SSM. It is written as a step-by-step guide you can follow end to end.

---

## 1) Project Overview

**Goal:** Build a production-grade CI/CD pipeline for a Node.js app and deploy it to AWS EC2 with security and rollback built in.

**What you get:**
- Node.js REST + GraphQL API with a simple UI
- Multi-stage Docker image (small, secure)
- GitHub Actions pipeline with 5 stages (Build, Test, Security, Docker, Deploy)
- AWS OIDC authentication (no static keys)
- SSM-based deployment (no SSH)
- Rollback logic on deployment failure
- Documentation of all encountered errors

**Repo link:**
https://github.com/Push1697/devops-portfolio/tree/main/week1-cicd

---

## 2) Architecture at a Glance

**Pipeline Flow:**
1. Push to `main`
2. Build + Test + Security scans
3. Build and push Docker image to Docker Hub
4. Deploy to EC2 via SSM Run Command
5. Rollback if deployment fails

**Security layers:**
- `npm audit` for dependency vulnerabilities
- CodeQL for code analysis
- Trivy for container image scanning

---

## 3) Project Setup (App + Docker)

### App Structure
The app is a simple Node.js API with GraphQL and REST endpoints. It includes a search UI to fetch user data from a mock JSON file.

Key files:
- `server.js`: Express server, GraphQL schema, REST routes
- `MOCK_DATA.json`: mock user records
- `package.json`: scripts and dependencies

### Docker Build (Multi-Stage)
We use a **multi-stage Dockerfile** to reduce size and improve security.

- **Stage 1 (builder):** installs dependencies with `npm ci`
- **Stage 2 (runtime):** copies only built files + node_modules

This shrinks the image and avoids shipping build tools into production.

---

## 4) CI/CD Pipeline Explained (Stage by Stage)

The pipeline is defined in:
`.github/workflows/ci-cd-pipeline.yml`

### Stage 1: Build
- Checks out code
- Sets Node.js version
- Installs dependencies
- Validates the server entry file

**Why:** Build failures are cheap. Catch them early.

### Stage 2: Test
- Runs `npm test --if-present`

**Why:** Even if tests are not present yet, the pipeline is ready for them.

### Stage 3: Security
- Runs `npm audit`
- Runs CodeQL

**Why:** This catches vulnerable dependencies and insecure code patterns.

### Stage 4: Docker
- Builds the Docker image
- Pushes to Docker Hub
- Scans the image with Trivy

**Why:** We do not deploy images with known vulnerabilities.

### Stage 5: Deploy
- Authenticates with AWS using OIDC
- Sends SSM command to EC2
- Pulls latest image and starts container
- Rolls back if deployment fails

**Why:** This is production-grade. No SSH keys, no manual steps, no downtime.

---

## 5) Security & Governance in This Repo

We treat the repository as production infrastructure.

### Branch Protection
- Require PR before merging
- Require passing checks
- Require review approval
- Restrict who can push

### Secrets Management
- All credentials stored in GitHub Secrets
- No credentials in code
- OIDC used for AWS authentication

### Scanning
- `npm audit` (dependencies)
- CodeQL (code analysis)
- Trivy (container image)

### Notifications (Optional)
Slack webhook step can be added to alert on failures.

---

## 6) Deployment Details (AWS EC2 + SSM)

Instead of SSH, we deploy using **SSM Run Command**:

- No SSH keys
- Fully auditable logs
- Works well with GitHub Actions

The EC2 instance must:
- Have SSM agent installed
- Have IAM role with `AmazonSSMManagedInstanceCore`
- Be running and online

---

## 7) Real Errors We Faced (and Fixed)

This project documented real CI/CD errors and fixes, including:
- Docker tag invalid reference format
- Wrong secret names
- SSM command quoting errors
- IAM permission issues
- EC2 missing IAM role

All issues and fixes are logged in:
- `week1-cicd/README.md`

---

## 8) Screenshots and Snapshots

**Pipeline Run:**
![Pipeline Run](assets/Screenshot%20from%202026-02-13%2009-09-55.png)

**SSM / Deployment Logs:**
![SSM Deployment](assets/Screenshot%20from%202026-02-12%2010-59-49.png)

**GitHub Actions Job View:**
![Actions Jobs](assets/Screenshot%20from%202026-02-12%2008-26-43.png)

**Docker Build and Push:**
![Docker Build](assets/Screenshot%20from%202026-02-12%2008-26-17.png)

---

## 9) Beginner Guide: Secrets, Docker Hub Token, and CI/CD File Walkthrough

This section is written for complete beginners. Follow the steps in order.

### Step 1: Create a Docker Hub access token

You must use a **token**, not your Docker Hub password.

1. Log in to Docker Hub: https://hub.docker.com
2. Go to **Account Settings** → **Security**
3. Click **New Access Token**
4. Name it: `github-actions-devops-portfolio`
5. Copy the token once (you will not see it again)

This token will be stored in GitHub Secrets.

### Step 2: Add GitHub repository secrets

Go to:
```
GitHub repo → Settings → Secrets and variables → Actions → New repository secret
```

Add these **four required secrets**:

```
DOCKERHUB_USERNAME  = your Docker Hub username
DOCKERHUB_TOKEN     = token you created in Step 1
AWS_ROLE_ARN        = IAM role ARN for GitHub OIDC
EC2_INSTANCE_ID     = EC2 instance id (i-xxxxxxxx)
```

Why secrets?
- GitHub encrypts them
- They never appear in logs
- They keep credentials out of code

### Step 3: Read the CI/CD file like a beginner (line by line)

File location:
`.github/workflows/ci-cd-pipeline.yml`

Below is a human-friendly walkthrough of **every key section and keyword**.

#### A) Workflow metadata

```yaml
name: week-1 CI-CD Pipeline
```
- `name`: The label shown in GitHub Actions UI.

```yaml
on:
  push:
    branches: ["main", "develop"]
  pull_request:
    branches: ["main"]
  workflow_dispatch:
```
- `on`: When the workflow runs.
- `push`: Run on pushes to `main` and `develop`.
- `pull_request`: Run on PRs targeting `main`.
- `workflow_dispatch`: Allow manual runs.

```yaml
permissions:
  contents: read
  id-token: write
  security-events: write
```
- `contents: read`: Allows checkout of repo code.
- `id-token: write`: Required for AWS OIDC authentication.
- `security-events: write`: Required to upload CodeQL and Trivy results.

```yaml
env:
  NODE_VERSION: "20"
  APP_DIR: "week1-cicd"
  IMAGE_NAME: ${{ secrets.DOCKERHUB_USERNAME }}/node-ci-demo
  CONTAINER_NAME: "node-ci-demo"
  APP_PORT: "5000"
  AWS_REGION: "ap-south-1"
  AWS_ROLE_ARN: ${{ secrets.AWS_ROLE_ARN }}
  EC2_INSTANCE_ID: ${{ secrets.EC2_INSTANCE_ID }}
```
- `env`: Global variables shared across jobs.
- `IMAGE_NAME`: Uses your Docker Hub username secret.
- `AWS_ROLE_ARN` and `EC2_INSTANCE_ID`: Pulled from GitHub Secrets.

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```
- `concurrency`: Avoids overlapping runs.
- `cancel-in-progress`: If you push again quickly, old runs are canceled.

#### B) Jobs overview

```yaml
jobs:
  build:
  test:
  security:
  docker:
  deploy:
```
- `jobs`: Each job runs on a fresh VM.
- Jobs can run in parallel or in order depending on `needs`.

#### C) Build job (compiles and validates)

```yaml
build:
  runs-on: ubuntu-latest
```
- `runs-on`: OS of the runner VM.

```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v4
```
- `steps`: Ordered list of actions/commands.
- `uses`: Runs a prebuilt GitHub Action.

```yaml
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: ${{ env.NODE_VERSION }}
      cache: npm
      cache-dependency-path: ${{ env.APP_DIR }}/package-lock.json
```
- `with`: Inputs passed to the action.
- `cache: npm`: Speeds up install using dependency cache.

```yaml
  - name: Install dependencies
    run: npm ci
    working-directory: ${{ env.APP_DIR }}
```
- `run`: Executes shell command.
- `working-directory`: Run inside `week1-cicd` folder.
- `npm ci`: Clean, reproducible install for CI.

```yaml
  - name: Validate server entry
    run: node -c server.js
```
- `node -c`: Checks syntax only, does not execute.

#### D) Test job (runs tests)

```yaml
test:
  needs: build
```
- `needs`: Run only after build finishes successfully.

```yaml
  - name: Run tests (if configured)
    run: npm test --if-present
```
- `--if-present`: No failure if `test` script is missing.

#### E) Security job (dependency + code scanning)

```yaml
security:
  needs: build
```

```yaml
  - name: Run npm audit
    run: npm audit --audit-level=moderate || true
```
- `npm audit`: Finds known CVEs in dependencies.
- `|| true`: Does not fail the job, but still logs results.

```yaml
  - name: CodeQL init
    uses: github/codeql-action/init@v3
  - name: CodeQL analyze
    uses: github/codeql-action/analyze@v3
```
- CodeQL scans code for security issues and uploads results.

#### F) Docker job (build, push, scan)

```yaml
docker:
  needs: [test, security]
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```
- Runs only on **push to main**.
- `if`: Conditional execution.

```yaml
  - name: Extract Docker metadata
    id: meta
    uses: docker/metadata-action@v5
```
- `id`: Makes outputs available as `steps.meta.outputs.*`.
- Adds tags like branch name and commit SHA.

```yaml
  - name: Log in to Docker Hub
    uses: docker/login-action@v3
    with:
      username: ${{ secrets.DOCKERHUB_USERNAME }}
      password: ${{ secrets.DOCKERHUB_TOKEN }}
```
- Uses GitHub Secrets to authenticate securely.

```yaml
  - name: Build and push
    uses: docker/build-push-action@v6
    with:
      context: ${{ env.APP_DIR }}
      file: ${{ env.APP_DIR }}/Dockerfile
      push: true
      tags: ${{ steps.meta.outputs.tags }}
```
- Builds and pushes the image to Docker Hub.

```yaml
  - name: Trivy scan (optional)
    uses: aquasecurity/trivy-action@master
    continue-on-error: true
    with:
      image-ref: ${{ env.IMAGE_NAME }}:latest
```
- `continue-on-error`: Do not fail the pipeline if Trivy finds issues.

#### G) Deploy job (OIDC + SSM)

```yaml
deploy:
  needs: docker
```

```yaml
  - name: Configure AWS credentials (OIDC)
    uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: ${{ env.AWS_ROLE_ARN }}
      aws-region: ${{ env.AWS_REGION }}
```
- Uses OIDC to request short-lived AWS credentials.
- No static AWS keys required.

```yaml
  - name: Deploy via SSM Run Command
    run: |
      aws ssm send-command ...
```
- SSM runs commands on EC2 without SSH.
- Commands pull the new image and run the container.
- If it fails, the previous image is restored.

### Visual references

- Pipeline run UI: `Screenshot from 2026-02-13 09-09-55.png`
- SSM deployment logs: `Screenshot from 2026-02-12 10-59-49.png`
- GitHub Actions jobs: `Screenshot from 2026-02-12 08-26-43.png`
- Docker build + push: `Screenshot from 2026-02-12 08-26-17.png`

---

## 10) Resources and Guides

- **Full Week 1 project:**
  https://github.com/Push1697/devops-portfolio/tree/main/week1-cicd

- **CI/CD pipeline guide:**
  https://github.com/Push1697/devops-portfolio/blob/main/week1-cicd/CICD_PIPELINE_GUIDE.md

- **Setup instructions:**
  https://github.com/Push1697/devops-portfolio/blob/main/week1-cicd/SETUP_INSTRUCTIONS.md

---

## 10) Key Takeaways

- Security must be layered, not optional
- OIDC beats static credentials
- Deployment automation requires rollback logic
- Documentation of real failures is a superpower

---

## Next Steps (Week 2)

Week 2 moves into Infrastructure as Code (Terraform) and GitOps with ArgoCD. The goal is to build infrastructure without clicking the AWS console.

---

If you want a checklist or want to reuse this pipeline, open an issue or fork the repo.