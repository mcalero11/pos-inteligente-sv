package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func SignDTE(c echo.Context) error {
	return c.JSON(http.StatusOK, "DTE signed")
}
