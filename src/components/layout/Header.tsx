import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Bell, MessageSquare, Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className="h-8 w-8 rounded-md bg-red-600 flex items-center justify-center mr-2">
            <span className="text-white font-bold">ss</span>
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white hidden sm:block">
            ssocieyt
          </span>
        </Link>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="w-full relative">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-slate-500" />}
              fullWidth
              className="bg-slate-100 dark:bg-slate-800 border-0"
            />
          </div>
        </form>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/notifications\" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <Bell className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              </Link>
              <Link to="/messages" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <MessageSquare className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-slate-200" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-700" />
                )}
              </button>
              <Link to={`/profile/${user.uid}`}>
                <Avatar src={user.photoURL} alt={user.displayName} size="sm" />
              </Link>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/login')}
              >
                Log In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-slate-700 dark:text-slate-200" />
          ) : (
            <Menu className="h-6 w-6 text-slate-700 dark:text-slate-200" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <div className="container mx-auto px-4 py-3 space-y-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4 text-slate-500" />}
                fullWidth
                className="bg-slate-100 dark:bg-slate-800 border-0"
              />
            </form>

            <div className="flex flex-col space-y-2">
              {user ? (
                <>
                  <Link
                    to={`/profile/${user.uid}`}
                    className="flex items-center px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-3 text-slate-700 dark:text-slate-200" />
                    <span className="text-slate-700 dark:text-slate-200">Profile</span>
                  </Link>
                  <Link
                    to="/notifications"
                    className="flex items-center px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Bell className="h-5 w-5 mr-3 text-slate-700 dark:text-slate-200" />
                    <span className="text-slate-700 dark:text-slate-200">Notifications</span>
                  </Link>
                  <Link
                    to="/messages"
                    className="flex items-center px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageSquare className="h-5 w-5 mr-3 text-slate-700 dark:text-slate-200" />
                    <span className="text-slate-700 dark:text-slate-200">Messages</span>
                  </Link>
                  <button
                    onClick={() => {
                      toggleTheme();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="h-5 w-5 mr-3 text-slate-200" />
                        <span className="text-slate-200">Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="h-5 w-5 mr-3 text-slate-700" />
                        <span className="text-slate-700">Dark Mode</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <LogOut className="h-5 w-5 mr-3 text-red-600 dark:text-red-500" />
                    <span className="text-red-600 dark:text-red-500">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                    fullWidth
                    variant="outline"
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/signup');
                      setIsMenuOpen(false);
                    }}
                    fullWidth
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};