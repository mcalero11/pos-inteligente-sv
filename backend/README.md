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
├── cmd/                          # Application entry points
│   └── api/
│       └── main.go              # Public - app executable
├── pkg/                         # Public packages
│   ├── logger/                  # Reusable across projects
│   ├── validator/               # Utilities others can use
│   ├── http/                    # HTTP utilities
│   └── errors/                  # Common error handling
│   └── dte/                     # DTE integration
├── internal/                    # Private implementation
│   ├── domain/                  # Business logic (private)
│   ├── application/             # Use cases (private)
│   ├── infrastructure/          # External integrations (private)
│   └── interfaces/              # HTTP handlers (private)
├── api/                         # Public API specification
│   └── openapi.yaml
└── go.mod
```

## Architecture Diagram

```mermaid
graph TD
    A["cmd/"] --> B["server/main.go"]
    A --> C["migrate/main.go"]
    
    D["internal/"] --> E["domain/"]
    D --> F["application/"]
    D --> G["infrastructure/"]
    D --> H["interfaces/"]
    
    E --> E1["sales/"]
    E --> E2["inventory/"]
    E --> E3["customer/"]
    E1 --> E1A["order.go<br/>(Aggregate)"]
    E1 --> E1B["order_item.go<br/>(Entity)"]
    E1 --> E1C["events.go<br/>(Domain Events)"]
    
    F --> F1["commands/"]
    F --> F2["queries/"]
    F --> F3["handlers/"]
    F1 --> F1A["create_order.go"]
    F2 --> F2A["get_orders.go"]
    F3 --> F3A["order_handler.go"]
    
    G --> G1["persistence/"]
    G --> G2["messaging/"]
    G --> G3["external/"]
    G1 --> G1A["postgres/"]
    G1 --> G1B["redis/"]
    
    H --> H1["http/"]
    H --> H2["grpc/"]
    H1 --> H1A["handlers/"]
    H1 --> H1B["middleware/"]
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
