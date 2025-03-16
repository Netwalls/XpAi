'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
}

export default function CoinsPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoading(true);
        // Using the CoinGecko API with demo key
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&locale=en&x_cg_demo_api_key=CG-VCwYizPQtJJS2JhkHu7E2MsA'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch coin data');
        }
        
        const data = await response.json();
        setCoins(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching coin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  // Navigate directly to the chat page instead of using browser history
  const navigateToChat = () => {
    router.push('/chat');
  };

  const navigateToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-black border-b border-[#2c1810]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <button 
                onClick={navigateToHome} 
                className="group cursor-pointer block bg-transparent border-0 p-0 text-left"
              >
                <h1 className="text-xl font-bold text-white font-vanderleck tracking-wider group-hover:text-[#D2691E] transition-colors duration-300">AGENT. 1</h1>
                <div className="h-0.5 w-0 bg-[#D2691E] group-hover:w-full transition-all duration-300"></div>
              </button>
            </div>
            <button 
              onClick={navigateToChat}
              className="bg-[#2c1810] hover:bg-[#8B4513] text-white px-4 py-2 rounded-lg transition-colors duration-300"
            >
              Back to Chat
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Cryptocurrency Market</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D2691E]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-900 text-white p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="bg-[#111] shadow-lg border border-[#2c1810] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#2c1810]">
                <thead className="bg-black/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rank</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Coin</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">24h Change</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Market Cap</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Volume</th>
                  </tr>
                </thead>
                <tbody className="bg-black/20 divide-y divide-[#2c1810]">
                  {coins.map((coin) => (
                    <tr key={coin.id} className="hover:bg-[#2c1810]/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{coin.market_cap_rank}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            <Image 
                              src={coin.image} 
                              alt={coin.name} 
                              width={40} 
                              height={40} 
                              className="rounded-full"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{coin.name}</div>
                            <div className="text-sm text-gray-400">{coin.symbol.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">${coin.current_price.toLocaleString()}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        coin.price_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">${coin.market_cap.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">${coin.total_volume.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 