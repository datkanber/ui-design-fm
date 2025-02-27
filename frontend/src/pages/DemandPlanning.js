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
  ButtonGroup,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpIcon,
  People as PeopleIcon,
  AccessTime as TimeIcon,
  Star as StarIcon
} from '@mui/icons-material';

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

const RecommendationItem = ({ title, confidence, description, info }) => (
  <ListItem divider>
    <ListItemText
      primary={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1">{title}</Typography>
          <Chip 
            label={confidence} 
            color={
              confidence === 'Yüksek Güven' ? 'success' :
              confidence === 'Orta Güven' ? 'warning' : 'info'
            }
            size="small" 
          />
        </Box>
      }
      secondary={
        <>
          <Typography variant="body2" color="textSecondary">{description}</Typography>
          <Typography variant="caption" color="textSecondary">{info}</Typography>
        </>
      }
    />
  </ListItem>
);

export default function DemandPlanning() {
  return (
    <Box sx={{ p: 3 }}>
      {/* Metrik Kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Tahmin Doğruluğu"
            value="92%"
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Beklenen Büyüme"
            value="15%"
            icon={<ArrowUpIcon sx={{ fontSize: 40 }} />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Hizmet Seviyesi"
            value="95%"
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Talep Desenleri"
            value="3"
            icon={<TimeIcon sx={{ fontSize: 40 }} />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Talep Tahmini ve Bölgesel Analiz */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Talep Tahmini</Typography>
                <ButtonGroup size="small">
                  <Button variant="contained">Hafta</Button>
                  <Button>Ay</Button>
                  <Button>Çeyrek</Button>
                </ButtonGroup>
              </Box>
              <Box sx={{ height: 300, bgcolor: 'grey.100', borderRadius: 1 }}>
                {/* Grafik bileşeni buraya eklenecek */}
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Bölgesel Analiz</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bölge</TableCell>
                      <TableCell>Mevcut Talep</TableCell>
                      <TableCell>Tahmin</TableCell>
                      <TableCell>Büyüme</TableCell>
                      <TableCell>Güven</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Kuzey</TableCell>
                      <TableCell>1,200</TableCell>
                      <TableCell>1,450</TableCell>
                      <TableCell>
                        <Typography color="success.main">+20.8%</Typography>
                      </TableCell>
                      <TableCell>95%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Güney</TableCell>
                      <TableCell>980</TableCell>
                      <TableCell>1,100</TableCell>
                      <TableCell>
                        <Typography color="success.main">+12.2%</Typography>
                      </TableCell>
                      <TableCell>92%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Analitikler */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Mevsimsel Desenler</Typography>
              <Box sx={{ height: 250, bgcolor: 'grey.100', borderRadius: 1 }}>
                {/* Grafik bileşeni buraya eklenecek */}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Müşteri Memnuniyeti</Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h3">4.8</Typography>
                    <Typography variant="body2" color="textSecondary">Ortalama Puan</Typography>
                  </Box>
                  <Box sx={{ color: 'warning.main' }}>
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} sx={{ fontSize: 20 }} />
                    ))}
                  </Box>
                </Box>
                <Box sx={{ width: '100%', mb: 1 }}>
                  <Box sx={{ width: '85%' }}>
                    <LinearProgress variant="determinate" value={85} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Teslimat performansına dayalı
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Stok Önerileri</Typography>
              <List>
                <RecommendationItem
                  title="Stok Artırımı"
                  confidence="Yüksek Güven"
                  description="Kuzey Bölgesi'nde Ürün A"
                  info="%15 büyüme tahminini baz alır"
                />
                <RecommendationItem
                  title="Stok Optimizasyonu"
                  confidence="Orta Güven"
                  description="Güney Bölgesi'nde Ürün B"
                  info="Mevsimsel desene dayalı"
                />
                <RecommendationItem
                  title="Stok İzleme"
                  confidence="Bilgi"
                  description="Doğu Bölgesi'nde Ürün C"
                  info="Olağandışı talep deseni tespit edildi"
                />
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 