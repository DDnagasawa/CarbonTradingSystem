package models

import "carbon-trading-backend/config"

// Trade 模型
type Trade struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	TradeID   string `gorm:"unique;not null" json:"tradeId"`
	Amount    int    `gorm:"not null" json:"amount"`
	Currency  string `gorm:"not null" json:"currency"`
	CreatedAt int64  `gorm:"autoCreateTime:milli" json:"createdAt"`
}

// Token 模型 - 碳信用代币
type Token struct {
	ID           uint    `gorm:"primaryKey" json:"id"`
	Symbol       string  `gorm:"size:20;uniqueIndex;not null" json:"symbol"`
	Name         string  `gorm:"size:100;not null" json:"name"`
	Color        string  `gorm:"size:20;default:'#00C853'" json:"color"`
	Price        float64 `gorm:"default:0" json:"price"`
	Change1h     float64 `gorm:"default:0" json:"change1h"`
	Change24h    float64 `gorm:"default:0" json:"change24h"`
	FDV          float64 `gorm:"default:0" json:"fdv"`
	Volume24h    float64 `gorm:"default:0" json:"volume24h"`
	Sparkline    string  `gorm:"type:text" json:"sparkline"`
	IsTopMover   bool    `gorm:"default:false" json:"isTopMover"`
	IsNewListing bool    `gorm:"default:false" json:"isNewListing"`
	TotalSupply  float64 `gorm:"default:0" json:"totalSupply"`
	ContractAddr string  `gorm:"size:50;default:''" json:"contractAddress"`
	CreatedAt    int64   `gorm:"autoCreateTime:milli" json:"createdAt"`
}

// Stats 模型 - 统计信息
type Stats struct {
	ID                    uint    `gorm:"primaryKey" json:"id"`
	TotalVolume           float64 `json:"totalVolume"`
	TotalVolumeChange     float64 `json:"totalVolumeChange"`
	TotalValue            float64 `json:"totalValue"`
	TotalValueChange      float64 `json:"totalValueChange"`
	ActiveTraders         int     `json:"activeTraders"`
	ActiveTradersChange   float64 `json:"activeTradersChange"`
	AvgTransaction        float64 `json:"avgTransaction"`
	AvgTransactionChange  float64 `json:"avgTransactionChange"`
	TotalCarbonCredits    float64 `json:"totalCarbonCredits"`
	CarbonCreditsChange   float64 `json:"carbonCreditsChange"`
	UpdatedAt             int64   `gorm:"autoCreateTime:milli" json:"updatedAt"`
}

// User 模型 - 用户账户
type User struct {
	ID           uint    `gorm:"primaryKey" json:"id"`
	WalletAddr   string  `gorm:"size:50;uniqueIndex;not null" json:"walletAddress"`
	Username     string  `gorm:"size:50;default:''" json:"username"`
	Email        string  `gorm:"size:100;default:''" json:"email"`
	ETHBalance   float64 `gorm:"default:0" json:"ethBalance"`
	USDDBalance  float64 `gorm:"default:0" json:"usdtBalance"`
	IsVerified   bool    `gorm:"default:false" json:"isVerified"`
	CreatedAt    int64   `gorm:"autoCreateTime:milli" json:"createdAt"`
	UpdatedAt    int64   `gorm:"autoUpdateTime:milli" json:"updatedAt"`
}

// Order 模型 - 交易订单
type Order struct {
	ID            uint    `gorm:"primaryKey" json:"id"`
	OrderID       string  `gorm:"size:50;uniqueIndex;not null" json:"orderId"`
	UserID        uint    `json:"userId"`
	TokenID       uint    `json:"tokenId"`
	TokenSymbol   string  `gorm:"size:20;not null" json:"tokenSymbol"`
	OrderType     string  `gorm:"size:10;not null" json:"orderType"` // "BUY" or "SELL"
	Price         float64 `gorm:"not null" json:"price"`
	Amount        float64 `gorm:"not null" json:"amount"`
	Total         float64 `gorm:"not null" json:"total"`
	Status        string  `gorm:"size:20;default:'PENDING'" json:"status"` // PENDING, FILLED, CANCELLED
	GasFee        float64 `gorm:"default:0" json:"gasFee"`
	TxHash        string  `gorm:"size:100;default:''" json:"txHash"`
	FilledAmount  float64 `gorm:"default:0" json:"filledAmount"`
	CreatedAt     int64   `gorm:"autoCreateTime:milli" json:"createdAt"`
	UpdatedAt     int64   `gorm:"autoUpdateTime:milli" json:"updatedAt"`
}

