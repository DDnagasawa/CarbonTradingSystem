package config

import (
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

// InitDB initializes the database connection
func InitDB() {
	// 设置数据库连接信息
	dsn := "root:12345678@tcp(127.0.0.1:3306)/carbontra?charset=utf8mb4&parseTime=True&loc=Local"

	// 打开数据库连接
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("Database connection established!")
}
