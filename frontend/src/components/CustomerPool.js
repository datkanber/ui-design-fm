import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';

export default function CustomerPool({ customers }) {
  return (
    <Card style={{ borderRadius: '16px', padding: '16px', backgroundColor: '#f9f9f9', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', border: '1px solid #ddd', height: '100%' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom style={{ color: '#222', fontWeight: 600, textAlign: 'center', marginBottom: '8px' }}>
          Müşteri Havuzu
        </Typography>
        <List>
          {customers.map((customer, index) => (
            <ListItem key={index} divider>
              <ListItemText
                primary={customer.name}
                secondary={`Adres: ${customer.address} | Talep: ${customer.demand} kg`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}