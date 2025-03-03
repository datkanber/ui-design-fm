import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Warning as WarningIcon,
  Notifications as NotificationsIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';

const MaintenanceCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="textSecondary" variant="subtitle1" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4">
            {value}
          </Typography>
        </Box>
        <Box sx={{ color: color }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const HealthStatus = ({ title, value }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body1">{title}</Typography>
      <Typography variant="body1">{value}%</Typography>
    </Box>
    <LinearProgress 
      variant="determinate" 
      value={value} 
      color={value >= 90 ? "success" : value >= 70 ? "warning" : "error"}
      sx={{ height: 8, borderRadius: 4 }}
    />
  </Box>
);

const MaintenanceAlert = ({ title, description, severity, time }) => (
  <ListItem>
    <ListItemText
      primary={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1">{title}</Typography>
          <Chip 
            label={severity} 
            color={severity === 'Urgent' ? 'error' : severity === 'Warning' ? 'warning' : 'info'} 
            size="small" 
          />
        </Box>
      }
      secondary={
        <>
          <Typography variant="body2" color="textSecondary">{description}</Typography>
          <Typography variant="caption" color="textSecondary">{time}</Typography>
        </>
      }
    />
  </ListItem>
);

export default function Maintenance() {
  return (
    <Box sx={{ p: 3 }}>
      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MaintenanceCard
            title="Planlanan Bakımlar"
            value="8"
            icon={<CalendarIcon sx={{ fontSize: 40 }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MaintenanceCard
            title="Acil Onarımlar"
            value="3"
            icon={<WarningIcon sx={{ fontSize: 40 }} />}
            color="error.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MaintenanceCard
            title="Tahminsel Uyarılar"
            value="5"
            icon={<NotificationsIcon sx={{ fontSize: 40 }} />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MaintenanceCard
            title="Filo Sağlık Skoru"
            value="87%"
            icon={<FavoriteIcon sx={{ fontSize: 40 }} />}
            color="success.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Maintenance Schedule */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Bakım Programı</Typography>
                <ButtonGroup variant="outlined" size="small">
                  <Button>Gün</Button>
                  <Button>Hafta</Button>
                  <Button>Ay</Button>
                </ButtonGroup>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Araç</TableCell>
                      <TableCell>Tür</TableCell>
                      <TableCell>Açıklama</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Tarih</TableCell>
                      <TableCell>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>EV-001</TableCell>
                      <TableCell>
                        <Chip label="Periyodik" color="warning" size="small" />
                      </TableCell>
                      <TableCell>Lastik Rotasyonu</TableCell>
                      <TableCell>
                        <Chip label="Planlandı" color="info" size="small" />
                      </TableCell>
                      <TableCell>2024-02-15</TableCell>
                      <TableCell>
                        <Button size="small" variant="contained">Detaylar</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>EV-002</TableCell>
                      <TableCell>
                        <Chip label="Onarım" color="error" size="small" />
                      </TableCell>
                      <TableCell>Fren Sistemi Kontrolü</TableCell>
                      <TableCell>
                        <Chip label="Acil" color="error" size="small" />
                      </TableCell>
                      <TableCell>2024-02-10</TableCell>
                      <TableCell>
                        <Button size="small" variant="contained">Detaylar</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Maintenance History Chart would go here */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Bakım Geçmişi</Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="textSecondary">Grafik burada görüntülenecek</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Vehicle Health & Alerts */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Araç Sağlık Durumu</Typography>
              <HealthStatus title="Batarya Sağlığı" value={85} />
              <HealthStatus title="Fren Sistemi" value={92} />
              <HealthStatus title="Lastik Durumu" value={78} />
              <HealthStatus title="Genel Performans" value={88} />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Bakım Uyarıları</Typography>
                <Button size="small">Tümünü Gör</Button>
              </Box>
              <List>
                <MaintenanceAlert
                  title="Fren Sistemi Uyarısı"
                  description="EV-002 acil fren kontrolü gerekiyor"
                  severity="Urgent"
                  time="2 saat önce"
                />
                <Divider />
                <MaintenanceAlert
                  title="Batarya Performans Uyarısı"
                  description="EV-003 batarya verimliliği eşik değerin altında"
                  severity="Warning"
                  time="5 saat önce"
                />
                <Divider />
                <MaintenanceAlert
                  title="Planlı Bakım Zamanı"
                  description="EV-001 rutin bakım zamanı geldi"
                  severity="Info"
                  time="1 gün önce"
                />
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 