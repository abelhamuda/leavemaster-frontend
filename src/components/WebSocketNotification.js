import React, { useState, useEffect } from 'react';

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

  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token found in localStorage');
      return;
    }

    console.log('🔌 Attempting WebSocket connection...');
    const wsUrl = `ws://localhost:8080/ws?token=${encodeURIComponent(token)}`;
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
    };
    
    console.log('🎯 Adding notification to UI:', newNotification);
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 10000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_leave_request':
        return '📋';
      case 'leave_status_updated':
        return '🔄';
      case 'status_approved':
        return '✅';
      case 'status_rejected':
        return '❌';
      default:
        return '💡';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_leave_request':
        return '#3498db';
      case 'leave_status_updated':
        return '#f39c12';
      case 'status_approved':
        return '#2ecc71';
      case 'status_rejected':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const formatNotificationMessage = (notification) => {
    if (notification.data) {
      switch (notification.type) {
        case 'new_leave_request':
          return `📋 ${notification.data.employee_name} mengajukan cuti ${notification.data.leave_type}`;
        case 'status_approved':
          return `✅ Cuti ${notification.data.leave_type} Anda DISETUJUI!`;
        case 'status_rejected':
          return `❌ Cuti ${notification.data.leave_type} Anda DITOLAK`;
        default:
          return notification.message;
      }
    }
    return notification.message;
  };

  // Expose functions to window for debugging
  useEffect(() => {
    window.debugNotifications = {
      add: addNotification,
      clear: () => setNotifications([]),
      list: () => notifications,
      test: () => {
        addNotification({
          type: 'debug_notification',
          message: '🎯 Test notification from debug!',
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
        message: '🎉 Test from global function!',
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
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      zIndex: 1000,
      maxWidth: '350px'
    }}>
      {/* Connection Status Indicator */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: isConnected ? '#2ecc71' : '#e74c3c',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '15px',
        fontSize: '12px',
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        {isConnected ? '🔌 Connected' : '🔌 Disconnected'}
      </div>

      {/* Debug Buttons */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <button
          onClick={() => window.debugNotifications.test()}
          style={{
            background: '#3498db',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🐛 Test Notification
        </button>
        
        <button
          onClick={() => window.triggerTestNotification()}
          style={{
            background: '#9b59b6', 
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🌍 Global Test
        </button>
      </div>

      {/* Notifications */}
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={{
            background: 'white',
            borderLeft: `4px solid ${getNotificationColor(notification.type)}`,
            padding: '15px',
            marginBottom: '10px',
            borderRadius: '5px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'slideIn 0.3s ease-out',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            minWidth: '300px'
          }}
          onClick={() => removeNotification(notification.id)}
        >
          <span style={{ fontSize: '20px', flexShrink: 0 }}>
            {getNotificationIcon(notification.type)}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '5px',
              color: getNotificationColor(notification.type),
              fontSize: '14px'
            }}>
              {formatNotificationMessage(notification)}
            </div>
            
            {notification.data && (
              <div style={{ 
                fontSize: '12px', 
                color: '#666',
                background: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                marginTop: '8px',
                wordBreak: 'break-word'
              }}>
                {notification.data.start_date && (
                  <div>📅 {notification.data.start_date} → {notification.data.end_date}</div>
                )}
                {notification.data.reason && (
                  <div>💬 {notification.data.reason}</div>
                )}
              </div>
            )}
            
            <div style={{ 
              fontSize: '10px', 
              color: '#999',
              marginTop: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>
                {new Date(notification.timestamp).toLocaleTimeString()}
              </span>
              <span style={{ 
                padding: '2px 6px', 
                background: '#f1f2f6',
                borderRadius: '10px',
                fontSize: '9px'
              }}>
                {notification.type}
              </span>
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              color: '#999',
              padding: '0',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            title="Close notification"
          >
            ×
          </button>
        </div>
      ))}
      
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default WebSocketNotification;