package main

import (
	"carbon-trading-backend/config"
	"carbon-trading-backend/models"
	"carbon-trading-backend/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// 初始化数据库
	config.InitDB()

	// 自动迁移数据库表结构
	err := config.DB.AutoMigrate(
		&models.Trade{},
		&models.Token{},
		&models.Stats{},
		&models.User{},
		&models.Order{},
		&models.Holding{},
	)
	if err != nil {
		panic("Failed to migrate database: " + err.Error())
	}

	// 初始化默认数据
	models.InitDefaultTokens()
	models.InitDefaultStats()

	// 创建 Gin 路由实例
	router := gin.Default()

	// 启用 CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization", "Origin", "Accept"},
		AllowCredentials: true,
	}))

	// 配置路由
	routes.SetupRoutes(router)

	// 启动后端服务
	router.Run(":8000")
}
