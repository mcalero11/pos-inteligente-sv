// Package handlers provides HTTP request handlers for the API.
package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func HealthCheck(c echo.Context) error {
	var response = map[string]string{
		"status": "ok",
	}
	return c.JSON(http.StatusOK, response)
}

func RootEndpoint(c echo.Context) error {
	return c.String(http.StatusOK, "Up and running. Powered by Go")
}
