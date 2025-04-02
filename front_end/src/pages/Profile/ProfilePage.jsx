import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../../api/profileApi';
import AdminProfileContent from './AdminProfileContent';
import UserProfileContent from './UserProfileContent';
import ProfileSettings from './ProfileSettings';
import { useLanguage } from '../../contexts/LanguageContext';
import { HiHome, HiChartPie, HiUser, HiCog, HiLogout } from 'react-icons/hi';

const ProfilePage = () => {
  const { userData, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isAdmin = userData?.accountType === 'ROLE_ADMIN';
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get real profile data, fallback to mock data if API not ready
        try {
          const result = await profileApi.getUserProfile();
          setProfileData(result);
        } catch (err) {
          console.log("Using mock profile data due to API error:", err);
          const profileDataResult = await profileApi.getMockUserProfile();
          setProfileData(profileDataResult);
        }
        
        // Fetch admin statistics if user is admin
        if (isAdmin) {
          try {
            const statsResult = await profileApi.getAdminStatistics();
            setAdminStats(statsResult);
          } catch (err) {
            console.log("Using mock admin stats due to API error:", err);
            const statsResult = await profileApi.getMockAdminStatistics();
            setAdminStats(statsResult);
          }
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [isAdmin]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (!userData || !userData.token) {
    navigate('/login');
    return null;
  }
  
  const getTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return isAdmin 
          ? <AdminProfileContent adminStats={adminStats} loading={loading} error={error} /> 
          : <UserProfileContent profileData={profileData} loading={loading} error={error} />;
      case 'settings':
        return <ProfileSettings profileData={profileData} onUpdate={setProfileData} />;
      default:
        return isAdmin 
          ? <AdminProfileContent adminStats={adminStats} loading={loading} error={error} /> 
          : <UserProfileContent profileData={profileData} loading={loading} error={error} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/4 lg:w-1/5">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <img 
                    src={userData.profilePicture ? `${import.meta.env.VITE_API_URL}${userData.profilePicture}` : `${import.meta.env.VITE_API_URL}/uploads/default_profile.png`}
                    alt={`${userData.firstName} ${userData.lastName}`}
                    className="w-24 h-24 rounded-full border-4 border-blue-500 dark:border-blue-400 object-cover"
                  />
                  <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full ${isAdmin ? 'bg-purple-500' : 'bg-green-500'} border-2 border-white dark:border-gray-800`}></span>
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-800 dark:text-white">
                  {userData.firstName} {userData.lastName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isAdmin ? t('profile.adminRole') : t('profile.userRole')}
                </p>
              </div>
              
              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center p-3 rounded-lg transition ${
                    activeTab === 'overview' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {isAdmin ? <HiChartPie className="w-5 h-5 mr-3" /> : <HiUser className="w-5 h-5 mr-3" />}
                  <span>{isAdmin ? t('profile.adminDashboard') : t('profile.overview')}</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center p-3 rounded-lg transition ${
                    activeTab === 'settings' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <HiCog className="w-5 h-5 mr-3" />
                  <span>{t('profile.settings')}</span>
                </button>
                
                <button 
                  onClick={() => navigate('/')}
                  className="w-full flex items-center p-3 rounded-lg transition text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <HiHome className="w-5 h-5 mr-3" />
                  <span>{t('nav_home')}</span>
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center p-3 mt-4 rounded-lg transition text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-30"
                >
                  <HiLogout className="w-5 h-5 mr-3" />
                  <span>{t('nav_logout')}</span>
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="w-full md:w-3/4 lg:w-4/5">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              {getTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 