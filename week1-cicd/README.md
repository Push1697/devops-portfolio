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

Optional:
- `SNYK_TOKEN`

### EC2 prerequisites

On the EC2 instance:
- Docker installed and running.
- SSM agent installed and instance role attached with `AmazonSSMManagedInstanceCore`.
- Security group allows inbound TCP on port 5000.

### Deploy flow

1. Push to `main`.
2. GitHub Actions builds and pushes the Docker image.
3. The deploy job uses OIDC to call SSM and runs the container on EC2.
