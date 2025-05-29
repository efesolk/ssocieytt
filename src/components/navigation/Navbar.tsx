import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Home,
  Search,
  MessageSquare,
  Heart,
  User,
  LogOut,
  PlusSquare,
  Code
} from 'lucide-react';
import CreatePostModal from '../post/CreatePostModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'active-link' : '';
  };

  return (
    <>
      <nav className="fixed top-0 w-full bg-dark-900 border-b border-dark-700 z-30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <Code className="h-8 w-8 text-secondary-500 mr-2" />
              <span className="text-xl font-semibold">SSocieyt</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className={`navbar-link ${isActive('/')}`}>
                <Home className="h-6 w-6" />
              </Link>
              <Link to="/search" className={`navbar-link ${isActive('/search')}`}>
                <Search className="h-6 w-6" />
              </Link>
              <button 
                onClick={() => setShowCreatePost(true)}
                className="navbar-link"
              >
                <PlusSquare className="h-6 w-6" />
              </button>
              <Link to="/messages" className={`navbar-link ${isActive('/messages')}`}>
                <MessageSquare className="h-6 w-6" />
              </Link>
              <Link to="/liked" className={`navbar-link ${isActive('/liked')}`}>
                <Heart className="h-6 w-6" />
              </Link>
              <Link to={`/profile/${user?.uid}`} className={`navbar-link ${isActive(`/profile/${user?.uid}`)}`}>
                <User className="h-6 w-6" />
              </Link>
              <button onClick={handleLogout} className="navbar-link">
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 w-full bg-dark-900 border-t border-dark-700 z-30">
        <div className="grid grid-cols-5 h-16">
          <Link to="/" className={`flex items-center justify-center ${isActive('/')}`}>
            <Home className="h-6 w-6" />
          </Link>
          <Link to="/search" className={`flex items-center justify-center ${isActive('/search')}`}>
            <Search className="h-6 w-6" />
          </Link>
          <button 
            onClick={() => setShowCreatePost(true)}
            className="flex items-center justify-center"
          >
            <PlusSquare className="h-6 w-6" />
          </button>
          <Link to="/messages" className={`flex items-center justify-center ${isActive('/messages')}`}>
            <MessageSquare className="h-6 w-6" />
          </Link>
          <Link to={`/profile/${user?.uid}`} className={`flex items-center justify-center ${isActive(`/profile/${user?.uid}`)}`}>
            <User className="h-6 w-6" />
          </Link>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}
    </>
  );
};

export default Navbar;