# ---------- Stage 1: Dependencies ----------
FROM node:20-alpine3.18 AS builder

WORKDIR /app

COPY package*.json ./  # use wildcard to copy both package.json and package-lock.json as package-lock.json is important for reproducible builds

# Use modern syntax
RUN npm ci --omit=dev # install only production dependencies

# ---------- Stage 2: Runtime ----------
FROM gcr.io/distroless/nodejs20  # use distroless for a smaller, more secure image

WORKDIR /app

# Copy only node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy only required source files
COPY server.js .
COPY MOCK_DATA.json .

EXPOSE 5000

USER node

CMD ["node", "server.js"]