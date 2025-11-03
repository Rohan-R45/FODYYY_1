import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  requestNotificationPermission,
  registerFCMToken,
  unregisterFCMToken,
  updateNotificationPreferences,
  onMessageListener,
  isFCMSupported
} from '../utils/firebase';
import { useAuth } from '../context/AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [fcmSupported, setFcmSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [fcmToken, setFcmToken] = useState(null);
  const [notificationPreferences, setNotificationPreferences] = useState({
    orderNotifications: true,
    statusUpdates: true,
    soundEnabled: true
  });

  // Generate device ID
  const getDeviceId = useCallback(() => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }, []);

  // Check FCM support on mount
  useEffect(() => {
    const checkFCMSupport = async () => {
      const supported = isFCMSupported();
      setFcmSupported(supported);

      if (supported) {
        // Check current permission status
        if ('Notification' in window) {
          setNotificationPermission(Notification.permission);
        }
      }
    };

    checkFCMSupport();
  }, []);

  // Setup FCM when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && fcmSupported) {
      initializeFCM();
    }
  }, [isAuthenticated, user, fcmSupported]);

  const initializeFCM = async () => {
    try {
      // Request notification permission and get token
      const result = await requestNotificationPermission();

      if (result.success) {
        setFcmToken(result.token);
        setNotificationPermission(result.permission);

        // Register token with backend
        const deviceId = getDeviceId();
        const registerResult = await registerFCMToken(result.token, deviceId);

        if (registerResult.success) {
          console.log('✅ FCM token registered successfully');
        } else {
          console.error('❌ Failed to register FCM token:', registerResult.error);
          toast.error('Failed to enable push notifications');
        }
      } else {
        console.log('ℹ️ Notification permission denied or FCM not available:', result.error);
        if (result.error !== 'Firebase Cloud Messaging is not supported in this browser') {
          toast.info('Push notifications are disabled. You can enable them in your browser settings.');
        }
      }
    } catch (error) {
      console.error('❌ Error initializing FCM:', error);
    }
  };

  // Listen for incoming messages
  useEffect(() => {
    if (!fcmSupported) return;

    const unsubscribe = onMessageListener((payload) => {
      handleIncomingNotification(payload);
    });

    return unsubscribe;
  }, [fcmSupported]);

  const handleIncomingNotification = (payload) => {
    const { notification, data } = payload;

    if (!notification) return;

    // Create a more detailed notification
    const notificationOptions = {
      body: notification.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data?.orderId || 'order-notification', // Prevents duplicate notifications
      requireInteraction: true,
      actions: data?.orderId ? [
        {
          action: 'view',
          title: 'View Order'
        }
      ] : []
    };

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, notificationOptions);

      browserNotification.onclick = () => {
        // Handle notification click - navigate to relevant page
        handleNotificationClick(data);
        browserNotification.close();
      };
    }

    // Show toast notification
    toast.info(notification.body, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      onClick: () => handleNotificationClick(data)
    });
  };

  const handleNotificationClick = (data) => {
    if (!data) return;

    // Navigate based on notification type
    if (data.type === 'new_order' && data.orderId) {
      // Navigate to orders page for restaurant owners
      if (user?.role === 'restaurant') {
        window.location.href = `/orders`;
      }
    } else if (data.type === 'status_update' && data.orderId) {
      // Navigate to order tracking for students
      if (user?.role === 'student') {
        window.location.href = `/orders/${data.orderId}/track`;
      }
    }
  };

  const requestPermission = async () => {
    if (!fcmSupported) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    try {
      const result = await initializeFCM();
      return result;
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Failed to enable notifications');
      return false;
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      setNotificationPreferences(prev => ({ ...prev, ...preferences }));

      const result = await updateNotificationPreferences(preferences);

      if (result.success) {
        toast.success('Notification preferences updated');
        return true;
      } else {
        toast.error('Failed to update preferences');
        return false;
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
      return false;
    }
  };

  const unregisterDevice = async () => {
    try {
      const deviceId = getDeviceId();
      const result = await unregisterFCMToken(deviceId);

      if (result.success) {
        setFcmToken(null);
        toast.success('Push notifications disabled for this device');
        return true;
      } else {
        toast.error('Failed to disable notifications');
        return false;
      }
    } catch (error) {
      console.error('Error unregistering device:', error);
      toast.error('Failed to disable notifications');
      return false;
    }
  };

  const value = {
    fcmSupported,
    notificationPermission,
    fcmToken,
    notificationPreferences,
    requestPermission,
    updatePreferences,
    unregisterDevice,
    getDeviceId
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;