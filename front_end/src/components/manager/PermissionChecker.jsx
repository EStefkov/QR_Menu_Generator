import { useState } from 'react';
import { checkAccountPermissions } from '../../api/adminDashboard';

const PermissionChecker = () => {
  const [loading, setLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [error, setError] = useState(null);

  const checkPermissions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const accountData = await checkAccountPermissions(token);
      setAccountInfo(accountData);
    } catch (err) {
      console.error('Permission check failed:', err);
      setError(err.message || 'Failed to check permissions');
    } finally {
      setLoading(false);
    }
  };

  // Print localStorage info
  const printLocalStorageInfo = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const accountType = localStorage.getItem('accountType');
    
    return (
      <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono overflow-x-auto">
        <p>User ID: {userId || 'Not found'}</p>
        <p>Account Type: {accountType || 'Not found'}</p>
        <p>Token exists: {token ? 'Yes' : 'No'}</p>
        {token && (
          <p>Token preview: {token.substring(0, 15)}...{token.substring(token.length - 10)}</p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Permission Diagnostic Tool</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">LocalStorage Info</h3>
        {printLocalStorageInfo()}
      </div>
      
      <button
        onClick={checkPermissions}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
      >
        {loading ? 'Checking...' : 'Check Account Permissions'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 rounded-lg">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {accountInfo && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Account Information</h3>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono overflow-x-auto">
            <pre>{JSON.stringify(accountInfo, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionChecker; 