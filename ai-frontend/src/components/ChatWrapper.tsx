'use client';

import React from 'react';
import { AIChat } from './AIChat';
import { TokenBalances } from './TokenBalances';
import { WalletConnect } from './WalletConnect';

const ChatWrapper: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-white">Cross-Chain AI</h1>
            </div>
            <WalletConnect />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Transaction History */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-surface-dark shadow-glow border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
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
            <TokenBalances />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatWrapper; 