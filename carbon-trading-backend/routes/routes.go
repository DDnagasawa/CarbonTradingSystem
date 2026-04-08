package routes

import (
	"carbon-trading-backend/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	// 根路由
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Carbon Trading Backend is running!"})
	})

	// 交易相关路由
	router.POST("/api/trades", controllers.CreateTrade)
	router.GET("/api/trades", controllers.GetTrades)

	// 代币相关路由
	router.GET("/api/tokens", controllers.GetTokens)
	router.GET("/api/tokens/:id", controllers.GetTokenByID)
	router.POST("/api/tokens", controllers.CreateToken)
	router.PUT("/api/tokens/:id", controllers.UpdateToken)

	// 统计相关路由
	router.GET("/api/stats", controllers.GetStats)

	// 仪表盘综合数据路由
	router.GET("/api/dashboard", controllers.GetDashboard)

	// 用户相关路由
	router.GET("/api/user", controllers.GetUser)
	router.GET("/api/user/holdings", controllers.GetUserHoldings)
	router.GET("/api/user/orders", controllers.GetUserOrders)

	// 订单相关路由
	router.POST("/api/orders", controllers.CreateOrder)
	router.PUT("/api/orders/:orderId/cancel", controllers.CancelOrder)
}
