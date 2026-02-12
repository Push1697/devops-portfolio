# Step-by-Step Setup Guide

## Prerequisites Checklist

Before starting, ensure you have:

- ✅ GitHub account with `devops-portfolio` repository
- ✅ Docker Hub account (free at docker.com)
- ✅ AWS account with running EC2 instance
- ✅ EC2 instance with Docker and SSM agent installed

---

## Part 1: Docker Hub Setup

### Why Docker Hub?
Docker Hub is a container registry where we store Docker images. GitHub Actions pushes the image here, and EC2 pulls it for deployment.

### Step 1: Create Docker Hub Account

1. Visit https://hub.docker.com
2. Click **Register**
3. Fill in details and verify email

### Step 2: Create Access Token

1. Log in to Docker Hub
2. Click **Account Settings** (top right) → **Security**
3. Click **New Access Token**
4. Fill in:
   - **Token name**: `github-actions`
   - **Description**: `For GitHub Actions CI/CD`
   - **Permissions**: Read, Write, Delete
5. Click **Generate**
6. **Copy the token immediately** (you won't see it again!)

### Step 3: Add to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add both:

   **Secret 1:**
   - Name: `DOCKERHUB_USERNAME`
   - Value: Your Docker Hub username (e.g., `johndoe`)

   **Secret 2:**
   - Name: `DOCKERHUB_TOKEN`
   - Value: The token you just copied

5. Click **Add secret**

**Verify:** You should now see both secrets listed.

---

## Part 2: AWS Setup

### Why OIDC?
Instead of storing AWS credentials in GitHub, we use OIDC (OpenID Connect) to let GitHub assume an IAM role. This is more secure.

### Prerequisites on AWS

1. **OIDC Provider exists**
   - Go to AWS → IAM → Identity providers
   - You should see: `token.actions.githubusercontent.com`
   - If not, create one:
     - Provider type: `OpenID Connect`
     - Provider URL: `https://token.actions.githubusercontent.com`
     - Audience: `sts.amazonaws.com`

2. **EC2 Instance running**
   - Go to AWS EC2 → Instances
   - Copy your instance ID (e.g., `i-0cf9f42d420f98bca`)
   - Note: Keep this for secrets

### Step 1: Create IAM Role for OIDC

1. Go to AWS IAM → **Roles** → **Create role**
2. **Trusted entity type**: `Web identity`
3. **Identity provider**: `token.actions.githubusercontent.com`
4. **Audience**: `sts.amazonaws.com`
5. Click **Next**
6. **Add permissions**: Attach `AmazonSSMManagedInstanceCore` policy
7. Click **Next**
8. **Role name**: `github-actions-oidc-role`
9. Click **Create role**

### Step 2: Update Trust Policy

The role you just created needs to trust your GitHub repo specifically.

1. Go to IAM → **Roles** → `github-actions-oidc-role`
2. Click **Trust relationships** tab
3. Click **Edit trust policy**
4. Replace with this:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_AWS_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:Push1697/devops-portfolio:*"
        }
      }
    }
  ]
}
```

Replace `YOUR_AWS_ACCOUNT_ID` with your AWS account ID (find it in top right → Account ID).

5. Click **Update policy**

### Step 3: Get Role ARN

1. In the same role details page, find **ARN** (copy it)
2. Example: `arn:aws:iam::450070307294:role/github-actions-oidc-role`

### Step 4: Ensure EC2 Instance Role

Your EC2 instance needs the `AmazonSSMManagedInstanceCore` policy.

1. Go to AWS EC2 → **Instances** → Select your instance
2. Look for **Instance IAM role**
3. Click the role name
4. Go to **Permissions**
5. Check if `AmazonSSMManagedInstanceCore` is attached
6. If not, click **Add permissions** → **Attach policies** → Search and attach it

### Step 5: Add AWS Secrets to GitHub

1. Go to GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Add two new secrets:

   **Secret 1:**
   - Name: `AWS_ROLE_ARN`
   - Value: The ARN from Step 3 above

   **Secret 2:**
   - Name: `EC2_INSTANCE_ID`
   - Value: Your instance ID (e.g., `i-0cf9f42d420f98bca`)

3. Click **Add secret**

---

## Part 3: EC2 Preparation

### Check Docker Installation

SSH into your EC2 instance:

```bash
# Connect via AWS Systems Manager (recommended)
# Or SSH directly if you have the key

# Check if Docker is installed
docker --version
# Should output: Docker version XX.XX.XX

# Check if Docker is running
sudo systemctl status docker
# Should show "active (running)"
```

### If Docker Not Installed

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker

# Start Docker
sudo systemctl start docker

# Enable Docker on boot
sudo systemctl enable docker

# Add current user to docker group (avoid sudo)
sudo usermod -aG docker ec2-user

# Verify
docker --version
```

### Check SSM Agent

```bash
# Check if SSM agent is running
systemctl status amazon-ssm-agent

# Should show "active (running)"

# If not running:
sudo systemctl start amazon-ssm-agent
sudo systemctl enable amazon-ssm-agent
```

