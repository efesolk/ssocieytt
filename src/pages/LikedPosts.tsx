import React from 'react';
import { useAuth } from '../hooks/useAuth';

function LikedPosts() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Liked Posts</h1>
      <div className="grid gap-6">
        {/* Placeholder for liked posts */}
        <p className="text-gray-400">Your liked posts will appear here.</p>
      </div>
    </div>
  );
}

export default LikedPosts;