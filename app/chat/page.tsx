'use client';

import React from 'react';
import RouteGuard from '@/components/RouteGuard';

const ChatPage = () => {
  return (
    <RouteGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">AI Chat</h1>
          {/* Add your chat interface components here */}
        </div>
      </div>
    </RouteGuard>
  );
};

export default ChatPage; 