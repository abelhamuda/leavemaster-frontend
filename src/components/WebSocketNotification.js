import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  BellOff, 
  X, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Clock,
  Wifi,
  WifiOff,
  Bug,
  Globe,
  Calendar,
  MessageCircle
} from 'lucide-react';

// Global event bus untuk debugging
const createEventBus = () => {
  const listeners = [];
  
  return {
    subscribe: (listener) => {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
      };
    },
    emit: (event) => {
      listeners.forEach(listener => listener(event));
    }
  };
};

const eventBus = createEventBus();

const WebSocketNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Subscribe to event bus for debugging
    const unsubscribe = eventBus.subscribe((notification) => {
      console.log('📨 Event bus received:', notification);
      addNotification(notification);
    });

    connectWebSocket();
    
    return () => {
      unsubscribe();
      if (ws) {
        console.log('🧹 Cleaning up WebSocket connection');
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    // Update unread count
    setUnreadCount(notifications.length);
  }, [notifications]);

  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token found in localStorage');
      return;
    }

    console.log('🔌 Attempting WebSocket connection...');
    const WS_BASE = 'wss://leavemaster-backend-production.up.railway.app/ws';
    const wsUrl = `${WS_BASE}?token=${encodeURIComponent(token)}`;
    const websocket = new WebSocket(wsUrl);


    websocket.onopen = () => {
      console.log('✅ WebSocket Connected Successfully!');
      setIsConnected(true);
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      console.log('📨 RAW WebSocket Message:', event.data);
      try {
        const notification = JSON.parse(event.data);
        console.log('📨 Parsed Notification:', notification);
        addNotification(notification);
      } catch (error) {
        console.error('❌ Error parsing notification:', error);
      }
    };

    websocket.onclose = (event) => {
      console.log('🔌 WebSocket Disconnected. Code:', event.code, 'Reason:', event.reason);
      setIsConnected(false);
      setWs(null);
      
      setTimeout(() => {
        console.log('🔄 Reconnecting WebSocket...');
        connectWebSocket();
      }, 3000);
    };

    websocket.onerror = (error) => {
      console.error('❌ WebSocket Error:', error);
      setIsConnected(false);
    };
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      ...notification,
      timestamp: new Date(),
      read: false
    };
    
    console.log('🎯 Adding notification to UI:', newNotification);
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep last 10

    // Auto remove after 10 seconds
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 10000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_leave_request':
        return <FileText className="w-5 h-5" />;
      case 'leave_approved':
      case 'status_approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'leave_rejected':
      case 'status_rejected':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_leave_request':
        return 'bg-blue-500';
      case 'leave_approved':
      case 'status_approved':
        return 'bg-green-500';
      case 'leave_rejected':
      case 'status_rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getNotificationIconColor = (type) => {
    switch (type) {
      case 'new_leave_request':
        return 'text-blue-600';
      case 'leave_approved':
      case 'status_approved':
        return 'text-green-600';
      case 'leave_rejected':
      case 'status_rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatNotificationMessage = (notification) => {
    console.log('🔍 Formatting notification:', notification);
    
    if (notification.data) {
      switch (notification.type) {
        case 'new_leave_request':
          return `${notification.data.employee_name} mengajukan cuti ${notification.data.leave_type}`;
        case 'leave_approved':
          return `Cuti ${notification.data.leave_type} Anda DISETUJUI!`;
        case 'leave_rejected':
          return `Cuti ${notification.data.leave_type} Anda DITOLAK`;
        case 'status_approved':
          return `Cuti ${notification.data.leave_type} Anda DISETUJUI!`;
        case 'status_rejected': 
          return `Cuti ${notification.data.leave_type} Anda DITOLAK`;
        default:
          return notification.message || 'New notification';
      }
    }
    return notification.message || 'New notification';
  };

  // Expose functions to window for debugging
  useEffect(() => {
    window.debugNotifications = {
      add: addNotification,
      clear: clearAllNotifications,
      list: () => notifications,
      test: () => {
        addNotification({
          type: 'debug_notification',
          message: 'Test notification from debug!',
          data: {
            employee_name: 'Debug User',
            leave_type: 'annual',
            start_date: '2024-02-15',
            end_date: '2024-02-17',
            reason: 'Testing debug system'
          },
          forManager: false
        });
      }
    };
    
    window.triggerTestNotification = () => {
      eventBus.emit({
        type: 'test_notification',
        message: 'Test from global function!',
        data: {
          employee_name: 'Global Test',
          leave_type: 'sick',
          start_date: '2024-02-18',
          end_date: '2024-02-18',
          reason: 'Testing global event bus'
        },
        forManager: false
      });
    };
    
    console.log('🐛 Debug functions available:');
    console.log('   - window.debugNotifications.test()');
    console.log('   - window.triggerTestNotification()');
    console.log('   - window.debugNotifications.add(notification)');
  }, [notifications]);

  return (
    <>
      {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`flex items-center space-x-2 px-3 py-2 rounded-full text-white text-sm font-medium ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {isConnected ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </motion.div>
      </div>

      {/* Main Notification Bell */}
      <div className="fixed top-20 right-4 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative bg-white rounded-xl shadow-lg border border-gray-200 p-3 hover:shadow-xl transition-all duration-200"
        >
          <Bell className="w-6 h-6 text-gray-700" />
          
          {/* Unread Badge */}
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </motion.button>

        {/* Notifications Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-16 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ delay: index * 0.1 }}
                        className={`border-b border-gray-100 last:border-b-0 ${
                          !notification.read ? 'bg-blue-50' : 'bg-white'
                        }`}
                      >
                        <div 
                          className="p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            {/* Icon */}
                            <div className={`w-10 h-10 ${getNotificationColor(notification.type)} bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <div className={getNotificationIconColor(notification.type)}>
                                {getNotificationIcon(notification.type)}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                {formatNotificationMessage(notification)}
                              </p>
                              
                              {notification.data && (
                                <div className="space-y-2 mt-2">
                                  {notification.data.start_date && (
                                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                                      <Calendar className="w-3 h-3" />
                                      <span>
                                        {notification.data.start_date} → {notification.data.end_date}
                                      </span>
                                    </div>
                                  )}
                                  {notification.data.reason && (
                                    <div className="flex items-start space-x-2 text-xs text-gray-600">
                                      <MessageCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                      <span className="line-clamp-2">
                                        {notification.data.reason}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  {new Date(notification.timestamp).toLocaleTimeString()}
                                </span>
                                <span className="text-xs text-gray-400 capitalize">
                                  {notification.type.replace(/_/g, ' ')}
                                </span>
                              </div>
                            </div>

                            {/* Close Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="p-1 hover:bg-gray-200 rounded-lg transition-colors duration-200 flex-shrink-0"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No notifications</p>
                      <p className="text-gray-400 text-xs mt-1">
                        New notifications will appear here
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Debug Footer (Development Only) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.debugNotifications.test()}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                    >
                      <Bug className="w-4 h-4" />
                      <span>Test</span>
                    </button>
                    
                    <button
                      onClick={() => window.triggerTestNotification()}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Global</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};

export default WebSocketNotification;