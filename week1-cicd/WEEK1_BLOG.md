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

## 9) Resources and Guides

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