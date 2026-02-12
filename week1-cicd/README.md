# Week 1 - CI/CD Foundations (Node + GraphQL)

This week sets up a basic Node.js API server with both GraphQL and REST endpoints. The goal is to provide a simple app that can be built and deployed by CI/CD later.

## I. Start a new Node.js project

From the repository root:

```bash
cd week1-cicd/node-ci-demo
npm init -y
```

## II. Install dependencies

```bash
npm install express express-graphql graphql
```

Why these packages:
- `graphql`: core GraphQL schema and execution library.
- `express-graphql`: adds a `/graphql` endpoint to Express and enables the GraphiQL UI.

## III. Create a data file

Create a JSON file to store sample users:

```bash
touch MOCK_DATA.json
```

Example structure:

```json
[
  {
    "id": 1,
    "firstName": "Asha",
    "lastName": "Iyer",
    "email": "asha.iyer@example.com",
    "password": "pass1234"
  }
]
```

## IV. Prepare the API server

Create `server.js` and add the GraphQL + REST server code. This sets up:
- GraphQL endpoint at `/graphql` with GraphiQL enabled.
- REST endpoint at `/rest/getAllUsers` returning the same user data.

```bash
touch server.js
```

## V. Update package.json

Open `package.json` and update:
- `main` to `server.js`
- `scripts` to use `node server.js`

Example:

```json
{
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  }
}
```

## VI. Run the server

```bash
npm start
```

## VII. Test the endpoints

- GraphQL: http://localhost:5000/graphql
- REST: http://localhost:5000/rest/getAllUsers

Sample GraphQL query:

```graphql
{
  getAllUsers {
    id
    firstName
    lastName
    email
  }
}
```

Sample mutation:

```graphql
mutation {
  createUser(
    firstName: "Ravi",
    lastName: "Patel",
    email: "ravi.patel@example.com",
    password: "pass9999"
  ) {
    id
    firstName
    lastName
    email
  }
}
```

## VIII. CI/CD Pipeline Overview

GitHub Actions workflows must live in the repo root at [/.github/workflows](.github/workflows). Workflows placed inside `week1-cicd/` will not run.

Workflows in this repo:
- [/.github/workflows/ci-cd-pipeline.yml](.github/workflows/ci-cd-pipeline.yml)
- [/.github/workflows/pr-validation.yml](.github/workflows/pr-validation.yml)
- [/.github/workflows/dependency-scan.yml](.github/workflows/dependency-scan.yml)

Stages in the main pipeline:
- Build: installs dependencies, checks syntax, optional lint.
- Test: optional tests if configured.
- Security: npm audit, optional Snyk, CodeQL.
- Docker: build and push to Docker Hub on `main`.
- Deploy: OIDC + SSM Run Command to update EC2.

### Required GitHub Secrets

Set these in your repository settings:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `AWS_ROLE_ARN`
- `EC2_INSTANCE_ID`

---

## IX. Docker Hub Setup (Detailed)

### Why Docker Hub?

Docker Hub is a container registry (storage service) where your Docker images are stored. GitHub Actions builds the image and pushes it to Docker Hub, then EC2 pulls it for deployment.

### Step 1: Create Docker Hub Account

1. Go to https://hub.docker.com
2. Click **Sign Up**
3. Fill in:
   - Username (e.g., `johndoe`)
   - Email
   - Password
4. Verify your email

**Example:**
```
Username: overflowbyte
Email: your-email@example.com
Password: strong-password-123
```

### Step 2: Generate Docker Hub Access Token

**Why token instead of password?**
- More secure (can be revoked easily)
- Limited permissions (only Docker operations)
- Can be deleted without changing account password

**Steps:**
1. Log in to Docker Hub
2. Click your **Avatar** (top right) → **Account Settings**
3. Go to **Security** tab
4. Click **New Access Token**
5. Fill in:
   - **Token name:** `github-actions`
   - **Token name (description):** `For GitHub Actions CI/CD Pipeline`
   - **Permissions:** Check `Read`, `Write`, `Delete`
