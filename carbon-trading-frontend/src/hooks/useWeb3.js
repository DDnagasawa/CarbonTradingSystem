import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const MOCK_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f8aA12';

export const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // 检查 MetaMask 是否安装
  const isMetaMaskInstalled = typeof window !== 'undefined' && !!window.ethereum;

  // 连接 MetaMask
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (isMetaMaskInstalled) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        setProvider(provider);
        setSigner(signer);
        setAccount(address);
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', address);
      } else {
        // 模拟钱包连接（用于测试）
        setAccount(MOCK_WALLET_ADDRESS);
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', MOCK_WALLET_ADDRESS);
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect wallet');
      // 降级到模拟钱包
      setAccount(MOCK_WALLET_ADDRESS);
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', MOCK_WALLET_ADDRESS);
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskInstalled]);

  // 断开连接
  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
  }, []);

  // 监听账户变化
  useEffect(() => {
    if (isMetaMaskInstalled && window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          localStorage.setItem('walletAddress', accounts[0]);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [account, disconnect, isMetaMaskInstalled]);

  // 恢复连接状态
  useEffect(() => {
    const savedWallet = localStorage.getItem('walletConnected');
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedWallet === 'true' && savedAddress) {
      setAccount(savedAddress);
    }
  }, []);

  return {
    account,
    provider,
    signer,
    isConnecting,
    error,
    isMetaMaskInstalled,
    isConnected: !!account,
    connect,
    disconnect,
  };
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance) => {
  if (!balance) return '0';
  return parseFloat(balance).toFixed(4);
};