### Check Security Group

Your EC2 security group must allow inbound traffic on port 5000:

1. Go to AWS EC2 → **Security Groups**
2. Find your instance's security group
3. Click **Inbound rules** → **Edit inbound rules**
4. Add rule:
   - **Type**: Custom TCP
   - **Protocol**: TCP
   - **Port range**: 5000
   - **Source**: Anywhere (0.0.0.0/0) or your IP
5. Click **Save rules**

---

## Part 4: GitHub Secrets Summary

By now, you should have 4 secrets in GitHub:

```
✅ DOCKERHUB_USERNAME    = Your Docker Hub username
✅ DOCKERHUB_TOKEN       = Docker Hub access token
✅ AWS_ROLE_ARN          = IAM role ARN
✅ EC2_INSTANCE_ID       = EC2 instance ID
```

**Verify:**
1. Go to GitHub → **Settings** → **Secrets and variables** → **Actions**
2. You should see all 4 secrets listed

---

## Part 5: Test the Pipeline

### Step 1: Make a Test Commit

```bash
cd devops-portfolio

# Make a small change
echo "# Test commit" >> week1-cicd/README.md

# Commit and push to main
git add week1-cicd/README.md
git commit -m "test: trigger ci pipeline"
git push origin main
```

### Step 2: Watch the Pipeline

1. Go to GitHub → **Actions** tab
2. You should see a new workflow run appear
3. Click on it to see real-time logs
4. Watch stages execute: Build → Test → Security → Docker → Deploy

### Step 3: Check Results

**If successful:**
- ✅ All jobs show green checkmarks
- ✅ Docker image pushed to Docker Hub
- ✅ Container running on EC2

**Check your app:**
```bash
curl http://<YOUR_EC2_PUBLIC_IP>:5000/

# Should return:
"Node CI demo is running."
```

**Check Docker Hub:**
```
https://hub.docker.com/r/YOUR_USERNAME/node-ci-demo
```

You should see `latest` tag with your commit.

### Step 4: Verify on EC2

SSH to EC2 and check:

```bash
# List running containers
docker ps

# Should show:
node-ci-demo   yourusername/node-ci-demo:latest   Up 2 minutes

# Check logs
docker logs node-ci-demo
```

---

## Troubleshooting Setup

### Issue: Build stage fails with "package-lock.json not found"

**Fix:**
```bash
cd week1-cicd
npm install  # Generates lock file
git add package-lock.json
git commit -m "chore: add package-lock.json"
git push origin main
```

### Issue: Docker push fails with "denied: requested access"

**Fix:**
1. Verify `DOCKERHUB_TOKEN` is correct
2. Delete old token: Docker Hub → Account Settings → Security
3. Create new token: Click **New Access Token**
4. Update GitHub secret with new token
5. Retry

### Issue: Deploy fails with "role not found"

**Fix:**
1. Check `AWS_ROLE_ARN` secret is correct
2. Verify IAM role exists: AWS → IAM → Roles
3. Verify trust policy is updated (includes your repo)
4. Check policy has `AmazonSSMManagedInstanceCore`

### Issue: SSM command fails with "SSM agent not found"

**Fix on EC2:**
```bash
sudo systemctl status amazon-ssm-agent

# If not running:
sudo systemctl start amazon-ssm-agent
sudo systemctl enable amazon-ssm-agent
```

### Issue: Port 5000 not accessible

**Fix:**
1. Check security group rules (above)
2. Check EC2 instance running
3. Check Docker container running: `docker ps`
4. Test locally on EC2: `curl localhost:5000`

---

## What Each Step Does (5 W's Summary)

### Docker Hub Setup
- **Who:** You (developer)
- **What:** Create account and access token
- **When:** Once, at beginning
- **Where:** Docker Hub website
- **Why:** Secure way to store Docker images

### AWS IAM Setup
- **Who:** You (in AWS console)
- **What:** Create OIDC role that GitHub can use
- **When:** Once, during setup
- **Where:** AWS IAM console
- **Why:** Secure, keyless authentication for GitHub

### EC2 Preparation
- **Who:** You (on EC2 instance)
- **What:** Install Docker, configure SSM, open port 5000
- **When:** Once, before first deployment
- **Where:** Your EC2 instance
- **Why:** Prepare instance to receive and run Docker containers

### GitHub Secrets
- **Who:** You (in GitHub)
- **What:** Store credentials and IDs securely
- **When:** After each service setup
- **Where:** GitHub Secrets page
- **Why:** Let GitHub access Docker Hub and AWS securely

### Test Pipeline
- **Who:** You (push code)
- **What:** Trigger workflow to validate setup
- **When:** After all setup complete
- **Where:** GitHub Actions
- **Why:** Verify everything works before real use

---

## Next Steps

✅ Setup complete!

Now:
1. Make code changes
2. Push to `main`
3. Watch pipeline build & deploy automatically
4. Verify running on EC2

**Welcome to automated deployments!** 🚀
