import React from 'react';
import { 
  Box, Typography, Grid, Paper, CircularProgress, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import EvStationIcon from '@mui/icons-material/EvStation';
import RouteIcon from '@mui/icons-material/Route';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';

// Analiz Dashboard bileşeni
const RouteAnalysisDashboard = ({ routeData, loading, error }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress size={30} />
        <Typography variant="body2" sx={{ ml: 2 }}>Rota analizi yükleniyor...</Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography variant="body2">Hata: {error}</Typography>
      </Box>
    );
  }
  
  if (!routeData) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2">Rota analizi için veri bulunamadı. Lütfen Route4Plan.xml dosyasını oluşturun.</Typography>
      </Box>
    );
  }
  
  // Formatters
  const formatDistance = (value) => `${value.toFixed(2)} meters`;
  const formatDuration = (value) => {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = Math.floor(value % 60);
    
    if (hours > 0) {
      return `${hours}s ${minutes}d ${seconds}s`;
    }
    return `${minutes}d ${seconds}s`;
  };
  const formatEnergy = (value) => `${value.toFixed(2)} Wh`;
  
  return (
    <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Rota Analizi</Typography>
        <Typography variant="caption" color="textSecondary">
          Problem: {routeData.problemType} - {routeData.numberOfCustomers} müşteri
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* Özet Metrikler */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={3}>
          <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f5f9ff', borderRadius: 2, border: '1px solid #e0e9ff', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RouteIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">Toplam Mesafe</Typography>
            </Box>
            <Typography variant="h6" sx={{ mt: 1, fontWeight: 500 }}>
              {formatDistance(routeData.metrics.totalDistance)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={3}>
          <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f5fff8', borderRadius: 2, border: '1px solid #e0ffd9', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimelineIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">Toplam Süre</Typography>
            </Box>
            <Typography variant="h6" sx={{ mt: 1, fontWeight: 500 }}>
              {formatDuration(routeData.metrics.totalDuration)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={3}>
          <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#fffaf5', borderRadius: 2, border: '1px solid #ffecd9', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EvStationIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">Enerji Tüketimi</Typography>
            </Box>
            <Typography variant="h6" sx={{ mt: 1, fontWeight: 500 }}>
              {formatEnergy(routeData.metrics.totalEnergyConsumption)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={3}>
          <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f8f5ff', borderRadius: 2, border: '1px solid #ece0ff', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonPinCircleIcon color="secondary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">Ziyaret Edilen Müşteri</Typography>
            </Box>
            <Typography variant="h6" sx={{ mt: 1, fontWeight: 500 }}>
              {routeData.metrics.numberOfServedCustomers} / {routeData.numberOfCustomers}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Rota Tablosu */}
      <Typography variant="subtitle2" gutterBottom>Rota Detayları</Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 220 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Rota ID</TableCell>
              <TableCell>Araç</TableCell>
              <TableCell align="right">Mesafe (km)</TableCell>
              <TableCell align="right">Süre</TableCell>
              <TableCell align="right">Enerji (kWh)</TableCell>
              <TableCell align="right">Düğüm Sayısı</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {routeData.routes.map((route, index) => (
              <TableRow key={index} hover>
                <TableCell component="th" scope="row">{route.routeId}</TableCell>
                <TableCell>{route.vehicleId}</TableCell>
                <TableCell align="right">{route.distance.toFixed(2)}</TableCell>
                <TableCell align="right">{formatDuration(route.duration)}</TableCell>
                <TableCell align="right">{route.energyConsumption.toFixed(2)}</TableCell>
                <TableCell align="right">{route.numberOfNodes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Diğer Metrikler */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', px: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Algoritma Çalışma Süresi: <strong>{routeData.metrics.runtime.toFixed(2)} saniye</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gecikme: <strong>{routeData.metrics.totalTardiness.toFixed(2)}</strong> •
          Şarj İstasyonu Sayısı: <strong>{routeData.metrics.numberOfChargeStation}</strong>
        </Typography>
      </Box>
    </Paper>
  );
};

// Bileşeni default export olarak ekliyoruz - bu daha önce eksik olabilir!
export default RouteAnalysisDashboard;
