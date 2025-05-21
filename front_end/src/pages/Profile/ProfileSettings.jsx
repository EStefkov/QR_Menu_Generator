import React, { useState, useContext, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { AuthContext } from '../../contexts/AuthContext';
import { profileApi } from '../../api/profileApi';
import { HiPhotograph, HiCheckCircle, HiExclamationCircle, HiRefresh } from 'react-icons/hi';
import { setUserUpdatingFlag } from '../../api/account';
import ProfileImage from '../../components/ProfileImage';
import { joinPaths, getImageUrl } from '../../utils/urlUtils';

const ProfileSettings = ({ profileData, onUpdate }) => {
  const { t } = useLanguage();
  const { userData, updateUserData, setUserUpdating } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pictureUploadMode, setPictureUploadMode] = useState(false);
  
  // Add a function to force refresh profile data from backend
  const forceRefreshProfileData = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: 'Refreshing profile data...' });
      
      // Clear any profile cache to ensure we get fresh data
      localStorage.removeItem('profileDataCache');
      
      // Clear localStorage token validation timestamp to force a fresh fetch
      localStorage.removeItem('tokenValidatedAt');
      
      // Force fetch profile data from API, bypassing cache
      const freshProfileData = await profileApi.getUserProfile(true); // Pass true to bypass cache
      
      if (freshProfileData) {
        console.log('Refreshed profile data:', freshProfileData);
        
        // Update local state
        if (onUpdate) {
          onUpdate(freshProfileData);
        }
        
        // Trigger UI updates
        window.dispatchEvent(new Event('userDataUpdated'));
        
        setMessage({ type: 'success', text: 'Profile data refreshed successfully' });
      }
    } catch (error) {
      console.error('Error refreshing profile data:', error);
      setMessage({ type: 'error', text: 'Failed to refresh profile data: ' + error.message });
    } finally {
      setLoading(false);
    }
  };
  
  // Debug userData when it changes
  useEffect(() => {
    console.log("ProfileSettings - userData changed:", {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      mailAddress: userData.mailAddress,
      email: userData.email,
      createdAt: userData.createdAt // Log creation date
    });
  }, [userData]);
  
  // Get email from available sources
  const getEmailFromAvailableSources = () => {
    // First try userData
    if (userData.mailAddress) return userData.mailAddress;
    if (userData.email) return userData.email;
    
    // Then try localStorage 
    const localEmail = localStorage.getItem('mailAddress') || localStorage.getItem('email');
    if (localEmail) return localEmail;
    
    // Then try profileData
    if (profileData?.mailAddress) return profileData.mailAddress;
    if (profileData?.email) return profileData.email;
    
    // Fallback
    return '';
  };
  
  // Get phone from available sources
  const getPhoneFromAvailableSources = () => {
    // First try userData
    if (userData.phone) return userData.phone;
    
    // Then try profileData
    if (profileData?.phone) return profileData.phone;
    if (profileData?.number) return profileData.number;
    
    // Then try localStorage
    const localPhone = localStorage.getItem('phone') || localStorage.getItem('number');
    if (localPhone) return localPhone;
    
    // Fallback
    return '';
  };
  
  // Form states
  const [formData, setFormData] = useState({
    id: userData.id || localStorage.getItem('userId'),
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    email: getEmailFromAvailableSources(),
    phone: getPhoneFromAvailableSources(),
  });
  
  // Update form data when userData or profileData changes
  useEffect(() => {
    console.log("User data updated, refreshing form:", {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.mailAddress || userData.email,
      phone: userData.phone
    });
    
    setFormData(prev => ({
      ...prev,
      id: userData.id || localStorage.getItem('userId'),
      firstName: userData.firstName || prev.firstName,
      lastName: userData.lastName || prev.lastName,
      email: userData.mailAddress || userData.email || prev.email,
      phone: userData.phone || profileData?.phone || prev.phone
    }));
  }, [userData, profileData]);
  
  // Also load from localStorage on mount - one-time initialization as backup
  useEffect(() => {
    // Get email from localStorage directly
    const localEmail = localStorage.getItem('mailAddress') || localStorage.getItem('email');
    
    if (localEmail && !formData.email) {
      console.log("Loading email from localStorage:", localEmail);
      setFormData(prev => ({
        ...prev,
        email: localEmail
      }));
    }
    
    // Get phone from localStorage directly
    const localPhone = localStorage.getItem('phone') || localStorage.getItem('number');
    
    if (localPhone && !formData.phone) {
      console.log("Loading phone from localStorage:", localPhone);
      setFormData(prev => ({
        ...prev,
        phone: localPhone
      }));
    }
  }, [formData.email, formData.phone]);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const API_URL = import.meta.env.VITE_API_URL;
  
  // Function to get the current profile picture URL
  const getProfilePictureUrl = () => {
    if (previewUrl) {
      return previewUrl;
    }
    
    // Check for locally stored profile picture first (for customers with permission issues)
    const localProfilePic = localStorage.getItem('profilePictureLocal');
    if (localProfilePic && localProfilePic.startsWith('data:image')) {
      return localProfilePic;
    }
    
    // Then check for remote profile picture
    if (userData.profilePicture) {
      return userData.profilePicture.startsWith('data:image') ? 
        userData.profilePicture : 
        getImageUrl(userData.profilePicture);
    }
    
    // Default profile picture
    return joinPaths(API_URL, '/uploads/default_profile.png');
  };
  
  // Handle image loading error (403 Forbidden, etc.)
  const handleImageError = (e) => {
    console.log("Error loading profile image:", e);
    
    // Check if we have a local version to use instead
    const localProfilePic = localStorage.getItem('profilePictureLocal');
    if (localProfilePic && localProfilePic.startsWith('data:image')) {
      console.log("Using local profile picture due to error loading remote image");
      e.target.src = localProfilePic;
    } else {
      // Fallback to default
      e.target.src = joinPaths(API_URL, '/uploads/default_profile.png');
    }
  };
  
  // Add event listener for profile updates
  useEffect(() => {
    const handleDataUpdate = () => {
      // Check for new profile picture in localStorage
      const localProfilePic = localStorage.getItem('profilePictureLocal');
      if (localProfilePic && localProfilePic.startsWith('data:image')) {
        // Update preview with local data
        setPreviewUrl(localProfilePic);
      }
    };
    
    window.addEventListener('userDataUpdated', handleDataUpdate);
    return () => window.removeEventListener('userDataUpdated', handleDataUpdate);
  }, []);
  
  // Handle profile pic change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle profile info changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle password changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };
  
  // Handle uploading only profile picture
  const handleUploadProfilePicture = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    setUserUpdatingFlag(true);
    
    try {
      // Set flag to indicate we're only uploading a profile picture
      setPictureUploadMode(true);
      
      // Create form data for upload
      const formDataForUpload = new FormData();
      formDataForUpload.append('profilePicture', selectedFile);
      
      // Upload the profile picture
      const result = await profileApi.uploadProfilePicture(formDataForUpload);
      
      let updatedProfilePicture = null;
      
      // If the backend returns the updated profile picture path, use it
      if (result && result.profilePicture) {
        updatedProfilePicture = result.profilePicture;
        console.log("Profile picture updated successfully:", updatedProfilePicture);
        
        // Keep the preview URL for immediate visual feedback
        // Don't clear previewUrl here anymore
        
        // Update AuthContext user data with just the profile picture
        updateUserData({
          ...userData,
          profilePicture: updatedProfilePicture
        });
        
        // Update profile data if callback exists
        if (onUpdate) {
          onUpdate({
            ...profileData,
            profilePicture: updatedProfilePicture
          });
        }
      }
      
      // Clear only the selectedFile after successful upload, but keep the preview
      setSelectedFile(null);
      
      setMessage({ 
        type: 'success', 
        text: t('profile.profilePictureUpdated') || 'Profile picture updated successfully' 
      });
      
      // Trigger the userDataUpdated event again to ensure all components update
      window.dispatchEvent(new Event("userDataUpdated"));
      
    } catch (error) {
      console.error("Failed to update profile picture:", error);
      setMessage({ 
        type: 'error', 
        text: error.message || t('profile.profilePictureUpdateError') || 'Failed to update profile picture' 
      });
    } finally {
      setLoading(false);
      setPictureUploadMode(false);
      setUserUpdatingFlag(false);
    }
  };
  
  // Save profile info
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setUserUpdatingFlag(true);
    
    try {
      // Prepare the profile update data
      const profileUpdateData = {
        id: formData.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        mailAddress: formData.email, // Use email as mailAddress for backend
        email: formData.email, // Also include email field for frontend
        phone: formData.phone,
      };
      
      // Update profile through API
      const result = await profileApi.updateUserProfile(profileUpdateData);
      console.log("Profile update result:", result);
      
      let updatedProfilePicture = null;
      
      // Handle profile picture upload if selected
      if (selectedFile) {
        console.log("Uploading new profile picture");
        const formDataForUpload = new FormData();
        formDataForUpload.append('profilePicture', selectedFile);
        const result = await profileApi.uploadProfilePicture(formDataForUpload);
        
        // If the backend returns the updated profile picture path, use it
        if (result && result.profilePicture) {
          updatedProfilePicture = result.profilePicture;
          console.log("Profile picture updated successfully:", updatedProfilePicture);
          
          // Don't clear previewUrl here to keep the image visible
        }
      }
      
      // Always update localStorage with the new profile data
      localStorage.setItem("firstName", formData.firstName);
      localStorage.setItem("lastName", formData.lastName);
      localStorage.setItem("mailAddress", formData.email); // Set email as mailAddress
      localStorage.setItem("email", formData.email); // Also store as email
      localStorage.setItem("phone", formData.phone);
      
      // Preserve existing profile picture if not updating
      if (updatedProfilePicture && updatedProfilePicture !== null) {
        localStorage.setItem("profilePicture", updatedProfilePicture);
      }
      
      // Update context/state with new data
      if (onUpdate) {
        onUpdate({
          ...profileData,
          ...profileUpdateData,
          // Only update profile picture if a new one was uploaded
          profilePicture: updatedProfilePicture || profileData?.profilePicture
        });
      }
      
      // Update AuthContext user data
      updateUserData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        mailAddress: formData.email,
        email: formData.email,
        phone: formData.phone,
        // Only update profile picture if a new one was uploaded
        ...(updatedProfilePicture ? { profilePicture: updatedProfilePicture } : {})
      });
      
      // Use custom event instead of storage event
      window.dispatchEvent(new Event("userDataUpdated"));
      
      setMessage({ 
        type: 'success', 
        text: t('profile.profileUpdateSuccess') 
      });
      
      // Clear only the selectedFile after successful upload, but keep the preview
      if (selectedFile) {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage({ 
        type: 'error', 
        text: error.message || t('profile.profileUpdateError') 
      });
    } finally {
      setLoading(false);
      setUserUpdatingFlag(false);
    }
  };
  
  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: 'error',
        text: t('profile.passwordsDoNotMatch')
      });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: t('profile.passwordTooShort')
      });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await profileApi.changePassword(passwordData);
      setMessage({ 
        type: 'success', 
        text: t('profile.passwordChangeSuccess') 
      });
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
    } catch (error) {
      console.error('Error changing password:', error);
      // Show the exact error message from the backend if available
      setMessage({ 
        type: 'error', 
        text: error.message || t('profile.passwordChangeError') 
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('profile.settings')}
          </h2>
          <button 
            onClick={forceRefreshProfileData}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            <HiRefresh className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh') || 'Refresh'}
          </button>
        </div>
        
        {message.text && (
          <div className={`p-4 mb-6 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 
            'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
          }`}>
            {message.type === 'success' ? 
              <HiCheckCircle className="w-5 h-5 mr-2" /> : 
              <HiExclamationCircle className="w-5 h-5 mr-2" />
            }
            {message.text}
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-700 shadow rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('profile.personalInfo')}
          </h3>
          
          {/* Separate Profile Picture Form */}
          <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-600">
            <form onSubmit={handleUploadProfilePicture}>
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="relative">
                  {previewUrl ? (
                    <img 
                      src={previewUrl}
                      alt={`${userData.firstName} ${userData.lastName}`}
                      className="w-24 h-24 rounded-full border-4 border-blue-500 dark:border-blue-400 object-cover"
                    />
                  ) : (
                    <ProfileImage 
                      src={userData.profilePicture}
                      alt={`${userData.firstName} ${userData.lastName}`}
                      className="w-24 h-24 rounded-full border-4 border-blue-500 dark:border-blue-400 object-cover"
                    />
                  )}
                </div>
                
                <div className="flex flex-col space-y-3">
                  <label className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer transition inline-flex items-center">
                    <HiPhotograph className="w-5 h-5 mr-2" />
                    {t('profile.changePicture')}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                  
                  {selectedFile && (
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      {loading && pictureUploadMode ? t('loading') : t('profile.uploadPicture') || 'Upload Picture'}
                    </button>
                  )}
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('profile.pictureRequirements')}
                  </p>
                </div>
              </div>
            </form>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-6">    
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label 
                  htmlFor="firstName" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t('profile.firstName')}
                </label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
              
              {/* Last Name */}
              <div>
                <label 
                  htmlFor="lastName" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t('profile.lastName')}
                </label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
              
              {/* Email */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t('profile.email')}
                </label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              {/* Phone */}
              <div>
                <label 
                  htmlFor="phone" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t('profile.phone')}
                </label>
                <input 
                  type="text" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading && !pictureUploadMode}
                className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors ${
                  (loading && !pictureUploadMode) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {(loading && !pictureUploadMode) ? t('loading') : t('profile.saveChanges')}
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-white dark:bg-gray-700 shadow rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('profile.changePassword')}
          </h3>
          
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Password */}
              <div className="md:col-span-2">
                <label 
                  htmlFor="currentPassword" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t('profile.currentPassword')}
                </label>
                <input 
                  type="password" 
                  id="currentPassword" 
                  name="currentPassword" 
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
              
              {/* New Password */}
              <div>
                <label 
                  htmlFor="newPassword" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t('profile.newPassword')}
                </label>
                <input 
                  type="password" 
                  id="newPassword" 
                  name="newPassword" 
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                  minLength={6}
                />
              </div>
              
              {/* Confirm Password */}
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t('profile.confirmPassword')}
                </label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? t('loading') : t('profile.changePassword')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings; 