import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function CustomerPool({ customers, selectedDemand }) {
  const getCustomerTypeColor = (type) => {
    switch(type) {
      case 'C': return '#4caf50';  // Yeşil
      case 'R': return '#2196f3';  // Mavi
      case 'RC': return '#ff9800'; // Turuncu
      default: return '#757575';   // Gri
    }
  };

  return (
    <Card style={{ borderRadius: '16px', padding: '16px', backgroundColor: '#f9f9f9', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', border: '1px solid #ddd', height: '100%' }}>
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Typography variant="h5" style={{ color: '#222', fontWeight: 600 }}>
            Müşteri Havuzu
          </Typography>
          {selectedDemand && (
            <Chip 
              label={selectedDemand} 
              color="primary" 
              style={{ backgroundColor: getCustomerTypeColor(selectedDemand.substring(0, selectedDemand.length-2)) }}
            />
          )}
        </div>
        
        <List>
          {customers.map((customer, index) => (
            <ListItem 
              key={index} 
              divider 
              style={{ 
                backgroundColor: '#fff',
                marginBottom: '8px',
                borderRadius: '4px',
                border: '1px solid #eee'
              }}
            >
              <ListItemText
                primary={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{customer.name}</span>
                    <Chip 
                      label={`${customer.type || 'C'}${customer.demand}`} 
                      size="small"
                      style={{ 
                        backgroundColor: getCustomerTypeColor(customer.type || 'C'),
                        color: '#fff'
                      }}
                    />
                  </div>
                }
                secondary={
                  <div style={{ marginTop: '4px' }}>
                    <div>{`Adres: ${customer.address}`}</div>
                    <div>{`Talep: ${customer.demand} kg`}</div>
                    {customer.timeWindow && (
                      <div>{`Zaman Aralığı: ${customer.timeWindow.start} - ${customer.timeWindow.end}`}</div>
                    )}
                  </div>
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="edit" size="small" style={{ marginRight: '8px' }}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" size="small">
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {customers.length === 0 && (
            <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', padding: '16px' }}>
              Bu talep tipi için müşteri bulunamadı
            </Typography>
          )}
        </List>
      </CardContent>
    </Card>
  );
}