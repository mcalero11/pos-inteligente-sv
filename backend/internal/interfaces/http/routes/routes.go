// Package routes efines the HTTP routing configuration
package routes

import (
	"backend/internal/interfaces/http/handlers"

	"github.com/labstack/echo/v4"
)

func SetupRoutes(e *echo.Echo) {
	setupDocsRoutes(e)
}

func setupDocsRoutes(e *echo.Echo) {
	e.GET("/", handlers.RootEndpoint)
	e.GET("/health", handlers.HealthCheck)
}
