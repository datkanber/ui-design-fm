// src/components/ChatBox.js
import React from 'react';
import { Typography } from '@mui/material';

export default function ChatBox({ vehicles }) {
  return (
    <div style={{
      position: 'fixed',
      top: '100px',
      right: '16px',
      width: '300px',
      height: '400px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #ddd',
      overflowY: 'auto',
      zIndex: 1000,
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ backgroundColor: '#007BFF', color: '#fff', padding: '12px', fontWeight: 'bold', textAlign: 'center' }}>Urgent Orders</div>
      <div style={{ padding: '12px' }}>
        {vehicles && vehicles.length > 0 ? (
          vehicles.map((vehicle, index) => (
            <div key={index} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
              <Typography variant="body1" style={{ color: '#007BFF' }}>{vehicle.name}</Typography>
              <Typography variant="body2" color="textSecondary">SoC: {vehicle.soc}%</Typography>
            </div>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">No urgent orders</Typography>
        )}
      </div>
    </div>
  );
}
