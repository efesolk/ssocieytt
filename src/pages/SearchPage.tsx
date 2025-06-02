import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { UserCard } from '../components/users/UserCard';
import { Input } from '../components/ui/Input';
import { Loading } from '../components/ui/Loading';
import { User } from '../types';

export function SearchPage() {
  const { user: currentUser } = useAuth();
  const { searchUsers, followUser, unfollowUser } = useUsers();
  const location = useLocation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const query = new URLSearchParams(location.search).get('q');
    if (query) {
      setSearchTerm(query);
      handleSearch(query);
    }
  }, [location.search]);
  
  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const results = await searchUsers(term);
      setSearchResults(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };
  
  const handleFollow = (userId: string) => {
    if (!currentUser) return;
    followUser(currentUser.uid, userId);
  };
  
  const handleUnfollow = (userId: string) => {
    if (!currentUser) return;
    unfollowUser(currentUser.uid, userId);
  };
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Search Players
          </h1>
          
          <form onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-5 w-5 text-slate-400" />}
              fullWidth
              className="bg-white dark:bg-slate-800"
            />
          </form>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}
        
        {loading ? (
          <Loading text="Searching..." />
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((user) => (
              <UserCard
                key={user.uid}
                user={user}
                currentUser={currentUser}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
              />
            ))}
          </div>
        ) : searchTerm ? (
          <div className="text-center py-12">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No users found
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Try a different search term or check the spelling
            </p>
          </div>
        ) : null}
      </main>
      
      <Footer />
    </div>
  );
}