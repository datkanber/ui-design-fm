import React from 'react';
import { Container, Typography, Box } from '@mui/material';

// Bu boş bir bileşen! Eğer bu sayfa kullanılıyorsa içeriğini ekleyin
const Vehicles = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ pt: 4, pb: 2 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 600 }}>
          Vehicles Management
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Manage your vehicle fleet and track vehicle details.
        </Typography>
      </Box>
      
      {/* Vehicles içeriği buraya gelecek */}
      <Box sx={{ bgcolor: '#f5f5f5', p: 4, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="h6">
          Vehicles management module content will be displayed here.
        </Typography>
      </Box>
    </Container>
  );
};

export default Vehicles;
