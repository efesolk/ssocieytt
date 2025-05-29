import { Link } from 'react-router-dom';
import { ArrowLeft, Code } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-dark-900">
      <Code size={60} className="text-secondary-500 mb-6" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-xl text-gray-400 mb-8">Page not found</p>
      <p className="text-center text-gray-500 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary flex items-center">
        <ArrowLeft size={16} className="mr-2" />
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;