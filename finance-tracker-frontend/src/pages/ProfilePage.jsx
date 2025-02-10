import React, { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuth } from '@/hooks/useAuth';
import { api, mediaURL } from '@/services/api';
import { TrashIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    profile_picture: null,
    currency_preference: user?.currency_preference || 'USD',
    email_notifications: user?.email_notifications || false,
    remove_profile_picture: false
  });

  // Load user data on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await api.auth.getProfile();
        setFormData(prev => ({
          ...prev,
          ...response.data,
          profile_picture: null,
          remove_profile_picture: false
        }));
      } catch (err) {
        setError('Failed to load profile data');
      }
    };
    loadUserProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && 
            key !== 'profile_picture' && key !== 'remove_profile_picture') {
          if (typeof formData[key] === 'boolean') {
            data.append(key, formData[key].toString());
          } else if (formData[key] !== '') {
            const value = typeof formData[key] === 'string' ? formData[key].trim() : formData[key];
            data.append(key, value.toString());
          }
        }
      });

      if (formData.profile_picture instanceof File) {
        data.append('profile_picture', formData.profile_picture);
      }

      if (formData.remove_profile_picture) {
        data.append('remove_profile_picture', 'true');
      }

      const response = await api.users.updateProfile(data);
      setSuccess('Profile updated successfully');
      
      if (typeof updateUser === 'function') {
        updateUser(response.data);
      }

      setFormData(prev => ({
        ...prev,
        profile_picture: null,
        remove_profile_picture: false
      }));
    } catch (err) {
      const errorMessage = 
        err.response?.data?.details?.profile_picture?.[0] || 
        err.response?.data?.details?.error ||
        err.response?.data?.error ||
        err.response?.data?.message || 
        'Failed to update profile';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({ 
        ...prev, 
        profile_picture: file,
        remove_profile_picture: false
      }));
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      profile_picture: null,
      remove_profile_picture: true
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' /%3E%3C/svg%3E";

  const getImageUrl = (profilePicture) => {
    if (!profilePicture || formData.remove_profile_picture) {
      return defaultAvatar;
    }

    if (profilePicture instanceof File) {
      return URL.createObjectURL(profilePicture);
    }

    if (typeof profilePicture === 'string') {
      if (profilePicture.startsWith('http')) {
        return profilePicture;
      }
      const path = profilePicture
        .replace(/^\/?(api\/)?/, '')
        .replace(/^media\//, '')
        .replace(/^\/+/, '');
      return `${mediaURL}/media/${path}`;
    }

    return defaultAvatar;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Profile Settings</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <img
              src={getImageUrl(formData.profile_picture)}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover bg-gray-100 dark:bg-gray-800"
            />
            {(user?.profile_picture || formData.profile_picture) && !formData.remove_profile_picture && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute bottom-0 right-0 p-1 bg-red-100 dark:bg-red-900 rounded-full text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          <div>
            <input
              type="file"
              id="profile_picture"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="profile_picture"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserCircleIcon className="w-5 h-5 mr-2" />
              Change Picture
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
          />
          <Input
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <Input
            label="Phone Number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Currency Preference
            </label>
            <select
              name="currency_preference"
              value={formData.currency_preference}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="email_notifications"
              name="email_notifications"
              checked={formData.email_notifications}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="email_notifications" className="text-sm text-gray-700 dark:text-gray-300">
              Receive Email Notifications
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};