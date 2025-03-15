package routes

import (
	"carbon-trading-backend/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	// 示例根路由
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Backend is running!"})
	})

	// 交易相关路由
	router.POST("/api/trades", controllers.CreateTrade)
	router.GET("/api/trades", controllers.GetTrades)

}
