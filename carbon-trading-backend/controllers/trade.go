package controllers

import (
	"carbon-trading-backend/config"
	"carbon-trading-backend/models"
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
	"time"

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

// GetTokens retrieves all tokens with optional filtering
func GetTokens(c *gin.Context) {
	var tokens []models.Token
	query := config.DB.Model(&models.Token{})

	tab := c.Query("tab")
	if tab == "Top Movers" {
		query = query.Where("is_top_mover = ?", true)
	} else if tab == "New Listings" {
		query = query.Where("is_new_listing = ?", true)
	}

	if err := query.Find(&tokens).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	type TokenResponse struct {
		models.Token
		SparklineData []float64 `json:"sparklineData"`
	}

	response := make([]TokenResponse, len(tokens))
	for i, token := range tokens {
		response[i] = TokenResponse{Token: token}
		if token.Sparkline != "" {
			parts := strings.Split(token.Sparkline, ",")
			for _, p := range parts {
				if val, err := strconv.ParseFloat(strings.TrimSpace(p), 64); err == nil {
					response[i].SparklineData = append(response[i].SparklineData, val)
				}
			}
		}
		if response[i].SparklineData == nil {
			response[i].SparklineData = []float64{}
		}
	}

	c.JSON(http.StatusOK, response)
}

// GetStats retrieves statistics
func GetStats(c *gin.Context) {
	var stats models.Stats
	if err := config.DB.Last(&stats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetDashboard retrieves combined dashboard data (tokens + stats)
func GetDashboard(c *gin.Context) {
	var stats models.Stats
	if err := config.DB.Last(&stats).Error; err != nil {
		stats = models.Stats{}
	}

	var tokens []models.Token
	if err := config.DB.Find(&tokens).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	type TokenWithSparkline struct {
		models.Token
		SparklineData []float64 `json:"sparklineData"`
	}

	tokensWithSparkline := make([]TokenWithSparkline, len(tokens))
	for i, token := range tokens {
		tokensWithSparkline[i] = TokenWithSparkline{Token: token}
		if token.Sparkline != "" {
			parts := strings.Split(token.Sparkline, ",")
			for _, p := range parts {
				if val, err := strconv.ParseFloat(strings.TrimSpace(p), 64); err == nil {
					tokensWithSparkline[i].SparklineData = append(tokensWithSparkline[i].SparklineData, val)
				}
			}
		}
		if tokensWithSparkline[i].SparklineData == nil {
			tokensWithSparkline[i].SparklineData = []float64{}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"stats":  stats,
		"tokens": tokensWithSparkline,
	})
}

// UpdateToken updates a token's data
func UpdateToken(c *gin.Context) {
	var token models.Token
	id := c.Param("id")

	if err := config.DB.Where("id = ?", id).First(&token).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Token not found"})
		return
	}

	var updateData struct {
		Price     float64 `json:"price"`
		Change1h  float64 `json:"change1h"`
		Change24h float64 `json:"change24h"`
		Volume24h float64 `json:"volume24h"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token.Price = updateData.Price
	token.Change1h = updateData.Change1h
	token.Change24h = updateData.Change24h
	token.Volume24h = updateData.Volume24h

	if err := config.DB.Save(&token).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Token updated successfully", "token": token})
}

// CreateToken creates a new token
func CreateToken(c *gin.Context) {
	var token models.Token
	if err := c.ShouldBindJSON(&token); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&token).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Token created successfully", "token": token})
}

// GetUser retrieves or creates a user by wallet address
func GetUser(c *gin.Context) {
	walletAddr := c.Query("walletAddress")
	if walletAddr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "walletAddress is required"})
		return
	}

	user, err := models.GetOrCreateUser(walletAddr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

// GetUserHoldings retrieves user's token holdings
func GetUserHoldings(c *gin.Context) {
	userIDStr := c.Query("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "valid userId is required"})
		return
	}

	holdings, err := models.GetUserHoldings(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, holdings)
}

// GetUserOrders retrieves user's order history
func GetUserOrders(c *gin.Context) {
	userIDStr := c.Query("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "valid userId is required"})
		return
	}

	orders, err := models.GetUserOrders(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, orders)
}

// CreateOrder creates a new trading order
func CreateOrder(c *gin.Context) {
	var req struct {
		UserID      uint    `json:"userId" binding:"required"`
		TokenID     uint    `json:"tokenId" binding:"required"`
		TokenSymbol string  `json:"tokenSymbol" binding:"required"`
		OrderType   string  `json:"orderType" binding:"required"` // "BUY" or "SELL"
		Price       float64 `json:"price" binding:"required"`
		Amount      float64 `json:"amount" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.OrderType != "BUY" && req.OrderType != "SELL" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "orderType must be BUY or SELL"})
		return
	}

	// 获取用户
	var user models.User
	if err := config.DB.First(&user, req.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// 获取代币
	var token models.Token
	if err := config.DB.First(&token, req.TokenID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Token not found"})
		return
	}

	total := req.Price * req.Amount

	// 验证余额
	if req.OrderType == "BUY" {
		if user.USDDBalance < total {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient USDT balance"})
			return
		}
	} else {
		// 验证持仓
		var holding models.Holding
		if err := config.DB.Where("user_id = ? AND token_id = ?", req.UserID, req.TokenID).First(&holding).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "You don't have this token"})
			return
		}
		if holding.Amount < req.Amount {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient token balance"})
			return
		}
	}

	// 创建订单
	orderID := fmt.Sprintf("ORD%d%d", time.Now().UnixMilli(), rand.Intn(10000))
	gasFee := total * 0.003 // 0.3% gas fee

	order := models.Order{
		OrderID:     orderID,
		UserID:      req.UserID,
		TokenID:     req.TokenID,
		TokenSymbol: req.TokenSymbol,
		OrderType:   req.OrderType,
		Price:       req.Price,
		Amount:      req.Amount,
		Total:       total,
		Status:      "FILLED", // 模拟直接成交
		GasFee:      gasFee,
		TxHash:      generateFakeTxHash(),
		FilledAmount: req.Amount,
	}

	if err := config.DB.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 执行交易
	if req.OrderType == "BUY" {
		// 扣除 USDT，增加代币持仓
		user.USDDBalance -= total
		config.DB.Save(&user)
		models.UpsertHolding(req.UserID, req.TokenID, token.Symbol, token.Name, req.Amount, req.Price)

		// 更新代币交易量
		token.Volume24h += total
		config.DB.Save(&token)
	} else {
		// 增加 USDT，减少代币持仓
		user.USDDBalance += total - gasFee
		config.DB.Save(&user)
		models.ReduceHolding(req.UserID, req.TokenID, req.Amount)

		// 更新代币交易量
		token.Volume24h += total
		config.DB.Save(&token)
	}

	// 更新全局统计
	var stats models.Stats
	if err := config.DB.Last(&stats).Error; err == nil {
		stats.TotalVolume += total
		stats.AvgTransaction = (stats.AvgTransaction + total) / 2
		config.DB.Save(&stats)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Order executed successfully",
		"order":   order,
	})
}

// CancelOrder cancels a pending order
func CancelOrder(c *gin.Context) {
	orderID := c.Param("orderId")

	var order models.Order
	if err := config.DB.Where("order_id = ?", orderID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	if order.Status != "PENDING" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only pending orders can be cancelled"})
		return
	}

	order.Status = "CANCELLED"
	config.DB.Save(&order)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Order cancelled successfully",
		"order":   order,
	})
}

// GetTokenByID retrieves a single token by ID
func GetTokenByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token ID"})
		return
	}

	var token models.Token
	if err := config.DB.First(&token, uint(id)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Token not found"})
		return
	}

	c.JSON(http.StatusOK, token)
}

// 模拟生成假的交易哈希
func generateFakeTxHash() string {
	const hexChars = "0123456789abcdef"
	result := make([]byte, 66)
	result[0] = '0'
	result[1] = 'x'
	for i := 2; i < 66; i++ {
		result[i] = hexChars[rand.Intn(len(hexChars))]
	}
	return string(result)
}

func init() {
	rand.Seed(time.Now().UnixNano())
}
