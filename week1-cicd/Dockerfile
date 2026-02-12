# Stage 1: Dependencies
FROM node:20-alpine3.18 AS builder
WORKDIR /app
COPY package*.json ./
# Install only production dependencies and skip lifecycle scripts to speed up the build and reduce potential attack surface
RUN npm ci --omit=dev --ignore-scripts \
    && npm cache clean --force \
    && rm -rf /root/.npm /tmp/*

# Stage 2: Runtime
# Use a non-root image for better security and smaller attack surface and size
FROM gcr.io/distroless/nodejs20-debian12:nonroot
WORKDIR /app
COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --chown=nonroot:nonroot server.js .
COPY --chown=nonroot:nonroot MOCK_DATA.json .
EXPOSE 5000
CMD ["server.js"]