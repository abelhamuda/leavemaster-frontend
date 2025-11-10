import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { 
  RefreshCw, 
  Calendar as CalendarIcon,
  Users, 
  User, 
  Eye, 
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Building,
  FileText,
  CheckCircle,
  XCircle,
  Clock4,
  Mail,
  Phone
} from 'lucide-react';
import { leaveAPI } from '../services/api';

const localizer = momentLocalizer(moment);

const CalendarView = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [teamEvents, setTeamEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [activeCalendar, setActiveCalendar] = useState('personal');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    loadCalendarEvents();
  }, [user]);

  const loadCalendarEvents = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setError(null);

      // Load personal calendar events
      try {
        const personalResponse = await leaveAPI.getCalendarEvents();
        
        if (!personalResponse?.data || !Array.isArray(personalResponse.data)) {
          setEvents([]);
        } else {
          const personalFormattedEvents = personalResponse.data.map(event => {
            if (!event) return null;

            const startDate = new Date(event.start);
            const endDate = new Date(event.end);
            
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              return null;
            }

            return {
              id: event.id || Math.random().toString(36).substr(2, 9),
              title: event.title || `${event.employeeName || 'Unknown'} - ${event.type || 'unknown'}`,
              start: startDate,
              end: endDate,
              type: event.type,
              status: event.status,
              employeeName: event.employeeName,
              department: event.department,
              reason: event.reason,
              total_days: event.total_days,
              color: getEventColor(event.type, event.status),
              calendar: 'personal'
            };
          }).filter(event => event !== null);

          setEvents(personalFormattedEvents);
        }
      } catch (personalError) {
        console.error('Personal calendar API error:', personalError);
        setEvents([]);
      }

      // Load team calendar events untuk manager/admin
      if (user?.role_name === 'manager' || user?.role_name === 'admin' || user?.role_name === 'super_admin') {
        try {
          const teamResponse = await leaveAPI.getTeamCalendar();
          
          if (!teamResponse?.data || !Array.isArray(teamResponse.data)) {
            setTeamEvents([]);
          } else {
            const teamFormattedEvents = teamResponse.data.map(event => {
              if (!event) return null;

              const startDate = new Date(event.start);
              const endDate = new Date(event.end);
              
              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return null;
              }

              return {
                id: (event.id || Math.random().toString(36).substr(2, 9)) + '_team',
                title: event.title || `${event.employeeName || 'Unknown'} - ${event.type || 'unknown'}`,
                start: startDate,
                end: endDate,
                type: event.type,
                status: event.status,
                employeeName: event.employeeName,
                department: event.department,
                reason: event.reason,
                total_days: event.total_days,
                color: getEventColor(event.type, event.status),
                calendar: 'team'
              };
            }).filter(event => event !== null);

            setTeamEvents(teamFormattedEvents);
          }
        } catch (teamError) {
          console.warn('Could not load team calendar:', teamError);
          setTeamEvents([]);
        }
      } else {
        setTeamEvents([]);
      }

    } catch (error) {
      console.error('Unexpected error loading calendar events:', error);
      setError('Failed to load calendar data. Please try again.');
      setEvents([]);
      setTeamEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getEventColor = (type, status) => {
    const colorMap = {
      annual: '#3b82f6',    // Blue
      sick: '#ef4444',      // Red
      personal: '#8b5cf6',  // Purple
      other: '#f59e0b'      // Orange
    };

    const baseColor = colorMap[type] || '#6b7280';
    return status === 'pending' ? `${baseColor}80` : baseColor;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock4 className="w-4 h-4 text-amber-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  const handleView = (newView) => {
    setView(newView);
  };

  const eventStyleGetter = (event) => {
    const isTeamEvent = event.calendar === 'team';
    const isPending = event.status === 'pending';

    const style = {
      backgroundColor: event.color,
      borderRadius: '6px',
      opacity: isPending ? 0.7 : 0.9,
      color: 'white',
      border: '0px',
      borderLeft: isTeamEvent ? '4px solid #1f2937' : '4px solid transparent',
      display: 'block',
      fontSize: '11px',
      padding: '3px 6px',
      fontWeight: isPending ? '600' : 'normal',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer'
    };

    return { style };
  };

  const handleSelectEvent = (event) => {
    if (!event) return;
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Determine which events to show based on active calendar
  const displayEvents = activeCalendar === 'team' ? teamEvents : 
                       activeCalendar === 'combined' ? [...events, ...teamEvents] : 
                       events;

  const canViewTeamCalendar = user?.role_name === 'manager' || user?.role_name === 'admin' || user?.role_name === 'super_admin';

  // Custom Toolbar Component
  const CustomToolbar = ({ label, onNavigate, onView }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3 mb-3 sm:mb-0">
        <button
          onClick={() => onNavigate('PREV')}
          className="p-2 hover:bg-white rounded-lg transition-colors duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
          {label}
        </h3>
        
        <button
          onClick={() => onNavigate('NEXT')}
          className="p-2 hover:bg-white rounded-lg transition-colors duration-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onNavigate('TODAY')}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Today
        </button>
        
        <div className="flex bg-white border border-gray-300 rounded-lg p-1">
          {['month', 'week', 'day'].map(viewType => (
            <button
              key={viewType}
              onClick={() => onView(viewType)}
              className={`px-3 py-1 text-sm rounded-md capitalize transition-colors duration-200 ${
                view === viewType 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {viewType}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Loading State
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
            <p className="text-gray-600 mt-1">View and manage leave schedules</p>
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
        </div>
        
        <div className="animate-pulse bg-gray-200 rounded-xl h-96"></div>
      </motion.div>
    );
  }

  // Error State
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Calendar</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={loadCalendarEvents}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
            </div>
            <p className="text-gray-600">View and manage leave schedules</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadCalendarEvents}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors duration-200"
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent mr-2"></div>
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          {/* Calendar Type Selector */}
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveCalendar('personal')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 ${
                  activeCalendar === 'personal' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Personal</span>
              </button>
              
              {canViewTeamCalendar && (
                <>
                  <button
                    onClick={() => setActiveCalendar('team')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 ${
                      activeCalendar === 'team' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Team</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveCalendar('combined')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 ${
                      activeCalendar === 'combined' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Combined</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Event Summary */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {displayEvents.length} events
            </span>
            {activeCalendar === 'combined' && (
              <>
                <span>Personal: {events.length}</span>
                <span>Team: {teamEvents.length}</span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Legend:</span>
          </div>
          
          {[
            { type: 'annual', label: 'Annual Leave', color: '#3b82f6' },
            { type: 'sick', label: 'Sick Leave', color: '#ef4444' },
            { type: 'personal', label: 'Personal Leave', color: '#8b5cf6' },
            { type: 'other', label: 'Other', color: '#f59e0b' },
            { type: 'pending', label: 'Pending', color: '#6b7280' }
          ].map(item => (
            <div key={item.type} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
          ))}
          
          {activeCalendar === 'combined' && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-sm border-l-2 border-gray-900"></div>
              <span className="text-sm text-gray-600">Team Events</span>
            </div>
          )}
        </div>

        {/* Calendar Component */}
        <div className="h-96 sm:h-[500px] lg:h-[600px]">
          <Calendar
            localizer={localizer}
            events={Array.isArray(displayEvents) ? displayEvents : []}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            onNavigate={handleNavigate}
            onView={handleView}
            view={view}
            date={date}
            eventPropGetter={eventStyleGetter}
            popup
            tooltipAccessor={(event) => {
              if (!event) return 'Unknown event';
              const statusText = event.status === 'pending' ? ' (Pending)' : '';
              return `${event.employeeName || 'Unknown'} - ${event.type || 'Unknown'}${statusText}`;
            }}
            views={['month', 'week', 'day']}
            messages={{
              next: "Next",
              previous: "Prev",
              today: "Today",
              month: "Month",
              week: "Week", 
              day: "Day",
              agenda: "Agenda",
              date: "Date",
              time: "Time",
              event: "Event",
              noEventsInRange: "No events in this range"
            }}
            components={{
              toolbar: CustomToolbar
            }}
          />
        </div>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {showEventModal && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEventModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: selectedEvent.color }}
                  >
                    <CalendarIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Leave Details</h3>
                    <p className="text-sm text-gray-500">
                      {selectedEvent.calendar === 'team' ? 'Team Event' : 'Personal Event'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Employee Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {selectedEvent.employeeName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {selectedEvent.employeeName || 'Unknown Employee'}
                    </h4>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Building className="w-3 h-3 mr-1" />
                      {selectedEvent.department || 'No Department'}
                    </p>
                  </div>
                </div>

                {/* Event Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Leave Type</label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: selectedEvent.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {selectedEvent.type || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Status</label>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedEvent.status)}
                      <span className={`text-sm font-medium capitalize ${getStatusColor(selectedEvent.status).split(' ')[1]}`}>
                        {selectedEvent.status || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Duration</label>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {selectedEvent.total_days || '?'} days
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Calendar</label>
                    <div className="flex items-center space-x-2">
                      {selectedEvent.calendar === 'team' ? (
                        <Users className="w-3 h-3 text-blue-500" />
                      ) : (
                        <User className="w-3 h-3 text-green-500" />
                      )}
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {selectedEvent.calendar}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-3">
                  <label className="text-xs font-medium text-gray-500">Dates</label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900">
                        {moment(selectedEvent.start).format('MMM D, YYYY')}
                      </div>
                      <div className="text-xs text-gray-500">Start Date</div>
                    </div>
                    <div className="w-8 h-px bg-gray-300 mx-2"></div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900">
                        {moment(selectedEvent.end).format('MMM D, YYYY')}
                      </div>
                      <div className="text-xs text-gray-500">End Date</div>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                {selectedEvent.reason && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">Reason</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{selectedEvent.reason}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons untuk Manager/Admin */}
                {(user?.role_name === 'manager' || user?.role_name === 'admin' || user?.role_name === 'super_admin') && 
                 selectedEvent.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium">
                      Approve
                    </button>
                    <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CalendarView;