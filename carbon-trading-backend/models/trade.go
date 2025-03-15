package models

import "carbon-trading-backend/config"

// Trade 模型
type Trade struct {
	ID       uint   `gorm:"primaryKey"`
	TradeID  string `gorm:"unique;not null" json:"tradeId"`
	Amount   int    `gorm:"not null" json:"amount"`
	Currency string `gorm:"not null" json:"currency"`
}

// 创建交易记录
func CreateTrade(trade *Trade) error {
	return config.DB.Create(trade).Error
}
