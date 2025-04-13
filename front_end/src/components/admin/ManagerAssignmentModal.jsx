import { useState, useEffect } from 'react';
import { HiX, HiExclamationCircle } from 'react-icons/hi';
import { useLanguage } from '../../contexts/LanguageContext';

// Import the manager assignment functions from the .jsx file
import { 
  assignManagerToRestaurant, 
  getManagerAssignments, 
  removeManagerAssignment,
  batchAssignRestaurantsToManager,
  getAvailableManagers
} from '../../api/adminDashboard.jsx';

const ManagerAssignmentModal = ({ 
  isOpen, 
  onClose, 
  managers = [], 
  restaurants = [],
  existingAssignments = []
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedManager, setSelectedManager] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [assignments, setAssignments] = useState(existingAssignments);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [availableManagers, setAvailableManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Initialize with passed-in assignments
      setAssignments(existingAssignments);
      setSelectedManager('');
      setSelectedRestaurant('');
      setSelectedRestaurants([]);
      setIsBatchMode(false);
      setError(null);
      setSuccess(null);
      
      // Fetch available managers (accounts with ROLE_MANAGER)
      fetchAvailableManagers();
    }
  }, [isOpen, existingAssignments]);

  const fetchAvailableManagers = async () => {
    setLoadingManagers(true);
    try {
      const token = localStorage.getItem('token');
      const managersData = await getAvailableManagers(token);
      setAvailableManagers(managersData);
    } catch (err) {
      console.error('Error fetching available managers:', err);
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedManager) {
      setError(t('admin.selectManager') || 'Please select a manager');
      return;
    }

    if (isBatchMode) {
      // Batch mode - multiple restaurant assignment
      if (selectedRestaurants.length === 0) {
        setError(t('admin.selectAtLeastOneRestaurant') || 'Please select at least one restaurant');
        return;
      }
      
      handleBatchAssignment();
    } else {
      // Single assignment mode
      if (!selectedRestaurant) {
        setError(t('admin.selectRestaurant') || 'Please select a restaurant');
        return;
      }
      
      // Check if this assignment already exists
      const exists = assignments.some(
        a => a.managerId.toString() === selectedManager && a.restaurantId.toString() === selectedRestaurant
      );

      if (exists) {
        setError(t('admin.assignmentExists') || 'This manager is already assigned to this restaurant');
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const token = localStorage.getItem('token');
        const result = await assignManagerToRestaurant(token, selectedManager, selectedRestaurant);
        
        // Add the new assignment to the list
        setAssignments(prev => [
          ...prev, 
          { 
            id: result.id,
            managerId: selectedManager,
            restaurantId: selectedRestaurant,
            managerName: managers.find(m => m.id.toString() === selectedManager)?.firstName + ' ' + 
                        managers.find(m => m.id.toString() === selectedManager)?.lastName,
            restaurantName: restaurants.find(r => r.id.toString() === selectedRestaurant)?.restorantName ||
                          restaurants.find(r => r.id.toString() === selectedRestaurant)?.name,
            assignedBy: result.assignedBy,
            assignedByName: result.assignedByName || 'Unknown admin',
            assignedAt: result.assignedAt
          }
        ]);
        
        setSuccess(t('admin.managerAssigned') || 'Manager successfully assigned to restaurant');
        setSelectedManager('');
        setSelectedRestaurant('');
      } catch (err) {
        console.error('Error assigning manager:', err);
        setError(err.message || t('admin.assignmentError') || 'Error assigning manager to restaurant');
      } finally {
        setLoading(false);
      }
    }
  };

  // New function to handle batch assignment
  const handleBatchAssignment = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      console.log('Starting batch assignment with:', { 
        managerId: selectedManager, 
        restaurantIds: selectedRestaurants,
        restaurantNames: selectedRestaurants.map(id => 
          restaurants.find(r => r.id.toString() === id.toString())?.restorantName || 
          restaurants.find(r => r.id.toString() === id.toString())?.name || 
          'Unknown'
        )
      });
      
      const result = await batchAssignRestaurantsToManager(token, selectedManager, selectedRestaurants);
      console.log('Batch assignment successful:', result);
      
      // Update the assignments list with the new assignments
      if (result && result.assignments) {
        // Append new assignments to the existing list
        const newAssignments = [...assignments];
        
        result.assignments.forEach(assignment => {
          // Check if this assignment already exists in the list
          const exists = newAssignments.some(a => a.id === assignment.id);
          if (!exists) {
            newAssignments.push(assignment);
          }
        });
        
        setAssignments(newAssignments);
      }
      
      setSuccess(t('admin.managersAssignedBatch') || `Manager successfully assigned to ${selectedRestaurants.length} restaurants`);
      setSelectedRestaurants([]);
      setSelectedManager('');
    } catch (err) {
      console.error('Error batch assigning restaurants:', err);
      let errorMessage = '';
      
      if (err.message && err.message.includes('Error assigning restaurants')) {
        // Extract the specific error message after the colon
        const colonIndex = err.message.indexOf(':');
        errorMessage = colonIndex > -1 ? err.message.substring(colonIndex + 1).trim() : err.message;
      } else {
        errorMessage = err.message || t('admin.batchAssignmentError') || 'Error assigning restaurants to manager';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle a restaurant selection in batch mode
  const toggleRestaurantSelection = (restaurantId) => {
    setSelectedRestaurants(prev => {
      if (prev.includes(restaurantId)) {
        // Remove from selection
        return prev.filter(id => id !== restaurantId);
      } else {
        // Add to selection
        return [...prev, restaurantId];
      }
    });
  };

  // Function to toggle between single and batch modes
  const toggleBatchMode = () => {
    setIsBatchMode(prev => !prev);
    setSelectedRestaurant('');
    setSelectedRestaurants([]);
    setError(null);
    setSuccess(null);
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!window.confirm(t('admin.confirmRemoveAssignment') || 'Are you sure you want to remove this assignment?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      await removeManagerAssignment(token, assignmentId);
      
      // Remove the assignment from the list
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      setSuccess(t('admin.assignmentRemoved') || 'Manager assignment removed successfully');
    } catch (err) {
      console.error('Error removing assignment:', err);
      setError(err.message || t('admin.removeAssignmentError') || 'Error removing manager assignment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {t('admin.manageManagerAssignments') || 'Manage Manager Assignments'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Feedback messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md flex items-center">
              <HiExclamationCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md">
              {success}
            </div>
          )}

          {/* Assignment form */}
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-800 dark:text-white">
                {t('admin.newAssignment') || 'New Assignment'}
              </h3>
              <button
                type="button"
                onClick={toggleBatchMode}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {isBatchMode 
                  ? (t('admin.switchToSingleMode') || 'Switch to Single Assignment') 
                  : (t('admin.switchToBatchMode') || 'Switch to Batch Assignment')}
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-4">
              {/* Manager selection */}
              <div>
                <label htmlFor="manager" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.selectManager') || 'Select Manager'}
                </label>
                <select
                  id="manager"
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={loading || loadingManagers}
                >
                  <option value="">{t('admin.selectManager') || 'Select Manager'}</option>
                  {loadingManagers ? (
                    <option disabled>{t('admin.loadingManagers') || 'Loading managers...'}</option>
                  ) : availableManagers.length > 0 ? (
                    availableManagers.map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.firstName} {manager.lastName} ({manager.mailAddress})
                      </option>
                    ))
                  ) : (
                    <option disabled>{t('admin.noManagersAvailable') || 'No managers available'}</option>
                  )}
                </select>
                {availableManagers.length === 0 && !loadingManagers && (
                  <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">
                    {t('admin.createManagersFirst') || 'Create accounts with Manager role first'}
                  </p>
                )}
              </div>
            </div>
            
            {/* Single restaurant selection */}
            {!isBatchMode && (
              <div className="mb-4">
                <label htmlFor="restaurant" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.selectRestaurant') || 'Select Restaurant'}
                </label>
                <select
                  id="restaurant"
                  value={selectedRestaurant}
                  onChange={(e) => setSelectedRestaurant(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={loading}
                >
                  <option value="">{t('admin.selectRestaurant') || 'Select Restaurant'}</option>
                  {restaurants.length > 0 ? (
                    restaurants.map(restaurant => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.restorantName || restaurant.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>{t('admin.noRestaurantsAvailable') || 'No restaurants available'}</option>
                  )}
                </select>
              </div>
            )}
            
            {/* Multiple restaurant selection (batch mode) */}
            {isBatchMode && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.selectRestaurants') || 'Select Restaurants'} 
                  <span className="text-xs ml-2 text-gray-500 dark:text-gray-400">
                    ({selectedRestaurants.length} {t('admin.selected') || 'selected'})
                  </span>
                </label>
                
                <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                  {restaurants.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm py-2 px-3">
                      {t('admin.noRestaurantsAvailable') || 'No restaurants available'}
                    </p>
                  ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {restaurants.map(restaurant => {
                        // Check if this manager is already assigned to this restaurant
                        const isAlreadyAssigned = assignments.some(
                          a => a.managerId.toString() === selectedManager && a.restaurantId.toString() === restaurant.id.toString()
                        );
                        
                        return (
                          <li key={restaurant.id} className="py-2 px-3">
                            <label className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                value={restaurant.id}
                                checked={selectedRestaurants.includes(restaurant.id)}
                                onChange={() => toggleRestaurantSelection(restaurant.id)}
                                disabled={loading || isAlreadyAssigned}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className={`${isAlreadyAssigned ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                {restaurant.restorantName || restaurant.name}
                                {isAlreadyAssigned && (
                                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                    ({t('admin.alreadyAssigned') || 'already assigned'})
                                  </span>
                                )}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || 
                  !selectedManager || 
                  (isBatchMode ? selectedRestaurants.length === 0 : !selectedRestaurant)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  loading || !selectedManager || (isBatchMode ? selectedRestaurants.length === 0 : !selectedRestaurant)
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } transition-colors`}
              >
                {loading 
                  ? (t('admin.assigning') || 'Assigning...') 
                  : isBatchMode
                    ? (t('admin.assignToBatch') || `Assign to ${selectedRestaurants.length} restaurant(s)`)
                    : (t('admin.assignManager') || 'Assign Manager')}
              </button>
            </div>
          </form>

          {/* Existing Assignments */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-800 dark:text-white mb-4">
              {t('admin.existingAssignments') || 'Existing Assignments'}
            </h3>
            
            {assignments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                {t('admin.noAssignments') || 'No manager assignments yet'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('admin.manager') || 'Manager'}
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('admin.restaurant') || 'Restaurant'}
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('admin.assignedBy') || 'Assigned By'}
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('admin.assignedAt') || 'Date'}
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('admin.actions') || 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {assignment.managerName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {assignment.restaurantName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {assignment.assignedByName || 'Unknown admin'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRemoveAssignment(assignment.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            disabled={loading}
                          >
                            {t('admin.remove') || 'Remove'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerAssignmentModal; 