import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  LinearProgress, 
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import SpeedIcon from '@mui/icons-material/Speed';
import TrafficIcon from '@mui/icons-material/Traffic';

const SimulationStatus = ({ isRunning, lastUpdated }) => {
  const [sumoVehicles, setSumoVehicles] = useState([]);
  const [lastFetch, setLastFetch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Only fetch data if simulation is running
    if (!isRunning) return;
    
    const fetchSumoData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch vehicle data from SUMO API
        const response = await fetch('http://localhost:3001/api/sumo/vehicles/all');
        
        if (!response.ok) {
          const errorText = await response.text();
          if (errorText.includes('BigInt')) {
            throw new Error('Simülasyon verisi uyumsuzluğu. Lütfen simülasyonu yeniden başlatın.');
          }
          throw new Error(`SUMO API error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setSumoVehicles(data.vehicles || []);
        setSimulationTime(data.simulationTime || 0);
        setLastFetch(new Date());
      } catch (error) {
        console.error('Error fetching SUMO data:', error);
        setError(error.message);
        if (error.message.includes('BigInt')) {
          // Stop polling if we encounter a BigInt error
          return;
        }
      } finally {
        setLoading(false);
      }
    };
    
    // Initial fetch
    fetchSumoData();
    
    // Set up polling every 2 seconds
    const intervalId = setInterval(fetchSumoData, 2000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [isRunning]);
  
  // Format simulation time (seconds) to minutes:seconds
  const formatSimTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };
  
  if (!isRunning) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" component="div">
            SUMO Simulasyon Durumu: Çalışmıyor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Araç verilerini görmek için SUMO simülasyonunu başlatın.
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" component="div">
            SUMO Simulasyonu: Aktif
          </Typography>
          <Chip 
            label={loading ? "Yenileniyor..." : "Canlı"} 
            color={loading ? "default" : "success"} 
            size="small" 
          />
        </Box>
        
        {loading && <LinearProgress sx={{ mb: 1 }} />}
        
        {error && (
          <Box sx={{ 
            backgroundColor: 'error.light', 
            p: 1, 
            borderRadius: 1, 
            mb: 2 
          }}>
            <Typography variant="body2" color="error.contrastText">
              {error.includes('BigInt') 
                ? 'Simülasyon verisi uyumsuzluğu tespit edildi. Lütfen simülasyonu yeniden başlatın.'
                : `Hata: ${error}`
              }
            </Typography>
          </Box>
        )}
        
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2" color="text.secondary">
            Son güncelleme: {lastFetch ? lastFetch.toLocaleTimeString() : 'Hiç'}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Sim. Zaman: {formatSimTime(simulationTime)}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" mb={1}>
          <TrafficIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1">
            Simülasyondaki araçlar: {sumoVehicles.length}
          </Typography>
        </Box>
        
        {sumoVehicles.length > 0 ? (
          <List dense sx={{ maxHeight: '150px', overflow: 'auto' }}>
            {sumoVehicles.slice(0, 5).map((vehicle, index) => (
              <React.Fragment key={`vehicle-${vehicle.id}-${index}`}>
                {index > 0 && <Divider component="li" />}
                <ListItem>
                  <DirectionsCarIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <ListItemText 
                    primary={`Araç ${vehicle.id || `#${index+1}`}`} 
                    secondary={
                      <React.Fragment>
                        <Box display="flex" alignItems="center" mt={0.5}>
                          <SpeedIcon sx={{ mr: 0.5, fontSize: 'small', color: 'text.secondary' }} />
                          <Typography variant="body2" component="span" color="text.secondary">
                            {vehicle.speed?.toFixed(1) || 0} m/s
                          </Typography>
                          {vehicle.battery !== undefined && (
                            <>
                              <Box mx={1}>|</Box>
                              <BatteryChargingFullIcon sx={{ mr: 0.5, fontSize: 'small', color: 'text.secondary' }} />
                              <Typography variant="body2" component="span" color="text.secondary">
                                {vehicle.battery?.toFixed(1) || 0}%
                              </Typography>
                            </>
                          )}
                        </Box>
                      </React.Fragment>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', mt: 2, mb: 1 }}>
            Simülasyonda henüz araç yok
          </Typography>
        )}
        
        {sumoVehicles.length > 5 && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
            +{sumoVehicles.length - 5} daha fazla araç...
          </Typography>
        )}
        
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1, fontStyle: 'italic' }}>
          * SUMO simülasyonundan gerçek zamanlı veriler gösteriliyor
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SimulationStatus;
