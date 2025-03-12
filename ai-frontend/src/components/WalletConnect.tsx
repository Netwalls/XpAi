'use client';

import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

declare global {
  interface Window {
    ethereum?: any
  }
}

interface ChainInfo {
  id: number;
  name: string;
  nativeCurrency: {
    symbol: string;
  };
}

interface WalletConnectProps {
  onWalletConnect?: (account: string, balance: string, chainInfo: ChainInfo) => void;
  onWalletDisconnect?: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onWalletConnect, onWalletDisconnect }) => {
  const [account, setAccount] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState(false)

  const getChainInfo = async (provider: ethers.BrowserProvider) => {
    const network = await provider.getNetwork()
    const chainId = Number(network.chainId)
    let name = network.name
    let symbol = 'ETH'

    // Add chain info mapping
    const chainMap: Record<number, { name: string; symbol: string }> = {
      1: { name: 'Ethereum Mainnet', symbol: 'ETH' },
      5: { name: 'Goerli', symbol: 'ETH' },
      11155111: { name: 'Sepolia', symbol: 'ETH' },
      // Add more chains as needed
    }

    if (chainMap[chainId]) {
      name = chainMap[chainId].name
      symbol = chainMap[chainId].symbol
    }

    return {
      id: chainId,
      name,
      nativeCurrency: { symbol }
    }
  }

  const updateWalletInfo = async (provider: ethers.BrowserProvider, address: string) => {
    try {
      const balance = await provider.getBalance(address)
      const chainInfo = await getChainInfo(provider)
      onWalletConnect?.(address, ethers.formatEther(balance), chainInfo)
    } catch (error) {
      console.error('Error updating wallet info:', error)
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!')
      return
    }

    try {
      setIsConnecting(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])
      const address = accounts[0]
      setAccount(address)
      await updateWalletInfo(provider, address)

      // Listen for account changes
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          await updateWalletInfo(provider, accounts[0])
        } else {
          setAccount('')
          onWalletDisconnect?.()
        }
      })

      // Listen for chain changes
      window.ethereum.on('chainChanged', async () => {
        const newProvider = new ethers.BrowserProvider(window.ethereum)
        if (account) {
          await updateWalletInfo(newProvider, account)
        }
      })

    } catch (error) {
      console.error('Error connecting wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div>
      {!account ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-surface-dark text-white px-6 py-2 rounded-xl hover:bg-surface-hover transition-colors disabled:bg-surface-dark/50 border border-gray-800"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="flex items-center space-x-2 bg-surface-dark/80 px-4 py-2 rounded-xl border border-gray-800">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm font-medium text-white">
            {formatAddress(account)}
          </span>
        </div>
      )}
    </div>
  )
} 