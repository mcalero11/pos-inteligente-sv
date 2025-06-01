# POS Backend Service

The core API service for the POS Inteligente system, built with Go for high performance and reliability.

## Overview

This service handles all business logic for the point-of-sale system including:
- Transaction processing
- Inventory management
- Electronic invoicing integration with El Salvador's Ministry of Finance
- Real-time analytics and reporting
- Multi-tenant architecture support

## Architecture

The backend follows a clean architecture pattern with clear separation of concerns:

```
backend/
├── cmd/              # Application entry points
├── internal/         # Private application code
│   ├── domain/      # Business logic and entities
│   ├── handlers/    # HTTP request handlers
│   ├── services/    # Business services
│   └── repository/  # Data access layer
├── pkg/             # Public packages
├── migrations/      # Database migrations
└── config/          # Configuration files
```

## Prerequisites

- Go 1.21 or higher
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (for development)

## Getting Started

### Local Development

1. **Install dependencies:**
   ```bash
   go mod download
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

3. **Run the service:**
   ```bash
   go run server.go
   ```

   The API will be available at `http://localhost:8080`

### Using Docker Compose

From the project root directory:

```bash
docker-compose up backend
```

This will start the backend service along with required dependencies (PostgreSQL, Redis).

## API Documentation

The API follows RESTful principles and uses OpenAPI 3.0 for documentation.

- API Documentation: `http://localhost:8080/swagger`
- OpenAPI Spec: `http://localhost:8080/openapi.yaml`

### Key Endpoints

- `GET /health` - Health check endpoint
- `POST /api/v1/sales` - Create a new sale
- `GET /api/v1/products` - List products
- `POST /api/v1/invoices/electronic` - Generate electronic invoice

## Configuration

The service uses environment variables for configuration. See `.env.example` for all available options.

Key configuration areas:
- **Database**: PostgreSQL connection settings
- **Redis**: Cache and session storage
- **Ministry Integration**: Credentials for electronic invoicing
- **AI Services**: API keys for OpenAI integration

## Testing

Run tests with coverage:

```bash
go test -v -cover ./...
```

Run integration tests:

```bash
go test -v -tags=integration ./...
```

## Building

### Development Build

```bash
go build -o bin/api server.go
```

### Production Build

```bash
go build -ldflags="-s -w" -o bin/api server.go
```

## Database Migrations

We use [golang-migrate](https://github.com/golang-migrate/migrate) for database migrations.

Run migrations:

```bash
migrate -path migrations -database "postgresql://user:pass@localhost/pos?sslmode=disable" up
```

## Contributing

1. Follow Go's standard formatting (`go fmt`)
2. Ensure all tests pass
3. Add tests for new functionality
4. Update documentation as needed

## Performance Considerations

- The service is designed to handle 1000+ concurrent connections
- Uses connection pooling for database access
- Implements caching strategies for frequently accessed data
- Supports horizontal scaling through stateless design

## Security

- All endpoints require authentication (except health check)
- JWT tokens for API authentication
- Rate limiting implemented on all endpoints
- Input validation on all user inputs
- SQL injection protection through parameterized queries

## Monitoring

- Structured logging with JSON output
- Prometheus metrics exposed at `/metrics`
- Health check endpoint for load balancers
- Distributed tracing support with OpenTelemetry

## License

See the main project [LICENSE](../LICENSE) file.