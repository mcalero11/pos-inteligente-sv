# Backend Dockerfile
# Multi-stage build for efficient production images

# Stage 1: Build stage
FROM golang:1.24-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git make

# Set working directory
WORKDIR /build

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o api server.go

# Stage 2: Development stage with hot reload
FROM golang:1.24-alpine AS development

# Install air for hot reload
RUN go install github.com/cosmtrek/air@latest

# Install development tools
RUN apk add --no-cache git make curl

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Air configuration will be mounted as volume
# The source code will also be mounted as volume

EXPOSE 8080

# Air will be run via docker-compose command

# Stage 3: Production stage
FROM alpine:latest AS production

# Install runtime dependencies
RUN apk --no-cache add ca-certificates tzdata

# Create non-root user
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup

WORKDIR /app

# Copy binary from builder
COPY --from=builder /build/api .

# Copy any static files or configurations
# COPY --from=builder /build/config ./config

# Change ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["/app/api", "health"] || exit 1

ENTRYPOINT ["/app/api"]
