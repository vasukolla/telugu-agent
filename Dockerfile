# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency configs
COPY package*.json tsconfig.json vite.config.ts server.ts index.html ./
# Copy source files
COPY src ./src

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Run the build (Vite build + esbuild bundling of server)
RUN npm run build

# Stage 2: Runner stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
# Cloud Run automatically sets PORT, but we set a default just in case
ENV PORT=3000

# Copy package configurations
COPY package*.json ./

# Install only production dependencies to keep the image slim
RUN npm ci --only=production

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
