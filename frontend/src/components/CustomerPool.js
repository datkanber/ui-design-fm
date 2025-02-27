import React, { useMemo, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  Divider,
  Box,
  Chip,
  Tooltip,
  Paper,
  Grid,
  Tab,
  Tabs,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PinDropIcon from '@mui/icons-material/PinDrop';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StorefrontIcon from '@mui/icons-material/Storefront';
import EvStationIcon from '@mui/icons-material/EvStation';
import EditIcon from '@mui/icons-material/Edit';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

export default function CustomerPool({ nodes, selectedDemand, onCustomerSelect, onCustomerUpdate, onCustomerLocate }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState({
    demand: '',
    timeWindow: '',
    weight: ''
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditNode, setCurrentEditNode] = useState(null);

  console.log(nodes)
  const getNodeTypeColor = (type) => {
    switch(type) {
      case 'Delivery': return '#4caf50';    // Yeşil
      case 'Entrance': return '#2196f3';    // Mavi
      case 'Exit': return '#f44336';        // Kırmızı
      case 'DepoCharging': return '#ff9800'; // Turuncu
      default: return '#757575';            // Gri
    }
  };

  const getNodeTypeName = (type) => {
    switch(type) {
      case 'Delivery': return 'Müşteri';
      case 'Entrance': return 'Depo (Giriş)';
      case 'Exit': return 'Depo (Çıkış)';
      case 'DepoCharging': return 'Şarj İstasyonu';
      default: return type;
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getNodeIcon = (type) => {
    switch(type) {
      case 'Entrance':
      case 'Exit':
        return <StorefrontIcon fontSize="small" />;
      case 'DepoCharging':
        return <EvStationIcon fontSize="small" />;
      default:
        return <LocationOnIcon fontSize="small" />;
    }
  };

  // Filtreleme menüsü
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Müşteri seçme işlemleri
  const handleSelectAllCustomers = (event) => {
    if (event.target.checked) {
      setSelectedCustomers(categorizedNodes.customers.map(node => node.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };

  // Düzenleme dialog işlemleri
  const handleEditClick = (node) => {
    setCurrentEditNode(node);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setCurrentEditNode(null);
  };

  const handleEditSave = () => {
    if (currentEditNode && onCustomerUpdate) {
      onCustomerUpdate(currentEditNode);
    }
    handleEditClose();
  };

  // Filtreleme ve arama fonksiyonları
  const applyFilters = (nodes) => {
    if (!nodes) return [];
    
    return nodes.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          node.id.toString().includes(searchTerm);
      
      const matchesDemand = !filterCriteria.demand || 
                           node.demand >= parseInt(filterCriteria.demand);
      
      const matchesWeight = !filterCriteria.weight || 
                           node.weight >= parseInt(filterCriteria.weight);
      
      const matchesTimeWindow = !filterCriteria.timeWindow || 
                               (node.readyTime <= parseInt(filterCriteria.timeWindow) &&
                                node.dueDate >= parseInt(filterCriteria.timeWindow));

      return matchesSearch && matchesDemand && matchesWeight && matchesTimeWindow;
    });
  };

  const categorizedNodes = useMemo(() => {
    if (!nodes) return { customers: [], depots: [], chargingStations: [] };
    
    const filteredCustomers = applyFilters(nodes.filter(node => node.nodeType === 'Delivery'));
    
    return {
      customers: filteredCustomers,
      depots: nodes.filter(node => ['Entrance', 'Exit'].includes(node.nodeType)),
      chargingStations: nodes.filter(node => node.nodeType === 'DepoCharging')
    };
  }, [nodes, searchTerm, filterCriteria]);

  const renderNodeItem = (node) => (
    <ListItem 
      style={{ 
        flexDirection: 'column', 
        alignItems: 'flex-start', 
        backgroundColor: selectedCustomers.includes(node.id) ? '#e3f2fd' : 'white',
        margin: '4px', 
        borderRadius: '4px',
        cursor: node.nodeType === 'Delivery' ? 'pointer' : 'default'
      }}
      onClick={() => node.nodeType === 'Delivery' && handleCustomerSelect(node.id)}
    >
      <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
        <Box display="flex" alignItems="center">
          {node.nodeType === 'Delivery' && (
            <Checkbox
              checked={selectedCustomers.includes(node.id)}
              onChange={() => handleCustomerSelect(node.id)}
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon />}
            />
          )}
          {getNodeIcon(node.nodeType)}
          <Typography variant="subtitle1" style={{ fontWeight: 'bold', color: '#1976d2', marginLeft: '8px' }}>
            {node.name}
          </Typography>
        </Box>
        <Box>
          <Chip
            size="small"
            label={`ID: ${node.id}`}
            style={{ backgroundColor: '#e3f2fd', marginRight: '4px' }}
          />
          <Chip
            size="small"
            label={getNodeTypeName(node.nodeType)}
            style={{ backgroundColor: getNodeTypeColor(node.nodeType), color: 'white' }}
          />
          {node.nodeType === 'Delivery' && (
            <>
              <IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                handleEditClick(node);
              }}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                onCustomerLocate && onCustomerLocate(node);
              }}>
                <MapIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      </Box>
      
      <Box mt={1} width="100%">
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Tooltip title="GPS Koordinatları">
              <Box display="flex" alignItems="center">
                <LocationOnIcon fontSize="small" color="action" />
                <Typography variant="body2" style={{ marginLeft: '4px', color: '#666' }}>
                  {`(${node.location.lat.toFixed(6)}, ${node.location.lng.toFixed(6)})`}
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          <Grid item xs={12}>
            <Tooltip title="X-Y Koordinatları">
              <Box display="flex" alignItems="center">
                <PinDropIcon fontSize="small" color="action" />
                <Typography variant="body2" style={{ marginLeft: '4px', color: '#666' }}>
                  {`(${node.location.x.toFixed(2)}, ${node.location.y.toFixed(2)})`}
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      {node.nodeType === 'Delivery' && (
        <>
          <Box mt={1} width="100%">
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Tooltip title="Zaman Penceresi">
                  <Box display="flex" alignItems="center">
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2" style={{ marginLeft: '4px', color: '#666' }}>
                      {`Teslimat : ${node.readyTime} - ${node.dueDate}`}
                    </Typography>
                  </Box>
                </Tooltip>
              </Grid>
              <Grid item xs={12}>
                <Tooltip title="Servis Süresi">
                  <Box display="flex" alignItems="center">
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="body2" style={{ marginLeft: '4px', color: '#666' }}>
                      {`Servis : ${node.serviceTime} saniye`}
                    </Typography>
                  </Box>
                </Tooltip>
              </Grid>
            </Grid>
          </Box>

          <Box mt={1} width="100%">
            <Tooltip title="Talep Detayları">
              <Box display="flex" alignItems="center">
                <LocalShippingIcon fontSize="small" color="action" />
                <Typography variant="body2" style={{ marginLeft: '4px', color: '#666' }}>
                  {`${node.productInfo.name} - Miktar: ${node.demand} | Ağırlık: ${node.weight} kg`}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        </>
      )}
    </ListItem>
  );

  return (
    <Card style={{ height: 'calc(100vh - 32px)', overflow: 'hidden', borderRadius: '16px' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom style={{ textAlign: 'center', color: '#1976d2', fontWeight: 'bold' }}>
          Node Havuzu
          {selectedDemand && (
            <Chip
              label={selectedDemand}
              size="small"
              color="primary"
              style={{ marginLeft: '8px' }}
            />
          )}
        </Typography>

        {/* Arama ve Filtreleme Araçları */}
        <Box mb={2}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Müşteri ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleFilterClick}>
                    <FilterListIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Filtreleme Menüsü */}
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem>
            <FormControl fullWidth size="small">
              <InputLabel>Min. Talep Miktarı</InputLabel>
              <Select
                value={filterCriteria.demand}
                onChange={(e) => setFilterCriteria(prev => ({ ...prev, demand: e.target.value }))}
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="10">≥ 10</MenuItem>
                <MenuItem value="50">≥ 50</MenuItem>
                <MenuItem value="100">≥ 100</MenuItem>
              </Select>
            </FormControl>
          </MenuItem>
          <MenuItem>
            <FormControl fullWidth size="small">
              <InputLabel>Min. Ağırlık</InputLabel>
              <Select
                value={filterCriteria.weight}
                onChange={(e) => setFilterCriteria(prev => ({ ...prev, weight: e.target.value }))}
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="10">≥ 10 kg</MenuItem>
                <MenuItem value="50">≥ 50 kg</MenuItem>
                <MenuItem value="100">≥ 100 kg</MenuItem>
              </Select>
            </FormControl>
          </MenuItem>
          <MenuItem>
            <FormControl fullWidth size="small">
              <InputLabel>Zaman Aralığı</InputLabel>
              <Select
                value={filterCriteria.timeWindow}
                onChange={(e) => setFilterCriteria(prev => ({ ...prev, timeWindow: e.target.value }))}
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="540">09:00</MenuItem>
                <MenuItem value="720">12:00</MenuItem>
                <MenuItem value="900">15:00</MenuItem>
              </Select>
            </FormControl>
          </MenuItem>
        </Menu>

        {/* Sekmeler */}
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          style={{ marginBottom: '8px' }}
        >
          <Tab 
            label={`Müşteriler (${categorizedNodes.customers.length})`}
            icon={<LocationOnIcon />}
          />
          <Tab 
            label={`Depolar (${categorizedNodes.depots.length})`}
            icon={<StorefrontIcon />}
          />
          <Tab 
            label={`Şarj İst. (${categorizedNodes.chargingStations.length})`}
            icon={<EvStationIcon />}
          />
        </Tabs>

        {/* Tümünü Seç Checkbox'ı */}
        {selectedTab === 0 && categorizedNodes.customers.length > 0 && (
          <Box mb={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedCustomers.length === categorizedNodes.customers.length}
                  indeterminate={selectedCustomers.length > 0 && selectedCustomers.length < categorizedNodes.customers.length}
                  onChange={handleSelectAllCustomers}
                />
              }
              label="Tümünü Seç"
            />
          </Box>
        )}

        {/* Node Listesi */}
        <Paper style={{ maxHeight: 'calc(100vh - 250px)', overflow: 'auto', backgroundColor: '#f5f5f5' }}>
          <List dense>
            {selectedTab === 0 && categorizedNodes.customers.map((node, index) => (
              <React.Fragment key={node.id}>
                {renderNodeItem(node)}
                {index < categorizedNodes.customers.length - 1 && <Divider variant="middle" />}
              </React.Fragment>
            ))}
            {selectedTab === 1 && categorizedNodes.depots.map((node, index) => (
              <React.Fragment key={node.id}>
                {renderNodeItem(node)}
                {index < categorizedNodes.depots.length - 1 && <Divider variant="middle" />}
              </React.Fragment>
            ))}
            {selectedTab === 2 && categorizedNodes.chargingStations.map((node, index) => (
              <React.Fragment key={node.id}>
                {renderNodeItem(node)}
                {index < categorizedNodes.chargingStations.length - 1 && <Divider variant="middle" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>

        {/* Düzenleme Dialog'u */}
        <Dialog open={editDialogOpen} onClose={handleEditClose}>
          <DialogTitle>Müşteri Bilgilerini Düzenle</DialogTitle>
          <DialogContent>
            {currentEditNode && (
              <Box sx={{ pt: 2 }}>
                <TextField
                  fullWidth
                  label="Müşteri Adı"
                  value={currentEditNode.name}
                  onChange={(e) => setCurrentEditNode(prev => ({ ...prev, name: e.target.value }))}
                  margin="dense"
                />
                <TextField
                  fullWidth
                  label="Talep Miktarı"
                  type="number"
                  value={currentEditNode.demand}
                  onChange={(e) => setCurrentEditNode(prev => ({ ...prev, demand: parseInt(e.target.value) }))}
                  margin="dense"
                />
                <TextField
                  fullWidth
                  label="Ağırlık (kg)"
                  type="number"
                  value={currentEditNode.weight}
                  onChange={(e) => setCurrentEditNode(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
                  margin="dense"
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Hazır Olma Zamanı"
                      type="number"
                      value={currentEditNode.readyTime}
                      onChange={(e) => setCurrentEditNode(prev => ({
                        ...prev,
                        readyTime: parseInt(e.target.value)
                      }))}
                      margin="dense"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Son Teslim Zamanı"
                      type="number"
                      value={currentEditNode.dueDate}
                      onChange={(e) => setCurrentEditNode(prev => ({
                        ...prev,
                        dueDate: parseInt(e.target.value)
                      }))}
                      margin="dense"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Servis Süresi (dakika)"
                  type="number"
                  value={currentEditNode.serviceTime}
                  onChange={(e) => setCurrentEditNode(prev => ({ ...prev, serviceTime: parseInt(e.target.value) }))}
                  margin="dense"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>İptal</Button>
            <Button onClick={handleEditSave} color="primary">
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}