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
import '../assets/styles/global.css';

// Styled components for enhanced visuals
const HeroSection = styled(Paper)(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#f5f7fa',
  backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(6),
  padding: theme.spacing(8, 0),
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
    backgroundImage: 'url("https://images.unsplash.com/photo-1519003722824-194d4455a60c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1950&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.2,
  },
}));

const ModuleCardStyled = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
    '& .moduleCardIcon': {
      transform: 'scale(1.1)',
    }
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '20px 0',
  padding: theme.spacing(2),
  transition: 'transform 0.3s ease-in-out',
}));

const ModuleCard = ({ title, description, icon, link }) => (
  <ModuleCardStyled>
    <CardContent sx={{ 
      flexGrow: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      textAlign: 'center',
      padding: 3
    }}>
      <IconWrapper className="moduleCardIcon">
        {React.cloneElement(icon, { sx: { fontSize: 60 } })}
      </IconWrapper>
      <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {description}
      </Typography>
      <Button 
        component={Link} 
        to={link} 
        variant="contained" 
        size="large"
        sx={{ 
          mt: 'auto',
          py: 1.5,
          px: 3,
          borderRadius: 2,
          fontSize: '1rem',
          fontWeight: 500,
          textTransform: 'none',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
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
      icon: <RouteIcon sx={{ color: '#3f51b5' }} />,
      link: '/route-optimization'
    },
    {
      title: 'EV Charging Management',
      description: 'Manage charging status and schedules for electric vehicles',
      icon: <BatteryChargingFullIcon sx={{ color: '#4caf50' }} />,
      link: '/ev-charging'
    },
    {
      title: 'Performance Monitoring',
      description: 'Track fleet performance in real-time with advanced analytics',
      icon: <AssessmentIcon sx={{ color: '#f44336' }} />,
      link: '/performance-monitoring'
    },
    {
      title: 'Demand Planning',
      description: 'Forecast demand and plan capacity efficiently',
      icon: <TimelineIcon sx={{ color: '#ff9800' }} />,
      link: '/demand-planning'
    },
    {
      title: 'Inventory Management',
      description: 'Manage and track vehicles and equipment inventory',
      icon: <InventoryIcon sx={{ color: '#2196f3' }} />,
      link: '/inventory'
    },
    {
      title: 'Maintenance & Asset Management',
      description: 'Plan and track vehicle maintenance to maximize uptime',
      icon: <BuildIcon sx={{ color: '#9c27b0' }} />,
      link: '/maintenance'
    },
  ];

  return (
    <Container maxWidth="xl">
      <HeroSection elevation={0}>
        <Box sx={{ position: 'relative', textAlign: 'center', px: 4 }}>
          <Typography variant="h2" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
            Fleet Management System
          </Typography>
        </Box>
      </HeroSection>

      <Grid container spacing={4}>
        {modules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <ModuleCard {...module} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Ready to optimize your fleet operations?
        </Typography>
        <Button 
          variant="outlined" 
          size="large"
          component={Link}
          to="/contact"
          sx={{ 
            py: 1.5, 
            px: 4, 
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1.1rem',
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