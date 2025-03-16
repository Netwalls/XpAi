'use client';

import ChatWrapper from '@/components/ChatWrapper';
import RouteGuard from '@/components/RouteGuard';

export default function ChatPage() {
  return (
    <RouteGuard>
      <ChatWrapper />
    </RouteGuard>
  );
} 