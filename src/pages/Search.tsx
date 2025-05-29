import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, User, UserPlus, X, Code } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, startAt, endAt } from 'firebase/firestore';
import { firestore } from '../firebase/config';
import { User as UserType } from '../models/types';
import { useAuth } from '../hooks/useAuth';

const Search = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<UserType[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (error) {
        console.error('Error parsing recent searches:', error);
        // Reset if invalid
        localStorage.removeItem('recentSearches');
      }
    }
  }, []);

  // Handle search input changes
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      
      const usersRef = collection(firestore, 'users');
      
      // Create a query that searches for displayName or username that starts with the search term
      const q = query(
        usersRef,
        orderBy('username'),
        startAt(searchTerm.toLowerCase()),
        endAt(searchTerm.toLowerCase() + '\uf8ff')
      );
      
      const snapshot = await getDocs(q);
      const userResults = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as UserType))
        .filter(user => user.uid !== user?.uid); // Filter out current user
      
      setUsers(userResults);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Add user to recent searches
  const addToRecentSearches = (user: UserType) => {
    const updatedSearches = [
      user,
      ...recentSearches.filter(search => search.uid !== user.uid).slice(0, 4)
    ];
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  // Remove user from recent searches
  const removeFromRecentSearches = (userId: string) => {
    const updatedSearches = recentSearches.filter(user => user.uid !== userId);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  // Clear all recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-dark-700 w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {!searchTerm && recentSearches.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Recent</h2>
            <button
              onClick={clearRecentSearches}
              className="text-secondary-500 text-sm"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-3">
            {recentSearches.map(user => (
              <div key={user.uid} className="flex items-center justify-between">
                <Link
                  to={`/profile/${user.uid}`}
                  className="flex items-center flex-1"
                  onClick={() => addToRecentSearches(user)}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-dark-600">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">{user.displayName}</p>
                    <p className="text-gray-400 text-sm">@{user.username}</p>
                  </div>
                </Link>
                <button
                  onClick={() => removeFromRecentSearches(user.uid)}
                  className="text-gray-400 hover:text-white p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchTerm && (
        <div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="dot-flashing"></div>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              {users.map(user => (
                <Link
                  key={user.uid}
                  to={`/profile/${user.uid}`}
                  className="flex items-center justify-between p-3 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
                  onClick={() => addToRecentSearches(user)}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-dark-600">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">{user.displayName}</p>
                      <p className="text-gray-400 text-sm">@{user.username}</p>
                    </div>
                  </div>
                  <UserPlus className="h-5 w-5 text-gray-400" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Code size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400">No users found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}

      {!searchTerm && recentSearches.length === 0 && (
        <div className="text-center py-12">
          <SearchIcon size={48} className="mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-semibold mb-2">Search for developers</h3>
          <p className="text-gray-400">
            Find developers to follow and discover their code
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;