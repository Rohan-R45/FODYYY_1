import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import toast from 'react-hot-toast';

const NotificationPreferences = () => {
  const {
    fcmSupported,
    notificationPermission,
    notificationPreferences,
    requestPermission,
    updatePreferences
  } = useNotifications();

  const [isUpdating, setIsUpdating] = useState(false);
  const [localPreferences, setLocalPreferences] = useState(notificationPreferences);

  useEffect(() => {
    setLocalPreferences(notificationPreferences);
  }, [notificationPreferences]);

  const handlePermissionRequest = async () => {
    const success = await requestPermission();
    if (success) {
      toast.success('Push notifications enabled!');
    }
  };

  const handlePreferenceChange = async (key, value) => {
    setIsUpdating(true);
    try {
      const newPreferences = { ...localPreferences, [key]: value };
      setLocalPreferences(newPreferences);

      const success = await updatePreferences(newPreferences);
      if (!success) {
        // Revert on failure
        setLocalPreferences(notificationPreferences);
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      setLocalPreferences(notificationPreferences);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21c4.411 0 8-4.03 8-9s-3.589-9-8-9-8 4.03-8 9a9.06 9.06 0 001.832 5.683L4 21l4.868-8.317z" />
        </svg>
        Notification Preferences
      </h3>

      {/* Push Notification Permission */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Push Notifications</h4>

        {!fcmSupported ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              Push notifications are not supported in this browser. Try using a modern browser like Chrome or Firefox.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Browser Permission</span>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  notificationPermission === 'granted'
                    ? 'bg-green-100 text-green-800'
                    : notificationPermission === 'denied'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {notificationPermission === 'granted' ? 'Enabled' :
                   notificationPermission === 'denied' ? 'Blocked' : 'Not Set'}
                </span>
                {notificationPermission !== 'granted' && (
                  <button
                    onClick={handlePermissionRequest}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Enable
                  </button>
                )}
              </div>
            </div>

            {notificationPermission === 'denied' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">
                  Notifications are blocked. Please enable them in your browser settings and refresh the page.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Notification Types</h4>

        {/* New Order Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">New Order Alerts</label>
            <p className="text-xs text-gray-500">Get notified when customers place new orders</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={localPreferences.orderNotifications}
              onChange={(e) => handlePreferenceChange('orderNotifications', e.target.checked)}
              disabled={isUpdating}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Status Update Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">Order Status Updates</label>
            <p className="text-xs text-gray-500">Receive updates when order status changes</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={localPreferences.statusUpdates}
              onChange={(e) => handlePreferenceChange('statusUpdates', e.target.checked)}
              disabled={isUpdating}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Sound Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">Sound Alerts</label>
            <p className="text-xs text-gray-500">Play sound when receiving notifications</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={localPreferences.soundEnabled}
              onChange={(e) => handlePreferenceChange('soundEnabled', e.target.checked)}
              disabled={isUpdating}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Loading indicator */}
      {isUpdating && (
        <div className="mt-4 flex items-center text-sm text-gray-600">
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Updating preferences...
        </div>
      )}

      {/* Info message */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Push notifications work best when the app is running in the background.
          Make sure to keep this tab open or install the app for the best experience.
        </p>
      </div>
    </div>
  );
};

export default NotificationPreferences;