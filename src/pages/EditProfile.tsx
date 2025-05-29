import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserById, updateUserProfile } from '../services/UserService';
import { User } from '../models/types';
import { User as UserIcon, Upload, Save, Loader } from 'lucide-react';

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<Partial<User>>({
    displayName: '',
    bio: '',
    photoURL: null,
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const userData = await getUserById(user.uid);
        
        if (userData) {
          setProfileData({
            displayName: userData.displayName || user.displayName || '',
            bio: userData.bio || '',
            photoURL: userData.photoURL || user.photoURL,
          });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setError(null);

      await updateUserProfile(user.uid, {
        displayName: profileData.displayName,
        bio: profileData.bio,
        profileImage: profileImage,
      });

      navigate(`/profile/${user.uid}`);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader className="animate-spin h-8 w-8 text-secondary-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-md p-4 mb-6 text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-dark-600 border-2 border-dark-500">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover" 
                />
              ) : profileData.photoURL ? (
                <img 
                  src={profileData.photoURL} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon size={40} className="text-gray-400" />
                </div>
              )}
            </div>
            <label 
              htmlFor="photo-upload" 
              className="absolute bottom-0 right-0 bg-secondary-600 p-2 rounded-full cursor-pointer hover:bg-secondary-700"
            >
              <Upload size={16} />
              <input 
                type="file" 
                id="photo-upload" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
          <p className="text-sm text-gray-400">
            Click the upload button to change your profile picture
          </p>
        </div>

        <div className="input-group">
          <label htmlFor="displayName" className="input-label">Display Name</label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={profileData.displayName}
            onChange={handleChange}
            className="w-full"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="bio" className="input-label">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={profileData.bio}
            onChange={handleChange}
            className="w-full min-h-[120px] resize-y"
            placeholder="Tell us about yourself..."
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="btn btn-outline mr-3"
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center">
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;