// Holding 模型 - 用户持仓
type Holding struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	UserID      uint    `json:"userId"`
	TokenID     uint    `json:"tokenId"`
	TokenSymbol string  `gorm:"size:20;not null" json:"tokenSymbol"`
	TokenName   string  `gorm:"size:100;not null" json:"tokenName"`
	Amount      float64 `gorm:"default:0" json:"amount"`
	AvgCost     float64 `gorm:"default:0" json:"avgCost"`
	TotalCost   float64 `gorm:"default:0" json:"totalCost"`
	UpdatedAt   int64   `gorm:"autoUpdateTime:milli" json:"updatedAt"`
}

// 创建交易记录
func CreateTrade(trade *Trade) error {
	return config.DB.Create(trade).Error
}

// 创建代币记录
func CreateToken(token *Token) error {
	return config.DB.Create(token).Error
}

// 更新统计信息
func UpdateStats(stats *Stats) error {
	return config.DB.Save(stats).Error
}

// 创建用户
func CreateUser(user *User) error {
	return config.DB.Create(user).Error
}

// 获取或创建用户
func GetOrCreateUser(walletAddr string) (*User, error) {
	var user User
	err := config.DB.Where("wallet_addr = ?", walletAddr).First(&user).Error
	if err != nil {
		user = User{
			WalletAddr:  walletAddr,
			ETHBalance:  100.0, // 测试网初始余额
			USDDBalance: 10000.0,
			IsVerified:  true,
		}
		if err := config.DB.Create(&user).Error; err != nil {
			return nil, err
		}
		return &user, nil
	}
	return &user, nil
}

// 创建订单
func CreateOrder(order *Order) error {
	return config.DB.Create(order).Error
}

// 获取用户订单
func GetUserOrders(userID uint) ([]Order, error) {
	var orders []Order
	err := config.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&orders).Error
	return orders, err
}

// 获取用户持仓
func GetUserHoldings(userID uint) ([]Holding, error) {
	var holdings []Holding
	err := config.DB.Where("user_id = ? AND amount > 0", userID).Find(&holdings).Error
	return holdings, err
}

// 更新或创建持仓
func UpsertHolding(userID, tokenID uint, symbol, name string, amount, price float64) error {
	var holding Holding
	err := config.DB.Where("user_id = ? AND token_id = ?", userID, tokenID).First(&holding).Error
	if err != nil {
		holding = Holding{
			UserID:      userID,
			TokenID:     tokenID,
			TokenSymbol: symbol,
			TokenName:   name,
			Amount:      amount,
			AvgCost:     price,
			TotalCost:   amount * price,
		}
		return config.DB.Create(&holding).Error
	}

	// 更新持仓
	totalCost := holding.TotalCost + amount*price
	newAmount := holding.Amount + amount
	holding.Amount = newAmount
	holding.AvgCost = totalCost / newAmount
	holding.TotalCost = totalCost
	return config.DB.Save(&holding).Error
}

// 减少持仓
func ReduceHolding(userID, tokenID uint, amount float64) error {
	var holding Holding
	err := config.DB.Where("user_id = ? AND token_id = ?", userID, tokenID).First(&holding).Error
	if err != nil {
		return err
	}
	holding.Amount -= amount
	if holding.Amount < 0 {
		holding.Amount = 0
	}
	return config.DB.Save(&holding).Error
}

// 更新用户余额
func UpdateUserBalance(userID uint, ethDelta, usdtDelta float64) error {
	return config.DB.Model(&User{}).Where("id = ?", userID).
		UpdateColumns(map[string]interface{}{
			"eth_balance":  config.DB.Raw("eth_balance + ?", ethDelta),
			"usdt_balance": config.DB.Raw("usdt_balance + ?", usdtDelta),
		}).Error
}

// 更新代币价格
func UpdateTokenPrice(tokenID uint, newPrice, volume24h float64) error {
	return config.DB.Model(&Token{}).Where("id = ?", tokenID).
		Updates(map[string]interface{}{
			"price":      newPrice,
			"volume_24h": volume24h,
		}).Error
}

