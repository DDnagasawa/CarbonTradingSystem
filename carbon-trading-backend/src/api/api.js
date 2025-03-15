// src/api/api.js

// 前端运行在 http://localhost:3000，后端运行在 http://localhost:5000
// 这是前端调用后端 API 的文件，包含所有与后端交互的函数

// 启动交易 API 调用
// 此函数通过 POST 请求将 tradeId 发送到后端，用于启动交易
export const startTrade = async (tradeId) => {
    try {
      // 调用后端的启动交易接口
      const response = await fetch("http://localhost:8000/api/start-trade", {
        method: "POST", // HTTP 方法 POST，用于发送数据
        headers: {
          "Content-Type": "application/json", // 告诉后端请求体是 JSON 格式
        },
        body: JSON.stringify({ tradeId }), // 将 tradeId 转换为 JSON 格式并作为请求体发送
      });
  
      // 如果响应状态码不是 2xx（表示请求失败），抛出错误
      if (!response.ok) {
        throw new Error("Failed to start trade");
      }
  
      // 返回后端的 JSON 数据（解析响应体）
      return await response.json();
    } catch (error) {
      // 如果请求过程中发生错误，打印错误信息，并向调用此函数的地方抛出错误
      console.error("Error starting trade:", error);
      throw error;
    }
  };
  
  // 获取交易状态 API 调用
  // 此函数通过 GET 请求从后端获取指定 tradeId 的交易状态
  export const getTradeStatus = async (tradeId) => {
    try {
      // 调用后端的获取交易状态接口
      const response = await fetch(`http://localhost:8000/api/trade-status/${tradeId}`, {
        method: "GET", // HTTP 方法 GET，用于从后端获取数据
      });
  
      // 如果响应状态码不是 2xx（表示请求失败），抛出错误
      if (!response.ok) {
        throw new Error("Failed to fetch trade status");
      }
  
      // 返回后端的 JSON 数据（解析响应体）
      return await response.json();
    } catch (error) {
      // 如果请求过程中发生错误，打印错误信息，并向调用此函数的地方抛出错误
      console.error("Error fetching trade status:", error);
      throw error;
    }
  };