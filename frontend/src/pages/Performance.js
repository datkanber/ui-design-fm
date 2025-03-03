import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  ButtonGroup,
  Button,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  BatteryChargingFull as BatteryIcon,
  Person as PersonIcon,
  Star as StarIcon
} from '@mui/icons-material';
import ForestIcon from '@mui/icons-material/Forest';

const MetricCard = ({ title, value, icon, color }) => (
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
        </Box>
        <Box sx={{ color: color }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const EnvironmentalMetric = ({ title, value, change }) => (
  <Card sx={{ bgcolor: 'grey.100' }}>
    <CardContent sx={{ textAlign: 'center' }}>
      <Typography color="textSecondary" variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div" gutterBottom>
        {value}
      </Typography>
      <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box component="span" sx={{ mr: 0.5 }}>↑</Box>
        {change} vs geçen ay
      </Typography>
    </CardContent>
  </Card>
);

export default function Performance() {
  return (
    <Box sx={{ p: 3 }}>
      {/* Metrik Kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Zamanında Teslimat"
            value="94%"
            icon={<TimeIcon sx={{ fontSize: 40 }} />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Batarya Sağlığı"
            value="87%"
            icon={<BatteryIcon sx={{ fontSize: 40 }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Sürücü Performansı"
            value="4.8"
            icon={<PersonIcon sx={{ fontSize: 40 }} />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Karbon Tasarrufu"
            value="2.4t"
            icon={<ForestIcon sx={{ fontSize: 40 }} />}
            color="success.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Sürücü Performansı */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Sürücü Performansı</Typography>
                <ButtonGroup size="small">
                  <Button variant="contained">Gün</Button>
                  <Button>Hafta</Button>
                  <Button>Ay</Button>
                </ButtonGroup>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sürücü</TableCell>
                      <TableCell>Çalışma Saati</TableCell>
                      <TableCell>Teslimatlar</TableCell>
                      <TableCell>Müşteri Puanı</TableCell>
                      <TableCell>Durum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Ahmet Yılmaz</TableCell>
                      <TableCell>7.5s</TableCell>
                      <TableCell>15/16</TableCell>
                      <TableCell>
                        4.8 <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                      </TableCell>
                      <TableCell>
                        <Chip label="Aktif" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Mehmet Demir</TableCell>
                      <TableCell>6.2s</TableCell>
                      <TableCell>12/12</TableCell>
                      <TableCell>
                        4.9 <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                      </TableCell>
                      <TableCell>
                        <Chip label="Mola" color="warning" size="small" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Teslimat Performansı */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Teslimat Performansı</Typography>
              <Box sx={{ height: 300, bgcolor: 'grey.100', borderRadius: 1 }}>
                {/* Grafik bileşeni buraya eklenecek */}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Çevresel Etki */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Araç Performansı</Typography>
              <Box sx={{ height: 300, bgcolor: 'grey.100', borderRadius: 1 }}>
                {/* Grafik bileşeni buraya eklenecek */}
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Çevresel Etki</Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <EnvironmentalMetric
                    title="Karbon Dengeleme"
                    value="2.4t"
                    change="12%"
                  />
                </Grid>
                <Grid item xs={6}>
                  <EnvironmentalMetric
                    title="Yeşil Enerji Kullanımı"
                    value="85%"
                    change="5%"
                  />
                </Grid>
              </Grid>
              <Box sx={{ height: 200, bgcolor: 'grey.100', borderRadius: 1 }}>
                {/* Grafik bileşeni buraya eklenecek */}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 