const API_BASE_URL = 'http://localhost:8000';

export const fetchDashboard = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard`);
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    throw error;
  }
};

export const fetchTokens = async (tab = 'Tokens') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tokens?tab=${encodeURIComponent(tab)}`);
    if (!response.ok) throw new Error('Failed to fetch tokens');
    return await response.json();
  } catch (error) {
    console.error('Error fetching tokens:', error);
    throw error;
  }
};

export const fetchTokenById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tokens/${id}`);
    if (!response.ok) throw new Error('Failed to fetch token');
    return await response.json();
  } catch (error) {
    console.error('Error fetching token:', error);
    throw error;
  }
};

export const fetchStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

export const fetchTrades = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/trades`);
    if (!response.ok) throw new Error('Failed to fetch trades');
    return await response.json();
  } catch (error) {
    console.error('Error fetching trades:', error);
    throw error;
  }
};

// 用户相关 API
export const getUser = async (walletAddress) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user?walletAddress=${walletAddress}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const getUserHoldings = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/holdings?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch holdings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching holdings:', error);
    throw error;
  }
};

export const getUserOrders = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/orders?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// 订单相关 API
export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create order');
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
      method: 'PUT',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to cancel order');
    return data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

// 创建代币
export const createToken = async (tokenData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenData),
    });
    if (!response.ok) throw new Error('Failed to create token');
    return await response.json();
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
};

// 更新代币
export const updateToken = async (id, tokenData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tokens/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenData),
    });
    if (!response.ok) throw new Error('Failed to update token');
    return await response.json();
  } catch (error) {
    console.error('Error updating token:', error);
    throw error;
  }
};
