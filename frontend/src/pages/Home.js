import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InventoryIcon from '@mui/icons-material/Inventory';
import TimelineIcon from '@mui/icons-material/Timeline';
import RouteIcon from '@mui/icons-material/Route';
import '../assets/styles/global.css';

const ModuleCard = ({ title, description, icon, link }) => (
  <Card 
    sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 3
      }
    }}
  >
    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      {icon}
      <Typography variant="h5" component="h2" sx={{ mt: 2, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
      <Button 
        component={Link} 
        to={link} 
        variant="contained" 
        sx={{ mt: 'auto' }}
      >
        Keşfet →
      </Button>
    </CardContent>
  </Card>
);

const Home = () => {
  const modules = [
    {
      title: 'Rota Optimizasyon Modülü',
      description: 'Akıllı algoritmalar ile en verimli rotaları belirleyin',
      icon: <RouteIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      link: '/route-optimization'
    },
    
    {
      title: 'EV Şarj Yönetimi Modülü',
      description: 'Elektrikli araçların şarj durumlarını yönetin',
      icon: <BatteryChargingFullIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      link: '/ev-charging'
    },
    {
      title: 'Performans İzleme Modülü',
      description: 'Filo performansını gerçek zamanlı takip edin',
      icon: <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      link: '/performance-monitoring'
    },
    {
      title: 'Talep Planlama Modülü',
      description: 'Talep tahminleri ve kapasite planlaması yapın',
      icon: <TimelineIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      link: '/demand-planning'
    },
    {
      title: 'Envanter Yönetimi Modülü',
      description: 'Araç ve ekipman envanterini yönetin',
      icon: <InventoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      link: '/inventory'
    },
    {
      title: 'Bakım ve Varlık Yönetimi Modülü',
      description: 'Araç bakımlarını planlayın ve takip edin',
      icon: <BuildIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      link: '/maintenance'
    },
    
  ];

  return (
    <Box sx={{ p: 4, maxWidth: '1400px', mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Filo Yönetim Sistemi
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Akıllı rota optimizasyonu ve gerçek zamanlı filo izleme çözümleri
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {modules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <ModuleCard {...module} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home; 