// 初始化默认代币
func InitDefaultTokens() {
	var count int64
	config.DB.Model(&Token{}).Count(&count)
	if count == 0 {
		defaultTokens := []Token{
			{Symbol: "CCT", Name: "Carbon Credit Token", Color: "#00C853", Price: 12.45, Change1h: 2.34, Change24h: 5.67, FDV: 1245000000, Volume24h: 456700000, Sparkline: "50,55,48,52,58,62,58,65,70,68,72,75,70,74,78,82,80,85,88,84,87,90,88,92", IsTopMover: false, IsNewListing: false, TotalSupply: 100000000, ContractAddr: "0x1234567890123456789012345678901234567890"},
			{Symbol: "CEA", Name: "Carbon Emission Allowance", Color: "#FF007A", Price: 8.92, Change1h: -1.23, Change24h: -3.45, FDV: 892000000, Volume24h: 234500000, Sparkline: "60,58,55,52,50,48,45,47,44,42,40,38,35,37,34,32,30,28,25,27,24,22,20,18", IsTopMover: false, IsNewListing: false, TotalSupply: 50000000, ContractAddr: "0x2345678901234567890123456789012345678901"},
			{Symbol: "GCT", Name: "Green Carbon Token", Color: "#00A3E0", Price: 24.78, Change1h: 0.89, Change24h: 12.34, FDV: 2478000000, Volume24h: 890100000, Sparkline: "45,48,52,55,58,62,68,72,75,78,82,85,88,90,92,95,92,94,96,98,95,97,99,100", IsTopMover: true, IsNewListing: false, TotalSupply: 200000000, ContractAddr: "0x3456789012345678901234567890123456789012"},
			{Symbol: "NCT", Name: "Nature Carbon Token", Color: "#7B61FF", Price: 5.67, Change1h: 3.21, Change24h: 8.90, FDV: 567000000, Volume24h: 345600000, Sparkline: "40,42,45,48,50,52,55,58,60,62,65,68,70,72,75,78,80,82,85,88,90,92,94,96", IsTopMover: true, IsNewListing: false, TotalSupply: 80000000, ContractAddr: "0x4567890123456789012345678901234567890123"},
			{Symbol: "BCT", Name: "Blue Carbon Token", Color: "#00BCD4", Price: 18.34, Change1h: -0.56, Change24h: -2.12, FDV: 1834000000, Volume24h: 678900000, Sparkline: "70,68,65,62,60,58,55,52,50,48,45,42,40,38,35,32,30,28,25,22,20,18,15,12", IsTopMover: false, IsNewListing: false, TotalSupply: 150000000, ContractAddr: "0x5678901234567890123456789012345678901234"},
			{Symbol: "RCT", Name: "Renewable Carbon Token", Color: "#FF9800", Price: 9.45, Change1h: 1.78, Change24h: 4.56, FDV: 945000000, Volume24h: 234500000, Sparkline: "50,52,55,58,60,62,65,68,70,72,75,78,80,82,85,88,90,92,94,96,98,100,98,96", IsTopMover: false, IsNewListing: false, TotalSupply: 60000000, ContractAddr: "0x6789012345678901234567890123456789012345"},
			{Symbol: "VCT", Name: "Verified Carbon Token", Color: "#4CAF50", Price: 31.20, Change1h: 5.67, Change24h: 15.89, FDV: 3120000000, Volume24h: 1234000000, Sparkline: "35,38,42,45,48,52,55,58,62,65,68,72,75,78,82,85,88,92,95,98,100,98,95,92", IsTopMover: true, IsNewListing: false, TotalSupply: 250000000, ContractAddr: "0x7890123456789012345678901234567890123456"},
			{Symbol: "SCT", Name: "Solar Carbon Token", Color: "#FFC107", Price: 7.89, Change1h: -2.34, Change24h: -5.67, FDV: 789000000, Volume24h: 456700000, Sparkline: "80,78,75,72,70,68,65,62,60,58,55,52,50,48,45,42,40,38,35,32,30,28,25,22", IsTopMover: false, IsNewListing: false, TotalSupply: 45000000, ContractAddr: "0x8901234567890123456789012345678901234567"},
			{Symbol: "OCN", Name: "Ocean Carbon Token", Color: "#006994", Price: 15.67, Change1h: 4.56, Change24h: 10.23, FDV: 1567000000, Volume24h: 567800000, Sparkline: "30,32,35,38,40,42,45,48,50,52,55,58,60,62,65,68,70,72,75,78,80,82,85,88", IsTopMover: true, IsNewListing: true, TotalSupply: 90000000, ContractAddr: "0x9012345678901234567890123456789012345678"},
			{Symbol: "FOR", Name: "Forest Carbon Token", Color: "#228B22", Price: 6.78, Change1h: 2.89, Change24h: 7.45, FDV: 678000000, Volume24h: 234500000, Sparkline: "40,42,45,48,50,52,55,58,60,62,65,68,70,72,75,78,80,82,85,88,90,92,94,96", IsTopMover: false, IsNewListing: true, TotalSupply: 70000000, ContractAddr: "0x0123456789012345678901234567890123456789"},
		}
		for _, token := range defaultTokens {
			config.DB.Create(&token)
		}
	}
}

// 初始化默认统计
func InitDefaultStats() {
	var count int64
	config.DB.Model(&Stats{}).Count(&count)
	if count == 0 {
		defaultStats := Stats{
			TotalVolume:           12450000000,
			TotalVolumeChange:     8.34,
			TotalValue:            892340000,
			TotalValueChange:      -2.15,
			ActiveTraders:         24567,
			ActiveTradersChange:   12.45,
			AvgTransaction:        45670000,
			AvgTransactionChange:  5.78,
			TotalCarbonCredits:    45670000,
			CarbonCreditsChange:   3.45,
		}
		config.DB.Create(&defaultStats)
	}
}
