import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { leaveAPI } from '../services/api'; // ✅ Gunakan leaveAPI yang sudah difix

const localizer = momentLocalizer(moment);

const CalendarView = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    loadCalendarEvents();
  }, []);

  const loadCalendarEvents = async () => {
    try {
      // Gunakan leaveAPI yang sudah ada function specific-nya
      const endpoint = user.is_manager ? leaveAPI.getTeamCalendar : leaveAPI.getCalendarEvents;
      const response = await endpoint();
      
      const formattedEvents = response.data.map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        type: event.type,
        status: event.status,
        employeeName: event.employeeName,
        department: event.department,
        color: event.color,
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading calendar events:', error);
    }
  };

  const eventStyleGetter = (event) => {
    const backgroundColor = event.color || '#3174ad';
    const style = {
      backgroundColor,
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
      fontSize: '12px',
    };
    return {
      style: style
    };
  };

  const handleSelectEvent = (event) => {
    alert(
      `Employee: ${event.employeeName}\n` +
      `Type: ${event.type}\n` +
      `Status: ${event.status}\n` +
      `Department: ${event.department}\n` +
      `Dates: ${moment(event.start).format('MMM D')} - ${moment(event.end).format('MMM D, YYYY')}`
    );
  };

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  const handleView = (newView) => {
    setView(newView);
  };

  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '5px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px',
      height: '600px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3>Team Leave Calendar</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <div style={{ width: '12px', height: '12px', background: '#3498db', borderRadius: '2px' }}></div>
            <small>Annual Leave</small>
          </div>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <div style={{ width: '12px', height: '12px', background: '#e74c3c', borderRadius: '2px' }}></div>
            <small>Sick Leave</small>
          </div>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <div style={{ width: '12px', height: '12px', background: '#FFA500', borderRadius: '2px' }}></div>
            <small>Pending</small>
          </div>
        </div>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={handleSelectEvent}
        onNavigate={handleNavigate}
        onView={handleView}
        view={view}
        date={date}
        eventPropGetter={eventStyleGetter}
        popup
        tooltipAccessor={(event) => `${event.employeeName} - ${event.type} (${event.status})`}
        views={['month', 'week', 'day']}
      />
    </div>
  );
};

export default CalendarView;