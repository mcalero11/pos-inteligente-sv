package main

import (
	"backend/internal/interfaces/http/routes"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()

	// Essential middlewares
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.Use(middleware.CORS())      // For web frontend
	e.Use(middleware.RequestID()) // For request tracing
	e.Use(middleware.Gzip())      // Response compression

	routes.SetupRoutes(e)

	e.Logger.Fatal(e.Start(":1323"))
}
