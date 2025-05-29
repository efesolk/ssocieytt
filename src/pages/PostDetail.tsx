import React from 'react';
import { useParams } from 'react-router-dom';

const PostDetail = () => {
  const { postId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-dark-700 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Post Details</h1>
          <p className="text-gray-300">Loading post {postId}...</p>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;