6. Click **Generate**
7. **Copy the token immediately** (won't show again!)

**Example output:**
```
dckr_pat_ABC123DEF456GHI789JKL0MN
```

### Step 3: Add Secret to GitHub

Now add these TWO secrets to GitHub:

**Go to GitHub:**
1. Your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**

**Add Secret 1:**
```
Name: DOCKERHUB_USERNAME
Value: overflowbyte
```

**Add Secret 2:**
```
Name: DOCKERHUB_TOKEN
Value: dckr_pat_ABC123DEF456GHI789JKL0MN
```

**Verify:**
You should now see both secrets listed in your GitHub repository secrets.

---

## X. Common Errors & Troubleshooting

### Error 1: Docker Login Fails - "Username required"

**What it looks like:**
```
Run docker/login-action@v3
Error: Username required
```

**Why it happens:**
- Secret name is wrong (case-sensitive)
- Secret is missing from GitHub
- Secret doesn't match workflow reference

**Solution:**
1. In workflow, check line with Docker login:
   ```yaml
   password: ${{ secrets.DOCKERHUB_TOKEN }}  # ✅ Correct
   password: ${{ secrets.DOCKER_SECRET_KEY }} # ❌ Wrong
   ```

2. In GitHub, verify secrets exist:
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`

3. Fix workflow and re-push:
   ```bash
   git add .github/workflows/ci-cd-pipeline.yml
   git commit -m "fix: correct docker secret name"
   git push origin main
   ```

**Our example:**
We had `DOCKER_SECRET_KEY` when it should be `DOCKERHUB_TOKEN`. Fixed by changing the workflow file.

---

### Error 2: "denied: requested access to the resource is denied"

**What it looks like:**
```
ERROR: denied: requested access to the resource is denied
```

**Why it happens:**
- Token doesn't have write permission
- Token is invalid or expired
- Wrong Docker Hub username

**Solution:**

1. **Create new token with correct permissions:**
   - Docker Hub → Account Settings → Security
   - Click **New Access Token**
   - Check: `Read`, `Write`, `Delete`
   - Click **Generate**

2. **Update GitHub secret:**
   - Go to GitHub → Settings → Secrets
   - Click on `DOCKERHUB_TOKEN`
   - Click **Update**
   - Paste new token
   - Click **Update secret**

3. **Delete old token:**
   - Docker Hub → Account Settings → Security
   - Find old token
   - Click **Delete**

4. **Re-trigger pipeline:**
   ```bash
   git commit --allow-empty -m "retry: docker push"
   git push origin main
   ```

---

### Error 3: "package-lock.json not found"

**What it looks like:**
```
npm ERR! The package-lock.json file is required in workspaces
npm ERR! npm ci can only install packages when your package manager is
npm ERR! used to install them. Since package-lock.json was not present,
npm ERR! we can't continue.
```

**Why it happens:**
- `package-lock.json` was not committed to Git
- Pipeline requires exact dependency versions

**Solution:**

1. **Generate lock file locally:**
   ```bash
   cd week1-cicd
   npm install
   ```
   This creates `package-lock.json`

2. **Commit and push:**
   ```bash
   git add package-lock.json
   git commit -m "chore: add package-lock.json"
   git push origin main
   ```

**Why this matters:**
- `npm install` = flexible versions, updates lock file
- `npm ci` = exact versions, requires lock file
- CI/CD uses `npm ci` for reproducible builds

---

### Error 4: "SNYK_TOKEN not recognized"

**What it looks like:**
```
(Line: 106, Col: 13): Unrecognized named-value: 'secrets'.
Located at position 1 within expression: secrets.SNYK_TOKEN != ''
```

**Why it happens:**
- Used `${{ secrets.SNYK_TOKEN }}` inside an `if` condition
- `if` conditions don't need `${{ }}` wrapping

**Solution (two options):**

**Option A: Remove Snyk step (what we did)**
```yaml
# ❌ Removed this:
- name: Run Snyk (optional)
  if: ${{ secrets.SNYK_TOKEN != '' }}  # Wrong syntax
  uses: snyk/actions/node@master
  ...

# ✅ or use correct syntax:
- name: Run Snyk (optional)
  if: secrets.SNYK_TOKEN != ''  # Correct (no ${{ }})
  uses: snyk/actions/node@master
  ...
```

**Key rule:**
- `if:` conditions → No `${{ }}`
- Inside `run:` or `env:` → Use `${{ }}`

---

### Error 5: "Deploy fails - role not found"

**What it looks like:**
```
An error occurred (InvalidParameterValue) when calling the AssumeRole operation:
role not found or misconfigured
```

**Why it happens:**
- AWS_ROLE_ARN secret is wrong
- IAM role doesn't exist
- Trust policy not set correctly

**Solution:**

1. **Verify role exists in AWS:**
   - Go to AWS → IAM → Roles
   - Search for `github-actions-oidc-role`
   - Should appear in list

2. **Copy correct ARN:**
   - Click the role name
   - Find **ARN** field (top right)
   - Example: `arn:aws:iam::450070307294:role/github-actions-oidc-role`

3. **Update GitHub secret:**
   - Go to GitHub → Settings → Secrets
   - Update `AWS_ROLE_ARN` with correct ARN

4. **Verify trust policy:**
   - In the IAM role, click **Trust relationships**
   - Should include your GitHub repo path:
     ```json
     "token.actions.githubusercontent.com:sub": "repo:Push1697/devops-portfolio:*"
     ```

---

### Error 6: "SSM command fails - agent not running"

**What it looks like:**
```
The document "AWS-RunShellScript" on instance "i-xxx" failed with error:
"Failed to run document"
```

**Why it happens:**
- SSM agent not running on EC2
- EC2 instance doesn't have SSM role
- Service not started

**Solution on EC2:**

```bash
# Check if agent is running:
systemctl status amazon-ssm-agent

# Should show:
# ● amazon-ssm-agent.service - Amazon SSM agent
#    Active: active (running)

# If NOT running:
sudo systemctl start amazon-ssm-agent
sudo systemctl enable amazon-ssm-agent  # Auto-start on reboot

# Verify:
systemctl status amazon-ssm-agent
```

---

### Error 7: "Cannot access app on port 5000"

**What it looks like:**
```
curl: (7) Failed to connect to ec2-ip:5000: Connection refused
```

**Why it happens:**
- Security group not allowing port 5000
- Docker container not running
- Port mapping incorrect

**Solution:**

1. **Check security group (AWS Console):**
   - Go to EC2 → Instances → Your instance
   - Click **Security** tab
   - Click security group name
   - Go to **Inbound rules**
   - Should have rule: `TCP 5000 from 0.0.0.0/0`
   - If not, click **Edit inbound rules**:
     - Type: Custom TCP
     - Port: 5000
     - Source: 0.0.0.0/0
     - Click **Save**

2. **Check if container is running (on EC2):**
   ```bash
   docker ps
   # Should show:
   # IMAGE                              STATUS
   # yourusername/node-ci-demo:latest   Up 2 minutes
   
   # If not running, restart:
   docker run -d -p 5000:5000 yourusername/node-ci-demo:latest
   ```

3. **Test locally on EC2:**
   ```bash
   curl localhost:5000
   # Should return app response
   ```

---

### Error 8: "Exit Code: 128" on git push

**What it looks like:**
```
$ git push -u origin main
fatal: could not read Username for 'https://github.com':...
Exit Code: 128
```

**Why it happens:**
- GitHub authentication issue
- Bad credentials or missing SSH key
- HTTPS vs SSH mismatch

**Solution:**

```bash
# Option 1: Use HTTPS (GitHub token)
git config --global credential.helper store

# Option 2: Use SSH (recommended)
# Make sure you have SSH key:
ssh -T git@github.com

# Option 3: Clear cached creds and retry
git credential reject
git push origin main
```

### Error 9: "SSM Deploy - syntax error near unexpected token"

**What it looks like:**
```
/home/runner/work/_temp/828afed9-c529-49ff-916b-762e17f809e3.sh: line 4: syntax error near unexpected token `)'
Error: Process completed with exit code 2.
```

**Why it happens:**
- Improper quote escaping in bash command within the SSM JSON parameters
- Using `\'{{.Image}}\'` (escaped single quotes) inside single-quoted JSON breaks shell parsing
- Complex nested quoting of the JSON array confuses bash parser

**Solution:**

In `.github/workflows/ci-cd-pipeline.yml`, remove escaped quotes from `docker inspect` command:

```yaml
# ❌ WRONG - breaks shell syntax
--parameters 'commands=["...","CURRENT_IMAGE=$(docker inspect -f \'{{.Image}}\' ${{ env.CONTAINER_NAME }} 2>/dev/null || true)","..."]'

# ✅ CORRECT - uses unescaped {{.Image}} and simpler fallback
--parameters 'commands=["...","CURRENT_IMAGE=$(docker inspect -f {{.Image}} ${{ env.CONTAINER_NAME }} 2>/dev/null || echo none)","..."]'
```

**Key changes:**
- Remove `\'` and `\'` around `{{.Image}}`
- Change fallback from `|| true` to `|| echo none` for cleaner logic
- Simplify rollback: use `[ "$CURRENT_IMAGE" != none ]` instead of `[ -n "$CURRENT_IMAGE" ]`

The corrected deploy step is in the workflow file at line 189.

### Error 10: "InvalidInstanceId - Instances not in a valid state"

**What it looks like:**
```
An error occurred (InvalidInstanceId) when calling the SendCommand operation: 
Instances not in a valid state for account
```

**Why it happens:**
- EC2 instance is stopped or not fully running
- SSM agent on the instance hasn't registered yet (need to wait 2-3 minutes after start)
- SSM agent service is stopped or crashed on the instance
- Instance role is not properly attached

**Solution:**

Check instance status:
```bash
# 1. Is the instance running?
aws ec2 describe-instances \
  --instance-ids i-YOUR_INSTANCE_ID \
  --region ap-south-1 \
  --query 'Reservations[0].Instances[0].State.Name'
# Should return: "running"

# 2. Is SSM agent online?
aws ssm describe-instance-information \
  --region ap-south-1 \
  --query 'InstanceInformationList[?InstanceIds==`i-YOUR_INSTANCE_ID`].PingStatus'
# Should return: "Online"

# 3. Is the instance role attached?
aws ec2 describe-instances \
  --instance-ids i-YOUR_INSTANCE_ID \
  --region ap-south-1 \
  --query 'Reservations[0].Instances[0].IamInstanceProfile.Arn'
# Should show a role ARN (not null)
```

**If instance is stopped:** Start it and wait 2-3 minutes, then retry.

**If SSM agent is offline:** SSH to the instance and restart it:
```bash
sudo systemctl status amazon-ssm-agent
sudo systemctl restart amazon-ssm-agent
sudo systemctl status amazon-ssm-agent  # Verify it's running
```

---

## XI. Secrets Checklist

Before running the pipeline, ensure you have **all 4 secrets** in GitHub:

```
❌ DOCKERHUB_USERNAME       - Your Docker Hub username
❌ DOCKERHUB_TOKEN          - Docker Hub access token (dckr_pat_...)
❌ AWS_ROLE_ARN             - Your IAM role ARN
❌ EC2_INSTANCE_ID          - Your EC2 instance ID (i-xxx)
```

**To verify:**
1. GitHub → Your repo → Settings → Secrets and variables → Actions
2. All 4 secrets should be listed and shows "(encrypted)"

---

### EC2 prerequisites

On the EC2 instance:
- Docker installed and running.
- SSM agent installed and instance role attached with `AmazonSSMManagedInstanceCore`.
- Security group allows inbound TCP on port 5000.

### Deploy flow

1. Push to `main`.
2. GitHub Actions builds and pushes the Docker image.
3. The deploy job uses OIDC to call SSM and runs the container on EC2.

---

## XII. Testing the Pipeline

Once all secrets are set:

```bash
# Make a test change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "test: trigger cicd pipeline"
git push origin main
```

**Then:**
1. Go to GitHub → **Actions** tab
2. Watch the pipeline execute
3. Check final workflow logs for errors
4. If successful, app is running on EC2!

```bash
# Test from your machine:
curl http://YOUR_EC2_PUBLIC_IP:5000/
```
