import React from 'react';
import useMobile from '../hooks/useMobile';

const ResponsiveLayout = ({ children, style = {} }) => {
  const isMobile = useMobile();

  const responsiveStyle = {
    padding: isMobile ? '10px' : '20px',
    maxWidth: isMobile ? '100%' : '1200px',
    margin: '0 auto',
    ...style
  };

  return (
    <div style={responsiveStyle}>
      {children}
    </div>
  );
};

export const ResponsiveTable = ({ children, headers }) => {
  const isMobile = useMobile();

  if (isMobile) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '10px'
      }}>
        {children}
      </div>
    );
  }

  return (
    <table style={{ 
      width: '100%', 
      borderCollapse: 'collapse',
      background: 'white',
      borderRadius: '5px',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <thead>
        <tr style={{ background: '#f8f9fa' }}>
          {headers.map((header, index) => (
            <th key={index} style={{ 
              padding: '12px', 
              textAlign: 'left', 
              borderBottom: '2px solid #dee2e6',
              fontWeight: '600'
            }}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {children}
      </tbody>
    </table>
  );
};

export const MobileCard = ({ children, onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderLeft: '4px solid #3498db',
        marginBottom: '10px',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      {children}
    </div>
  );
};

export default ResponsiveLayout;