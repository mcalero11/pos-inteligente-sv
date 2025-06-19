// Package routes defines the HTTP routing configuration
package routes

import (
	"backend/internal/interfaces/http/handlers"

	"github.com/labstack/echo/v4"
)

func SetupRoutes(e *echo.Echo) {
	setupDocsRoutes(e)
	api := e.Group("/api/v1")
	setupDteRoutes(api)
}

func setupDocsRoutes(e *echo.Echo) {
	e.GET("/", handlers.RootEndpoint)
	e.GET("/health", handlers.HealthCheck)
}

func setupDteRoutes(api *echo.Group) {
	api.POST("/dte", handlers.SignDTE)
}
