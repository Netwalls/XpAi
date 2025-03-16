'use client';

import React, { useEffect } from 'react';
import { AIChat } from './AIChat';
import { TokenBalances } from './TokenBalances';
import { WalletConnect } from './WalletConnect';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const ChatWrapper: React.FC = () => {
  const [account, setAccount] = React.useState<string | null>(null);
  const [balance, setBalance] = React.useState<string | null>(null);
  const [chainInfo, setChainInfo] = React.useState<{ nativeCurrency: { symbol: string } } | null>(null);
  const router = useRouter();

  // Add debugging to see what's happening
  useEffect(() => {
    console.log("Account state changed:", account);
  }, [account]);

  const handleWalletConnect = (address: string, walletBalance: string, walletChainInfo: any) => {
    console.log("Wallet connected:", address);
    setAccount(address);
    setBalance(walletBalance);
    setChainInfo(walletChainInfo);
  };

  const handleWalletDisconnect = () => {
    console.log("Wallet disconnect triggered");
    // Make sure we're clearing all state
    setAccount(null);
    setBalance(null);
    setChainInfo(null);
  };
  
  const navigateToCoins = () => {
    router.push('/coins');
  };

  // Add a direct navigation function for debugging
  const navigateToHome = () => {
    console.log("Navigating to home...");
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-black border-b border-[#2c1810]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              {/* Option 1: Use Link component */}
              {/* 
              <Link href="/" className="group cursor-pointer block">
                <h1 className="text-xl font-bold text-white font-vanderleck tracking-wider group-hover:text-[#D2691E] transition-colors duration-300">AGENT. 1</h1>
                <div className="h-0.5 w-0 bg-[#D2691E] group-hover:w-full transition-all duration-300"></div>
              </Link>
              */}
              
              {/* Option 2: Use button with onClick if Link doesn't work */}
              <button 
                onClick={navigateToHome} 
                className="group cursor-pointer block bg-transparent border-0 p-0 text-left"
              >
                <h1 className="text-xl font-bold text-white font-vanderleck tracking-wider group-hover:text-[#D2691E] transition-colors duration-300">AGENT. 1</h1>
                <div className="h-0.5 w-0 bg-[#D2691E] group-hover:w-full transition-all duration-300"></div>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {/* Coins Button */}
              <button 
                onClick={navigateToCoins}
                className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
                </svg>
                Coins
              </button>
              
              {/* Wallet Connect Button */}
              <WalletConnect 
                onWalletConnect={handleWalletConnect}
                onWalletDisconnect={handleWalletDisconnect}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Transaction History */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-[#111] shadow-lg border border-[#2c1810] rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-medium text-white mb-4">Recent Transactions</h2>
              <div className="space-y-3">
                <p className="text-sm text-gray-400">No recent transactions</p>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-6">
            <AIChat />
          </div>

          {/* Right Sidebar - Token Balances */}
          <div className="lg:col-span-3 space-y-6">
            <TokenBalances 
              account={account}
              balance={balance}
              chainInfo={chainInfo}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatWrapper;