'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setIsConnected(true);
          } else {
            router.replace('/');
          }
        } catch (error) {
          console.error('Error checking wallet:', error);
          router.replace('/');
        }
      } else {
        router.replace('/');
      }
      setLoading(false);
    };

    checkWallet();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D2691E]"></div>
      </div>
    );
  }

  return isConnected ? <>{children}</> : null;
};

export default RouteGuard; 