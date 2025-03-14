'use client';

import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

declare global {
  interface Window {
    ethereum?: any
  }
}

export interface ChainInfo {
  id: number;
  name: string;
  nativeCurrency: {
    symbol: string;
  };
}

interface WalletConnectProps {
  onWalletConnect?: (address: string, balance: string, chainInfo: any) => void;
  onWalletDisconnect?: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onWalletConnect, onWalletDisconnect }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await provider.listAccounts()
          
          if (accounts.length > 0) {
            const address = accounts[0].address
            setAccount(address)
            
            if (onWalletConnect) {
              const balance = await provider.getBalance(address)
              const network = await provider.getNetwork()
              const chainInfo = {
                nativeCurrency: {
                  symbol: network.name === 'sepolia' ? 'SEP' : 'ETH'
                }
              }
              onWalletConnect(address, ethers.formatEther(balance), chainInfo)
            }
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error)
        }
      }
    }
    
    checkConnection()
  }, [onWalletConnect])

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsConnecting(true)
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send("eth_requestAccounts", [])
        const address = accounts[0]
        setAccount(address)
        
        if (onWalletConnect) {
          const balance = await provider.getBalance(address)
          const network = await provider.getNetwork()
          const chainInfo = {
            nativeCurrency: {
              symbol: network.name === 'sepolia' ? 'SEP' : 'ETH'
            }
          }
          onWalletConnect(address, ethers.formatEther(balance), chainInfo)
        }
      } catch (error) {
        console.error('Error connecting wallet:', error)
      } finally {
        setIsConnecting(false)
      }
    } else {
      alert('Please install MetaMask to connect your wallet')
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    if (onWalletDisconnect) {
      onWalletDisconnect()
    }
  }

  return (
    <div>
      {account ? (
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 rounded-lg bg-[#111] border border-[#2c1810] text-gray-400 text-sm">
            {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </div>
          <button 
            onClick={disconnectWallet}
            className="bg-[#2c1810] hover:bg-[#8B4513] text-white px-4 py-2 rounded-lg transition-colors duration-300"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button 
          onClick={connectWallet}
          disabled={isConnecting}
          className="relative group bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 overflow-hidden"
        >
          <span className="relative z-10">
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#D2691E] to-[#8B4513] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      )}
    </div>
  )
} 