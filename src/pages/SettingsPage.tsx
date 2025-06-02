import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User as UserIcon, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Loading } from '../components/ui/Loading';

export function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { updateUserProfile } = useUsers();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [valorantUsername, setValorantUsername] = useState('');
  const [csgoUsername, setCsgoUsername] = useState('');
  const [apexUsername, setApexUsername] = useState('');
  const [fortniteUsername, setFortniteUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);
  
  // Set initial form values
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setBio(user.bio || '');
      setIsPrivate(user.isPrivate);
      
      if (user.gameUsernames) {
        setValorantUsername(user.gameUsernames.valorant || '');
        setCsgoUsername(user.gameUsernames.csgo || '');
        setApexUsername(user.gameUsernames.apex || '');
        setFortniteUsername(user.gameUsernames.fortnite || '');
      }
    }
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);
      
      const success = await updateUserProfile(user.uid, {
        displayName,
        bio,
        isPrivate,
        gameUsernames: {
          valorant: valorantUsername,
          csgo: csgoUsername,
          apex: apexUsername,
          fortnite: fortniteUsername,
        },
      });
      
      if (success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading || !user) {
    return <Loading fullScreen text="Loading settings..." />;
  }
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Settings
        </h1>
        
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Profile Settings
            </h2>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                Profile updated successfully!
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                <div className="relative">
                  <Avatar
                    src={user.photoURL}
                    alt={user.displayName}
                    size="xl"
                    className="ring-2 ring-slate-200 dark:ring-slate-700"
                  />
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 p-1 rounded-full bg-red-600 text-white shadow-sm"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex-1 space-y-4">
                  <Input
                    label="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    leftIcon={<UserIcon className="h-5 w-5 text-slate-400" />}
                    fullWidth
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3 py-2 text-slate-900 dark:text-white bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 rounded"
                    />
                    <label
                      htmlFor="isPrivate"
                      className="text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                      <span className="flex items-center">
                        <Shield className="h-4 w-4 mr-1" />
                        Private Account
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                  Game Usernames
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Valorant"
                    value={valorantUsername}
                    onChange={(e) => setValorantUsername(e.target.value)}
                    placeholder="Your Valorant username"
                  />
                  
                  <Input
                    label="CS:GO"
                    value={csgoUsername}
                    onChange={(e) => setCsgoUsername(e.target.value)}
                    placeholder="Your CS:GO username"
                  />
                  
                  <Input
                    label="Apex Legends"
                    value={apexUsername}
                    onChange={(e) => setApexUsername(e.target.value)}
                    placeholder="Your Apex Legends username"
                  />
                  
                  <Input
                    label="Fortnite"
                    value={fortniteUsername}
                    onChange={(e) => setFortniteUsername(e.target.value)}
                    placeholder="Your Fortnite username"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}