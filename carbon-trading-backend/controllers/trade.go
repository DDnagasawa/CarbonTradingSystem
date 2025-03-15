package controllers

import (
	"carbon-trading-backend/config"
	"carbon-trading-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateTrade handles the creation of a new trade
func CreateTrade(c *gin.Context) {
	var trade models.Trade
	if err := c.ShouldBindJSON(&trade); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&trade).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Trade created successfully", "trade": trade})
}

// GetTrades retrieves all trades
func GetTrades(c *gin.Context) {
	var trades []models.Trade
	if err := config.DB.Find(&trades).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, trades)
}
