import React, { useState } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Select, MenuItem, Button } from '@mui/material';
import { orders as staticOrders } from '../data/orders';

export default function OrderManagement() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [orders, setOrders] = useState(staticOrders);

  const filteredOrders = orders.filter(order => 
    (statusFilter === 'All' || order.status === statusFilter) &&
    (dateFilter === 'All' || new Date(order.date) >= new Date(dateFilter))
  );

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <Card style={{ borderRadius: '16px', padding: '16px', backgroundColor: '#f9f9f9', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', border: '1px solid #ddd' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom style={{ color: '#222', fontWeight: 600, textAlign: 'center', marginBottom: '8px' }}>
          Talep Yönetimi
        </Typography>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="All">Tümü</MenuItem>
            <MenuItem value="Pending">Beklemede</MenuItem>
            <MenuItem value="Planned">Planlanmış</MenuItem>
            <MenuItem value="In Progress">Devam Ediyor</MenuItem>
            <MenuItem value="Completed">Tamamlandı</MenuItem>
            <MenuItem value="Cancelled">İptal Edildi</MenuItem>
          </Select>

          <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <MenuItem value="All">Tümü</MenuItem>
            <MenuItem value="2024-02-01">Son 1 Ay</MenuItem>
            <MenuItem value="2024-01-01">Son 3 Ay</MenuItem>
          </Select>
        </div>

        <List>
          {filteredOrders.map(order => (
            <ListItem key={order.id} divider>
              <ListItemText primary={`Sipariş ${order.id}`} secondary={`Durum: ${order.status}`} />
              <Button onClick={() => updateOrderStatus(order.id, 'Cancelled')} color="secondary">İptal</Button>
              <Button onClick={() => updateOrderStatus(order.id, 'Completed')} color="primary">Tamamla</Button>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
