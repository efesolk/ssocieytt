import { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoadingScreen from './components/LoadingScreen';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import Search from './pages/Search';
import NotFound from './pages/NotFound';
import LikedPosts from './pages/LikedPosts';
import PostDetail from './pages/PostDetail';

// Components
import Navbar from './components/navigation/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user, loading } = useAuth();
  const [initialLoading, setInitialLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Simulate initial loading (min 1.5 seconds)
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (initialLoading || loading) {
    return <LoadingScreen />;
  }

  // Check if the current route is auth-related
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-dark-800 text-white">
      {user && !isAuthRoute && <Navbar />}
      
      <main className={`${user && !isAuthRoute ? 'pt-16' : ''}`}>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          
          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/messages/:chatId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/liked" element={<ProtectedRoute><LikedPosts /></ProtectedRoute>} />
          <Route path="/post/:postId" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;