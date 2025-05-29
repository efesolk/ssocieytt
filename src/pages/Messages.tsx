import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Messages = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <div className="bg-dark-700 rounded-lg p-6">
        <div className="space-y-4">
          {/* Placeholder for when there are no messages */}
          <div className="text-center py-8">
            <p className="text-gray-400">No messages yet</p>
            <p className="text-sm text-gray-500 mt-2">
              When you start conversations with other users, they'll appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;