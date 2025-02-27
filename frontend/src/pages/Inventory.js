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
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  LinearProgress
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  LocalShipping as TruckIcon,
  Build as ToolsIcon,
  Warning as WarningIcon
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

const AssetStatus = ({ name, type, status, health }) => (
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
            status === 'Aktif' ? 'success' : 
            status === 'Bakımda' ? 'warning' : 
            'error'
          } 
          size="small" 
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LinearProgress 
          variant="determinate" 
          value={health} 
          sx={{ height: 8, borderRadius: 4, flexGrow: 1 }}
          color={health > 70 ? 'success' : health > 40 ? 'warning' : 'error'}
        />
        <Typography variant="body2" color="textSecondary">
          {health}%
        </Typography>
      </Box>
    </Box>
  </ListItem>
);

export default function Inventory() {
  return (
    <Box sx={{ p: 3 }}>
      {/* Metrik Kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Toplam Araç"
            value="24"
            icon={<TruckIcon sx={{ fontSize: 40 }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Aktif Araçlar"
            value="18"
            icon={<InventoryIcon sx={{ fontSize: 40 }} />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Bakımda"
            value="4"
            icon={<ToolsIcon sx={{ fontSize: 40 }} />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Kritik Durumda"
            value="2"
            icon={<WarningIcon sx={{ fontSize: 40 }} />}
            color="error.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Araç Envanteri */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Araç Envanteri</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Araç ID</TableCell>
                      <TableCell>Model</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Kilometre</TableCell>
                      <TableCell>Son Bakım</TableCell>
                      <TableCell>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>EV-001</TableCell>
                      <TableCell>Tesla Model 3</TableCell>
                      <TableCell>
                        <Chip label="Aktif" color="success" size="small" />
                      </TableCell>
                      <TableCell>45,230 km</TableCell>
                      <TableCell>2024-02-01</TableCell>
                      <TableCell>
                        <Button size="small" variant="contained">Detaylar</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>EV-002</TableCell>
                      <TableCell>Tesla Model Y</TableCell>
                      <TableCell>
                        <Chip label="Bakımda" color="warning" size="small" />
                      </TableCell>
                      <TableCell>32,150 km</TableCell>
                      <TableCell>2024-01-15</TableCell>
                      <TableCell>
                        <Button size="small" variant="contained">Detaylar</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Bakım Geçmişi */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Bakım Geçmişi</Typography>
              <Box sx={{ height: 300, bgcolor: 'grey.100', borderRadius: 1 }}>
                {/* Grafik bileşeni buraya eklenecek */}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Varlık Durumu ve Uyarılar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Varlık Durumu</Typography>
              <List>
                <AssetStatus
                  name="EV-001"
                  type="Tesla Model 3"
                  status="Aktif"
                  health={85}
                />
                <AssetStatus
                  name="EV-002"
                  type="Tesla Model Y"
                  status="Bakımda"
                  health={45}
                />
                <AssetStatus
                  name="EV-003"
                  type="Tesla Model 3"
                  status="Kritik"
                  health={25}
                />
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Envanter Uyarıları</Typography>
              <List>
                <ListItem divider>
                  <ListItemText
                    primary="Kritik Batarya Durumu"
                    secondary="EV-003 batarya değişimi gerekiyor"
                  />
                  <Chip label="Kritik" color="error" size="small" />
                </ListItem>
                <ListItem divider>
                  <ListItemText
                    primary="Planlı Bakım"
                    secondary="EV-001 rutin bakım zamanı yaklaşıyor"
                  />
                  <Chip label="Bilgi" color="info" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Lastik Değişimi"
                    secondary="EV-002 lastik değişimi gerekiyor"
                  />
                  <Chip label="Uyarı" color="warning" size="small" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 