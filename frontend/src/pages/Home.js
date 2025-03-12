import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Button, Box, Container, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import RouteIcon from '@mui/icons-material/Route';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import InventoryIcon from '@mui/icons-material/Inventory';
import BuildIcon from '@mui/icons-material/Build';
// import LocationOnIcon from '@mui/icons-material/LocationOn';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import '../assets/styles/global.css';

// Styled components for enhanced visuals
const HeroSection = styled(Paper)(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#f5f7fa',
  backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(6),
  padding: theme.spacing(4, 0), // Küçültüldü: 8 -> 4
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'url("https://plus.unsplash.com/premium_photo-1681487855134-d6c0434f91f8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.2,
  },
}));

const ModuleCardStyled = styled(Card)(({ theme, bgcolor }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
  background: `linear-gradient(135deg, ${bgcolor}15 0%, ${bgcolor}05 100%)`,
  borderLeft: `4px solid ${bgcolor}`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 16px 40px ${bgcolor}30`,
    '& .moduleCardIcon': {
      transform: 'scale(1.1)',
    },
    '& .card-button': {
      backgroundColor: bgcolor,
      color: '#fff',
    }
  }
}));

const IconWrapper = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '10px 0', // Margin azaltıldı (20px -> 10px)
  padding: theme.spacing(1.5), // Padding azaltıldı (2 -> 1.5)
  transition: 'transform 0.3s ease-in-out',
  backgroundColor: `${color}15`,
  borderRadius: '50%',
  width: '70px', // Küçültüldü (80px -> 70px) 
  height: '70px', // Küçültüldü (80px -> 70px)
}));

const ModuleCard = ({ title, description, icon, link, color }) => (
  <ModuleCardStyled bgcolor={color}>
    <CardContent sx={{ 
      flexGrow: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      textAlign: 'center',
      padding: '16px', // Padding azaltıldı (3 -> 16px)
    }}>
      <IconWrapper className="moduleCardIcon" color={color}>
        {React.cloneElement(icon, { sx: { fontSize: 35, color: color } })} {/* İkon boyutu küçültüldü (40 -> 35) */}
      </IconWrapper>
      <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 600 }}> {/* H5'ten H6'ya düşürüldü, margin azaltıldı */}
        {title}
      </Typography>
      <Typography 
        variant="body2" // Body1'den body2'ye küçültüldü
        color="text.secondary" 
        sx={{ 
          mb: 2, // Margin azaltıldı (3 -> 2)
          fontSize: '0.85rem', // Font boyutu küçültüldü
          lineHeight: 1.4 // Satır aralığı azaltıldı
        }}>
        {description}
      </Typography>
      <Button 
        component={Link} 
        to={link} 
        variant="outlined"
        className="card-button" 
        size="medium" // Large'dan medium'a küçültüldü 
        sx={{ 
          mt: 'auto',
          py: 0.75, // Y padding azaltıldı (1.5 -> 0.75)
          px: 3,
          borderRadius: 2,
          fontSize: '0.9rem', // Font boyutu küçültüldü (1rem -> 0.9rem) 
          fontWeight: 500,
          textTransform: 'none',
          borderColor: color,
          color: color,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 6px 15px ${color}40`,
            backgroundColor: color,
            borderColor: color,
            color: '#fff'
          }
        }}
      >
        Explore
      </Button>
    </CardContent>
  </ModuleCardStyled>
);

const Home = () => {
  const modules = [
    {
      title: 'Route Optimization',
      description: 'Determine the most efficient routes with intelligent algorithms',
      icon: <RouteIcon />,
      color: '#3f51b5',
      link: '/route-optimization'
    },
    {
      title: 'Fleet Monitoring',
      description: 'Monitor fleet operations in real-time with GPS tracking',
      icon: <GpsFixedIcon />,
      color: '#ff5722',
      link: '/fleet-monitoring'
    },
    {
      title: 'EV Charging Management',
      description: 'Manage charging status and schedules for electric vehicles',
      icon: <BatteryChargingFullIcon />,
      color: '#4caf50',
      link: '/ev-charging'
    },
    {
      title: 'Performance Monitoring',
      description: 'Track fleet performance in real-time with advanced analytics',
      icon: <AssessmentIcon />,
      color: '#f44336',
      link: '/performance-monitoring'
    },
    {
      title: 'Demand Planning',
      description: 'Forecast demand and plan capacity efficiently',
      icon: <TimelineIcon />,
      color: '#ff9800',
      link: '/demand-planning'
    },
    {
      title: 'Inventory Management',
      description: 'Manage and track vehicles and equipment inventory',
      icon: <InventoryIcon />,
      color: '#2196f3',
      link: '/inventory'
    },
    {
      title: 'Maintenance & Asset Management',
      description: 'Plan and track vehicle maintenance to maximize uptime',
      icon: <BuildIcon />,
      color: '#9c27b0',
      link: '/maintenance'
    },
  ];

  return (
    <Container maxWidth="xl">
      <HeroSection elevation={0}>
        <Box sx={{ position: 'relative', textAlign: 'center', px: 4, py: 2 }}> {/* Y padding azaltıldı */}
          <Typography variant="h3" component="h1" sx={{ mb: 1, fontWeight: 700 }}> {/* H2'den H3'e küçültüldü */}
            Fleet Management System
          </Typography>
        </Box>
      </HeroSection>

      <Grid container spacing={3}> {/* Grid aralıkları azaltıldı (4 -> 3) */}
        {modules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}> {/* Mevcut genişlik korundu */}
            <ModuleCard {...module} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, mb: 3, textAlign: 'center' }}> {/* Margin'ler azaltıldı (8,4 -> 6,3) */}
        <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}> {/* H4'ten H5'e küçültüldü */}
          Ready to optimize your fleet operations?
        </Typography>
        <Button 
          variant="outlined" 
          size="medium" // Large'dan medium'a küçültüldü
          component={Link}
          to="/contact"
          sx={{ 
            py: 1, // Y padding azaltıldı (1.5 -> 1)
            px: 4,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem', // Font boyutu küçültüldü (1.1rem -> 1rem)
            fontWeight: 500
          }}
        >
          Contact Support
        </Button>
      </Box>
    </Container>
  );
};

export default Home;