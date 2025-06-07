# Web Frontend Dockerfile
# Multi-stage build for optimal image size and performance

# Stage 1: Dependencies stage
FROM node:24-alpine AS dependencies

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Development stage
FROM node:24-alpine AS development

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy package files
COPY package.json pnpm-lock.yaml ./

# The source code will be mounted as a volume in development
# Vite's dev server will provide hot module replacement

EXPOSE 5173

# Vite dev server will be run via docker-compose command

# Stage 3: Build stage
FROM node:24-alpine AS builder

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Stage 4: Production stage
FROM nginx:alpine AS production

# Install runtime dependencies
RUN apk add --no-cache curl

# Copy nginx configuration
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
