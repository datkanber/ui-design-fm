import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Button, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, Card, CardContent, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OptimizationForm from '../components/OptimizationForm';
import RouteOptimizationMap from '../components/RouteOptimizationMap';
import CustomerPool from '../components/CustomerPool';
import OrderManagement from '../components/OrderManagement';
import VehicleEditDialog from '../components/VehicleEditDialog';
import { ComparisonResults, ComparisonChart } from '../components/MultiAlgorithmComparison';
import { vehicles as staticVehicles } from '../data/vehicles';
import { chargingStations as staticChargingStations } from '../data/chargingStations';
import { orders as staticOrders } from '../data/orders';
import { routes as staticRoutes } from '../data/routes';
import { customers as staticCustomers } from '../data/customers';
import '../assets/styles/global.css';
import 'leaflet/dist/leaflet.css';

export default function RouteOptimization() {
  const [algorithms, setAlgorithms] = useState(['Simulated Annealing']);
  const [comparisonResults, setComparisonResults] = useState([]);
  const [iterationNumber, setIterationNumber] = useState(100);
  const [initialTemperature, setInitialTemperature] = useState(1000);
  const [alpha, setAlpha] = useState(0.95);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [openOrderManagement, setOpenOrderManagement] = useState(false);
  const [openComparisonResults, setOpenComparisonResults] = useState(false);
  const [vehicles, setVehicles] = useState(staticVehicles);
  const [openVehicleEdit, setOpenVehicleEdit] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);

  const routeColors = {
    'Simulated Annealing': 'blue',
    'Tabu Search': 'green',
    'OR-Tools': 'red'
  };

  const plannedRoutes = (staticRoutes[algorithms[0]] || []).map(r => ({ positions: r.path || [] }));
  const completedRoutes = (staticRoutes['Completed'] || []).map(r => ({ positions: r.path || [] }));
  const traffic = (staticRoutes['Traffic'] || []).map(r => ({ positions: r.path || [] }));

  const runComparison = () => {
    const results = algorithms.map(algo => ({
      algorithm: algo,
      time: Math.floor(Math.random() * 1000),
      cost: Math.floor(Math.random() * 500),
    }));
    setComparisonResults(results);
    setOpenComparisonResults(true);
  };

  const handleVehicleEdit = (vehicle) => {
    setCurrentVehicle(vehicle);
    setOpenVehicleEdit(true);
  };

  const handleSaveVehicle = (updatedVehicle) => {
    setVehicles(vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '16px', padding: '1rem', alignItems: 'start' }}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: '1 / 2' }}>
        <Card style={{ padding: '16px', backgroundColor: '#fff', border: '1px solid #ddd' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Algoritma Karşılaştırma 
            </Typography>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="algorithm-label" style={{ background: 'white', padding: '0 4px' }}>
                Algoritmalar
              </InputLabel>
              <Select
                labelId="algorithm-label"
                multiple
                value={Array.isArray(algorithms) ? algorithms : []}
                onChange={(event) => {
                  const value = event.target.value;
                  setAlgorithms(Array.isArray(value) ? value : [value]);
                }}
                renderValue={(selected) => selected.join(', ')}
              >
                {['Simulated Annealing', 'Tabu Search', 'OR-Tools'].map((algo) => (
                  <MenuItem key={algo} value={algo}>
                    <Checkbox checked={algorithms.indexOf(algo) > -1} />
                    <ListItemText primary={algo} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" fullWidth onClick={runComparison} style={{ marginTop: '16px', backgroundColor: '#004085', color: '#fff' }}>
              Başlat
            </Button>
          </CardContent>
        </Card>

        <OptimizationForm
          algorithm={algorithms[0]}
          setAlgorithm={setAlgorithms}
          iterationNumber={iterationNumber}
          setIterationNumber={setIterationNumber}
          initialTemperature={initialTemperature}
          setInitialTemperature={setInitialTemperature}
          alpha={alpha}
          setAlpha={setAlpha}
          vehicles={vehicles}
          selectedVehicles={selectedVehicles}
          setSelectedVehicles={setSelectedVehicles}
          onEditVehicle={handleVehicleEdit}
        />
      </div>

      <div style={{ gridColumn: '2 / 3', gridRow: '1 / 3' }}>
        <RouteOptimizationMap
          vehicles={vehicles}
          chargingStations={staticChargingStations}
          routeColors={routeColors}
          orders={staticOrders}
          plannedRoutes={plannedRoutes}
          completedRoutes={completedRoutes}
          traffic={traffic}
        />
      </div>

      <div style={{ gridColumn: '3 / 4', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <CustomerPool customers={staticCustomers} />
        <Button variant="contained" color="primary" onClick={() => setOpenOrderManagement(true)}>
          Talep Yönetimini Aç
        </Button>
      </div>

      <Dialog open={openOrderManagement} onClose={() => setOpenOrderManagement(false)} maxWidth="sm" fullWidth>
        <OrderManagement />
      </Dialog>

      <Dialog open={openComparisonResults} onClose={() => setOpenComparisonResults(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">Sonuç Karşılaştırma</Typography>
          <IconButton onClick={() => setOpenComparisonResults(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Card>
            <CardContent>
              <ComparisonResults results={comparisonResults} />
              <ComparisonChart results={comparisonResults} />
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <VehicleEditDialog open={openVehicleEdit} onClose={() => setOpenVehicleEdit(false)} vehicle={currentVehicle} onSave={handleSaveVehicle} />
    </div>
  );
}