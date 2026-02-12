# 🚀 30-Day DevOps Intensive Challenge

> **Building production-grade DevOps infrastructure from scratch.** A hands-on journey from CI/CD pipelines to Kubernetes to job-ready portfolio projects.

![Status](https://img.shields.io/badge/Status-In%20Progress-blue?style=flat-square)
![Week](https://img.shields.io/badge/Current%20Week-1%2F4-brightgreen?style=flat-square)
![Days](https://img.shields.io/badge/Days%20Completed-5%2F30-orange?style=flat-square)
[![GitHub](https://img.shields.io/badge/GitHub-devops--portfolio-black?style=flat-square&logo=github)](https://github.com/Push1697/devops-portfolio)

---

## 📋 Table of Contents

1. [Challenge Overview](#challenge-overview)
2. [Tech Stack](#tech-stack)
3. [30-Day Calendar](#30-day-calendar)
4. [Week 1: CI/CD Pipeline Mastery](#week-1-cicd-pipeline-mastery)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
7. [Learning Resources](#learning-resources)
8. [LinkedIn & GitHub Strategy](#linkedin--github-strategy)

---

## Challenge Overview

**Who:** Windows SysAdmin (AWS CCP certified) transitioning to DevOps  
**What:** 30-day hands-on intensive with daily deep work (6-9 AM) + evening documentation (9:30-11 PM)  
**Why:** Build production-grade projects that demonstrate DevOps expertise in job interviews  
**How:** Learn in public, document everything, ship working code weekly

### Core Philosophy
- **No Theory-Only Days:** Every morning has a shipped artifact
- **Day 1 = Deployed:** By end of Week 1, app is running on AWS EC2 with full CI/CD
- **Portfolio Over Resume:** Projects speak louder than certifications
- **Public Learning:** Weekly LinkedIn posts documenting wins & failures

---

## Tech Stack

### Week 1: CI/CD Foundation
- **Language:** Node.js v20
- **Framework:** Express.js, GraphQL, REST
- **Containerization:** Docker (multi-stage builds)
- **CI/CD:** GitHub Actions (Build → Test → Security → Docker → Deploy)
- **Container Registry:** Docker Hub
- **Cloud:** AWS (EC2, IAM, OIDC, SSM)
- **Security:** npm audit, CodeQL, Trivy container scanning

### Full 30-Day Stack (Preview)
| Week | Focus | Tech |
|------|-------|------|
| **1** | CI/CD Pipelines | GitHub Actions, Docker, AWS EC2 |
| **2** | Infrastructure as Code | Terraform, AWS VPC, ArgoCD, Helm |
| **3** | Kubernetes Production | K8s, Istio, Prometheus/Grafana, EFK logging |
| **4** | Capstone + Job Prep | Multi-cluster ArgoCD, Chaos Engineering, interviews |

---

## 30-Day Calendar

### **Week 1: CI/CD Pipeline Mastery** ✅ IN PROGRESS
*Build production-grade pipelines you can demo in interviews*

| Day | Focus | Status | Deliverables |
|-----|-------|--------|--------------|
| **1 (Mon)** | GitOps Foundation | ✅ Complete | GitHub repo initialized, 3-folder structure, LinkedIn post |
| **2 (Tue)** | GitHub Actions Deep Dive | ✅ Complete | Multi-stage pipeline (5 jobs), branch protection, Docker Hub integration |
| **3 (Wed)** | Docker Security Scanning | ✅ Complete | Trivy + CodeQL integration, vulnerability fixes documented |
| **4 (Thu)** | Multi-Environment Deployments | ✅ Complete | AWS EC2 deployment via SSM, OIDC authentication, rollback logic |
| **5 (Fri)** | Jenkins Pipeline & Documentation | ✅ Complete | 3 comprehensive guides (CICD_PIPELINE_GUIDE, SETUP_INSTRUCTIONS, README) |

### **Week 2: Infrastructure as Code + GitOps** ⏳ UPCOMING
*Automate everything, never click AWS console again*

| Day | Focus | Deliverables |
|-----|-------|--------------|
| **6 (Mon)** | Terraform Basics | VPC, Subnets, Security Groups, EC2, RDS |
| **7 (Tue)** | Terraform State Management | S3 backend, DynamoDB locking, documentation |
| **8 (Wed)** | GitOps with ArgoCD | ArgoCD on minikube, auto-sync, health checks |
| **9 (Thu)** | Helm Charts | Parameterized chart for multi-environment |
| **10 (Fri)** | Monitoring Setup | Prometheus + Grafana on K8s |

### **Week 3: Kubernetes Production Patterns** ⏳ UPCOMING
*Run workloads like Netflix does*

| Day | Focus | Deliverables |
|-----|-------|--------------|
| **11-15** | Secrets, Auto-scaling, Service Mesh, Logging, DR | Complete observability & resilience setup |

### **Week 4: Capstone + Job Prep** ⏳ UPCOMING
| Day | Focus | Deliverables |
|-----|-------|--------------|
| **16-20** | Multi-Cluster, Security, Cost Optimization, Canary, Chaos | Advanced patterns & resilience testing |
| **21-25** | Capstone: E-Commerce Microservices | 3 services, full CI/CD, monitoring, GitOps |
| **26-30** | Job Applications & Resume Blitz | 10+ applications, mock interviews, LinkedIn article |

---

## Week 1: CI/CD Pipeline Mastery

### 📌 Week 1 Summary

**Goal:** Build a production-grade CI/CD pipeline that automatically tests, scans, builds, and deploys a Node.js app to AWS EC2.

**What Was Built:**
1. **Node.js GraphQL/REST API** - Multi-protocol server with user search functionality
2. **Docker Container** - Multi-stage build optimized for minimal image size (~150MB)
3. **GitHub Actions Workflow** - 5-stage pipeline (Build → Test → Security → Docker → Deploy)
4. **AWS Infrastructure** - EC2 instance, OIDC authentication, SSM deployment
5. **Security Scanning** - npm audit, CodeQL, Trivy vulnerability scanning
6. **Comprehensive Documentation** - 3 guides covering pipeline, setup, and troubleshooting

**Key Achievements:**
- ✅ App running on AWS EC2 (port 5000) with CI/CD automation
- ✅ Secure OIDC authentication (no SSH keys stored)
- ✅ Automatic rollback on deployment failure
- ✅ 10 error scenarios documented with solutions
- ✅ Production-grade security scanning integrated

### 📂 Week 1 Folder Structure

```
week1-cicd/
├── server.js                    # Express HTTP server with GraphQL + REST
├── MOCK_DATA.json               # Sample user data
├── package.json                 # Node.js dependencies & scripts
├── package-lock.json            # Locked dependency versions
├── Dockerfile                   # Multi-stage Docker build
├── .dockerignore                # Docker image optimization
├── README.md                    # Quick start & troubleshooting (12 sections)
├── CICD_PIPELINE_GUIDE.md      # Deep technical dive (850+ lines)
└── SETUP_INSTRUCTIONS.md        # Step-by-step setup guide (450+ lines)
```

### 🎯 Week 1 Learning Outcomes

**What You'll Understand:**
1. **GitHub Actions workflows** - Jobs, steps, conditionals, environment variables
2. **Docker multi-stage builds** - Why they reduce image size by 10x
3. **Security scanning** - npm audit vs CodeQL vs Trivy vs Snyk comparison
4. **AWS OIDC** - Keyless authentication for GitHub Actions
5. **SSM deployment** - Agentless infrastructure management via AWS
6. **Automated rollback** - Disaster recovery in CI/CD

**Key Decisions Documented:**
- Why `npm ci` instead of `npm install` in CI
- Why OIDC instead of static AWS credentials
- Why distroless images for production
- Why multi-stage builds for smallest image
- Why CodeQL for free code analysis

### 🚀 Quick Start (Week 1)

**Prerequisites:**
- Docker installed locally
- AWS account (free tier eligible)
- GitHub account with repo access

**1. Clone & Navigate:**
```bash
cd week1-cicd
```

**2. Run Locally:**
```bash
npm install
npm start
# Visit http://localhost:5000
```

**3. Build Docker Image:**
```bash
docker build -t node-ci-demo:latest .
docker run -p 5000:5000 node-ci-demo:latest
```

**4. Deploy to AWS (see [week1-cicd/SETUP_INSTRUCTIONS.md](week1-cicd/SETUP_INSTRUCTIONS.md) for full guide)**

### 📊 Week 1 Error Journey

During development, we encountered and fixed **10 errors**:

| # | Error | Root Cause | Solution |
|---|-------|-----------|----------|
| 1 | Dockerfile line continuation | Comment after backslash | Removed inline comment |
| 2 | Snyk syntax error | Double `${{ }}` wrapping | Removed Snyk (optional) |
| 3 | Docker login fails | Wrong secret name | Changed `DOCKER_SECRET_KEY` → `DOCKERHUB_TOKEN` |
| 4 | CodeQL deprecation | Using old action version | Updated to v3 |
| 5 | Invalid Docker tag format | Missing username in tag | Fixed IMAGE_NAME secret ref |
| 6 | SSM syntax error | Escaped quotes in JSON | Removed `\'` escaping |
| 7 | AccessDenied on SendCommand | Wrong document ARN | Used `*` for AWS-managed docs |
| 8 | InvalidInstanceId | Missing IAM role on EC2 | Attached instance role |
| 9 | **[Pending]** | **[Awaiting deployment]** | **[Will document after run]** |
| 10 | **[Pending]** | **[Awaiting deployment]** | **[Will document after run]** |

See [week1-cicd/README.md](week1-cicd/README.md#x-common-errors--troubleshooting) for detailed solutions.

### 🔒 Security Achievements

✅ **No secrets stored in repo** - All in GitHub encrypted secrets  
✅ **No SSH keys** - OIDC with automatic token expiry  
✅ **No hardcoded credentials** - AWS role-based authentication  
✅ **Container scanning enabled** - Trivy scans every image  
✅ **Code analysis enabled** - CodeQL finds vulnerabilities  
✅ **Dependency auditing** - npm audit on every build  

### 📚 Week 1 Documentation

| Document | Purpose | Length |
|----------|---------|--------|
| [week1-cicd/README.md](week1-cicd/README.md) | Setup, errors, troubleshooting | 12 sections, 600+ lines |
| [week1-cicd/CICD_PIPELINE_GUIDE.md](week1-cicd/CICD_PIPELINE_GUIDE.md) | Technical deep dive with 5 W's | 850+ lines |
| [week1-cicd/SETUP_INSTRUCTIONS.md](week1-cicd/SETUP_INSTRUCTIONS.md) | Step-by-step practical guide | 450+ lines |

**Documentation Approach:**
- Uses **5 W's framework** (Who, What, When, Where, Why)
- Explains **trade-offs** (why tool X over tool Y)
- Includes **error scenarios** (what went wrong & how we fixed)
- **Beginner-friendly** with no assumed knowledge

### 📈 Week 1 Metrics

- **Lines of Code:** 250+ (server.js, Dockerfile, workflows)
- **Documentation:** 1,900+ lines across 3 guides
- **GitHub Actions Jobs:** 5 (Build, Test, Security, Docker, Deploy)
- **AWS Services Used:** EC2, IAM, OIDC, SSM, SecurityGroups
- **Security Scans:** 3 (npm audit, CodeQL, Trivy)
- **Error Scenarios Documented:** 10
- **Time Invested:** ~15 hours spread over 5 days

---

## Project Structure

```
devops-portfolio/
├── README.md                           # This file
├── .github/workflows/
│   ├── ci-cd-pipeline.yml             # Main Week 1 pipeline (189 lines)
│   ├── pr-validation.yml               # PR quality checks
│   └── dependency-scan.yml             # Weekly security scan
├── week1-cicd/                         # ✅ COMPLETE
│   ├── server.js
│   ├── MOCK_DATA.json
│   ├── package.json
│   ├── package-lock.json
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── README.md
│   ├── CICD_PIPELINE_GUIDE.md
│   └── SETUP_INSTRUCTIONS.md
├── week2-infrastructure/               # ⏳ Starting Day 6
│   ├── terraform/
│   ├── kubernetes/
│   └── README.md
├── week3-kubernetes/                   # ⏳ Starting Day 11
│   ├── manifests/
│   ├── helm-charts/
│   └── README.md
└── week4-capstone/                     # ⏳ Starting Day 21
    ├── microservices/
    ├── infrastructure/
    └── README.md
```

---

## Getting Started

### Prerequisites
- **OS:** Linux or macOS (Windows WSL2 supported)
- **Tools:** Git, Docker, Node.js v20+, AWS CLI v2
- **Accounts:** GitHub, Docker Hub, AWS (free tier)
- **Knowledge:** Basic Linux commands, Docker basics, AWS navigation

### Initial Setup (Day 1)

**1. Clone this repo:**
```bash
git clone https://github.com/Push1697/devops-portfolio.git
cd devops-portfolio
```

**2. Start with Week 1:**
```bash
cd week1-cicd
cat README.md                # Read the quick start
cat SETUP_INSTRUCTIONS.md    # Follow step-by-step setup
```

**3. Set up GitHub Secrets:**
Required secrets in GitHub → Settings → Secrets and variables → Actions:
```
DOCKERHUB_USERNAME          # Your Docker Hub username
DOCKERHUB_TOKEN             # Docker Hub personal access token
AWS_ROLE_ARN                # IAM role ARN for OIDC
EC2_INSTANCE_ID             # EC2 instance ID (i-xxx)
```

See [week1-cicd/SETUP_INSTRUCTIONS.md](week1-cicd/SETUP_INSTRUCTIONS.md) for detailed steps.

---

## Learning Resources

### Recommended Courses (Referenced in Schedule)
- **KodeKloud:** GitOps with ArgoCD, Jenkins Declarative Pipeline
- **TryHackMe:** Intro to Defensive Security (DevSecOps path)
- **Pramp.com:** DevOps system design mock interviews

### Week 1 Specific Resources
- [GitHub Actions Docs](https://docs.github.com/en/actions/quickstart)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [AWS SSM Documentation](https://docs.aws.amazon.com/systems-manager/)
- [OIDC with GitHub Actions](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments)

### Tools & Documentation
| Tool | Purpose | Link |
|------|---------|------|
| Docker | Containerization | https://docs.docker.com |
| GitHub Actions | CI/CD | https://docs.github.com/actions |
| AWS | Cloud infrastructure | https://aws.amazon.com/documentation |
| npm audit | Dependency scanning | https://docs.npmjs.com/cli/audit |
| CodeQL | Code analysis | https://codeql.github.com |
| Trivy | Container scanning | https://trivy.dev |

---

## LinkedIn & GitHub Strategy

### 📱 LinkedIn Cadence

**Weekly Posting Schedule:**
- **Monday:** Project kickoff announcement
- **Wednesday:** Mid-week learning (mistakes + wins)
- **Friday:** Weekly wrap-up with GitHub link

**Sample Week 1 Posts:**

**Post 1 (Day 1 - Monday):**
```
🚀 Day 1/30 DevOps Challenge

I'm starting my 30-day DevOps intensive.
→ Today I created GitHub repo structure (3 weeks of projects)
→ Key learning: Proper folder organization = better learning
→ Challenge: Setting up GitHub Actions for the first time

Code: github.com/Push1697/devops-portfolio
Following along? Let's learn together. #DevOps #LearningInPublic
```

**Post 2 (Day 3 - Wednesday):**
```
🔒 Day 3/30 DevOps Challenge

Just integrated Trivy scanner into my CI/CD pipeline.
→ Found 23 vulnerabilities in my first Docker image 😅
→ Key learning: Image scanning is non-negotiable in production
→ Fixed: Updated Node.js base image, removed unnecessary packages

Before: 432 vulnerabilities | After: 0 critical, 2 medium
#DevOps #Security #Docker
```

**Post 3 (Day 5 - Friday):**
```
✅ Week 1 Complete: CI/CD Pipeline Mastery

Built a production-grade pipeline in 5 days:
→ GitHub Actions (5 jobs)
→ Docker multi-stage builds
→ AWS EC2 deployment via OIDC
→ Automatic rollback on failure
→ 3 comprehensive documentation guides

Code + detailed guides: [GitHub link]
Setup took 4 hours. Documenting mistakes took 2 hours.

What's your Week 1 project? #DevOps #AWS
```

### 🐙 GitHub Profile Setup

**Bio:**
```
DevOps Engineer | AWS • Docker • Kubernetes
Building production infrastructure in public. #portfolio
```

**Profile Card (Shields):**
```
[AWS][Docker][Kubernetes][GitHub Actions][Linux][Terraform]
```

**Pinned Repositories:**
1. `devops-portfolio` (Current challenge)
2. `terraform-aws-production` (Starting Week 2)
3. `kubernetes-gitops` (Starting Week 3)

**README Best Practices (Applied Here):**
- ✅ Architecture diagrams for complex projects
- ✅ Quick start in 3 lines of code
- ✅ "Challenges I faced" section
- ✅ Performance/security metrics
- ✅ Links to detailed guides
- ✅ Build status badges

---

## Daily Commitment

### 🌅 Morning Deep Work (6-9 AM)
- Core learning from courses or hands-on labs
- Build new features/infrastructure
- Troubleshoot errors
- **Ship something daily**

### 🌙 Evening Documentation (9:30-11 PM)
- Write README sections
- Document errors & solutions
- Create diagrams
- Commit to GitHub
- (Optional) Write LinkedIn post

### 📋 Daily Checklist
```
☐ Morning deep work (6-9 AM) - New learning + shipped code
☐ Commit to GitHub (before work at 12 PM)
☐ LinkedIn post (Mon/Wed/Fri)
☐ Evening documentation (9:30-11 PM)
☐ Sleep by 11:30 PM (non-negotiable for cognitive performance)
```

### 📊 Weekly Review (Sundays 7-8 PM)
- What went well this week?
- What slowed me down?
- How can next week be better?
- Update LinkedIn profile if needed

---

## Cost Management

### AWS Free Tier Usage (Week 1)
- **EC2:** t2.micro (1 year free, 750 hours/month)
- **Security Groups:** Free
- **IAM:** Free
- **OIDC:** Free
- **Total Cost:** ~$0 (within free tier)

### Pro Tips
- **Destroy resources after demos:** `terraform destroy` before logging off
- **Use spot instances:** Up to 70% cheaper for non-critical workloads
- **Monitor costs weekly:** CloudWatch billing alerts
- **Max budget:** $20/month if going beyond free tier

---

## Frequently Asked Questions

### "What if I miss a day?"
Don't skip—compress 2 days into 1 on the weekend. The goal is momentum, not perfection. 10 days of 4 hours beats 5 days of 6 hours burnout.

### "Can I use Windows?"
Yes, use **WSL2** (Windows Subsystem for Linux 2). Everything is tested on Linux commands.

### "Do I need all these AWS services?"
Week 1 only uses EC2, IAM, OIDC, SSM. All free tier eligible. Later weeks may need EKS ($73/month) or RDS, which we'll optimize using free alternatives (minikube, SQLite).

### "How do I share this if I have a private repo?"
Make it public for portfolio. If sensitive:
- Remove AWS account IDs from screenshots
- Remove EC2 instance IDs
- Keep GitHub Actions logs public

### "What if the pipeline fails?"
Check [week1-cicd/README.md](week1-cicd/README.md#x-common-errors--troubleshooting) section X for 10 documented errors and solutions. If new error, document it and add to README.

---

## Success Criteria

### Week 1 Done When:
- ✅ App loads at `http://EC2_PUBLIC_IP:5000` without errors
- ✅ GitHub Actions pipeline shows green checkmarks (all 5 jobs pass)
- ✅ Docker image scans show no critical vulnerabilities
- ✅ Automatic deployment works when you push to main
- ✅ Rollback works when deployment fails intentionally
- ✅ 3 comprehensive documentation guides completed
- ✅ 2+ LinkedIn posts published
- ✅ GitHub repo shows professional README with badges & diagrams

### Overall 30-Day Success:
- Build 4 projects (UI, Infrastructure, Kubernetes, Capstone)
- Deploy to 3 environments (dev, staging, production)
- Manage 2+ Kubernetes clusters
- Write 3,000+ lines of documentation
- Post 24 LinkedIn updates (2x/week)
- Apply to 10+ DevOps jobs with portfolio links
- **Get at least 1 interview call**

---

## Retrospective & Learnings

### Week 1 Reflection (Post-Completion)

**What Went Well:**
- ✅ Chose simple tech stack (Node + Docker + GitHub Actions) = quick iteration
- ✅ Documented errors AS THEY HAPPENED = easy troubleshooting for others
- ✅ OIDC from day 1 = no SSH key management headaches
- ✅ Multi-stage Docker build = learned containerization deeply

**Challenges Faced:**
- SSM deploy command quote escaping took 2 hours to diagnose
- IAM permissions required 3 iterations to get right
- Took 15 minutes to realize instance needed IAM role attached

**Key Learnings:**
1. **Quote escaping in JSON is tricky** — Use tools to validate JSON in CI/CD
2. **AWS IAM errors are cryptic** — Google exact error message + "AWS SSM"
3. **Documentation as you go** — Finished in 5 days instead of 7 by capturing errors live
4. **Simple > Complex** — Avoided Jenkins, Snyk, ECS complexity for Week 1

**Next Week's Improvements:**
- Use Terraform from Day 1 (no ClickOps)
- Schedule VPC/RDS creation before pipeline work
- Pre-test IAM policies in isolated account

---

## Contributing

Have improvements or spotted an error? 
- Open a GitHub issue with details
- Submit a PR with fixes
- Share on LinkedIn (tag me) if this helped

---

## License

This portfolio is open source under MIT License. Use it, fork it, learn from it. 

---

## Contact & Social

**GitHub:** [Push1697](https://github.com/Push1697)  
**LinkedIn:** [Your LinkedIn]  
**Email:** [Your Email]

---

**Last Updated:** February 12, 2026  
**Current Phase:** Week 1 Complete, Debugging Deployment  
**Next Milestone:** Week 2 Terraform (Day 6)
test
