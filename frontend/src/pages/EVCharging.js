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
  Paper,
  Chip,
  ButtonGroup,
  List,
  ListItem,
  LinearProgress
} from '@mui/material';
import {
  Battery90 as BatteryIcon,
  Power as PowerIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';


const MetricCard = ({ title, value, icon, color, subtitle }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="textSecondary" variant="subtitle1" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ color: color }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const StationStatus = ({ name, type, status, progress }) => (
  <ListItem>
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box>
          <Typography variant="subtitle1">{name}</Typography>
          <Typography variant="body2" color="textSecondary">{type}</Typography>
        </Box>
        <Chip 
          label={status} 
          color={
            status === 'Müsait' ? 'success' : 
            status === 'Kullanımda' ? 'primary' : 
            'error'
          } 
          size="small" 
        />
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ height: 5, borderRadius: 5 }}
        color={
          status === 'Müsait' ? 'success' : 
          status === 'Kullanımda' ? 'primary' : 
          'error'
        }
      />
    </Box>
  </ListItem>
);

export default function EVCharging() {
  return (
    <Box sx={{ p: 3 }}>
      {/* Metrik Kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Aktif Şarj"
            value="5"
            icon={<BatteryIcon sx={{ fontSize: 40 }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Müsait İstasyonlar"
            value="8"
            icon={<PowerIcon sx={{ fontSize: 40 }} />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Yeşil Enerji"
            value="85%"
            icon={<PowerIcon sx={{ fontSize: 40 }} />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Enerji Maliyeti"
            value="₺2.8"
            subtitle="kWh başına"
            icon={<MoneyIcon sx={{ fontSize: 40 }} />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Şarj Programı ve Harita */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Şarj Programı</Typography>
                <ButtonGroup size="small">
                  <Button variant="contained">Bugün</Button>
                  <Button>Yarın</Button>
                  <Button>Hafta</Button>
                </ButtonGroup>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Araç</TableCell>
                      <TableCell>İstasyon</TableCell>
                      <TableCell>Başlangıç</TableCell>
                      <TableCell>Süre</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>EV-001</TableCell>
                      <TableCell>İstasyon A</TableCell>
                      <TableCell>14:30</TableCell>
                      <TableCell>45 dk</TableCell>
                      <TableCell>
                        <Chip label="Aktif" color="success" size="small" />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="contained">Detaylar</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>EV-002</TableCell>
                      <TableCell>İstasyon B</TableCell>
                      <TableCell>15:00</TableCell>
                      <TableCell>60 dk</TableCell>
                      <TableCell>
                        <Chip label="Planlandı" color="warning" size="small" />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="contained">Detaylar</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Harita için yer tutucu */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Şarj İstasyonları Haritası</Typography>
              <Box sx={{ height: 400, bgcolor: 'grey.100', borderRadius: 1 }}>
                {/* Harita bileşeni buraya eklenecek */}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* İstasyon Durumları ve Analitikler */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>İstasyon Durumları</Typography>
              <List>
                <StationStatus
                  name="İstasyon A"
                  type="150kW DC Hızlı Şarj"
                  status="Müsait"
                  progress={0}
                />
                <StationStatus
                  name="İstasyon B"
                  type="150kW DC Hızlı Şarj"
                  status="Kullanımda"
                  progress={75}
                />
                <StationStatus
                  name="İstasyon C"
                  type="50kW DC Şarj"
                  status="Bakımda"
                  progress={100}
                />
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Enerji Tüketimi</Typography>
              <Box sx={{ height: 250, bgcolor: 'grey.100', borderRadius: 1 }}>
                {/* Grafik bileşeni buraya eklenecek */}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 