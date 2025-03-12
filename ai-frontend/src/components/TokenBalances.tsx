'use client';

import React from 'react';
import { ethers } from 'ethers';

interface TokenBalancesProps {
  account: string | null;
  balance: string | null;
  chainInfo: {
    nativeCurrency: {
      symbol: string;
    };
  } | null;
}

export const TokenBalances: React.FC<TokenBalancesProps> = ({ account, balance, chainInfo }) => {
  return (
    <div className="bg-surface-dark shadow-glow border border-surface-border rounded-xl p-6 backdrop-blur-sm">
      <h2 className="text-lg font-medium text-white mb-4">Token Balances</h2>
      <div className="space-y-3">
        {!account ? (
          <p className="text-sm text-gray-400">Connect wallet to view balances</p>
        ) : (
          <div className="space-y-4">
            {/* Native Token Balance */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {chainInfo?.nativeCurrency.symbol || 'ETH'}
                  </span>
                </div>
                <span className="text-white">
                  {chainInfo?.nativeCurrency.symbol || 'ETH'}
                </span>
              </div>
              <span className="text-white font-medium">
                {balance ? Number(balance).toFixed(4) : '0.0000'}
              </span>
            </div>
            
            {/* Placeholder for other tokens */}
            <div className="text-sm text-gray-400 text-center mt-4">
              Other tokens will appear here
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 