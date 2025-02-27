import React, { useState, useRef } from 'react';
import { Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, TextField, FormGroup, FormControlLabel, Checkbox, Button, Divider, Collapse } from '@mui/material';

export default function OptimizationForm({ algorithm, setAlgorithm, iterationNumber, setIterationNumber, initialTemperature, setInitialTemperature, alpha, setAlpha, vehicles, selectedVehicles, setSelectedVehicles }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVehiclesExpanded, setIsVehiclesExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startIndexRef = useRef(null);

  const handleMouseDown = (index) => {
    setIsDragging(true);
    startIndexRef.current = index;
    setSelectedVehicles([vehicles[index].name]);
  };

  const handleMouseMove = (index) => {
    if (isDragging && startIndexRef.current !== null) {
      const start = Math.min(startIndexRef.current, index);
      const end = Math.max(startIndexRef.current, index);
      setSelectedVehicles(vehicles.slice(start, end + 1).map(vehicle => vehicle.name));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    startIndexRef.current = null;
  };

  const selectAllVehicles = () => {
    setSelectedVehicles(vehicles.map(vehicle => vehicle.name));
  };

  const deselectAllVehicles = () => {
    setSelectedVehicles([]);
  };

  return (
    <Card style={{ borderRadius: '16px', padding: '16px', backgroundColor: '#f9f9f9', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', border: '1px solid #ddd', width: '100%' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom style={{ color: '#222', fontWeight: 600, textAlign: 'center', marginBottom: '8px' }}>
          Rota Optimizasyon Algoritması
        </Typography>
        
        <Button 
          variant="contained" 
          fullWidth 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            marginBottom: '16px', 
            backgroundColor: '#004085', 
            color: '#fff', 
            borderRadius: '6px', 
            fontWeight: 500, 
            textTransform: 'none', 
            padding: '10px'
          }}
        >
          {isExpanded ? 'Parametreleri Gizle' : 'Parametreleri Göster'}
        </Button>

        <Collapse in={isExpanded}>
          <Divider style={{ marginBottom: '16px' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
            <FormControl style={{ flex: 1, minWidth: '200px' }} variant="outlined">
              <InputLabel id="algorithm-label">Algorithm</InputLabel>
              <Select labelId="algorithm-label" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} label="Algorithm">
                <MenuItem value="Simulated Annealing">Simulated Annealing</MenuItem>
                <MenuItem value="Tabu Search">Tabu Search</MenuItem>
                <MenuItem value="OR-Tools">OR-Tools</MenuItem>
              </Select>
            </FormControl>

            <TextField label="Iteration Number" type="number" value={iterationNumber} onChange={(e) => setIterationNumber(e.target.value)} variant="outlined" style={{ flex: 1, minWidth: '200px' }} />
            <TextField label="Initial Temperature" type="number" value={initialTemperature} onChange={(e) => setInitialTemperature(e.target.value)} variant="outlined" style={{ flex: 1, minWidth: '200px' }} />
            <TextField label="Alpha" type="number" value={alpha} onChange={(e) => setAlpha(e.target.value)} variant="outlined" style={{ flex: 1, minWidth: '200px' }} />
          </div>
        </Collapse>

        <Button 
          variant="contained" 
          fullWidth 
          onClick={() => setIsVehiclesExpanded(!isVehiclesExpanded)}
          style={{
            marginTop: '16px', 
            marginBottom: '16px', 
            backgroundColor: '#004085', 
            color: '#fff', 
            borderRadius: '6px', 
            fontWeight: 500, 
            textTransform: 'none', 
            padding: '10px'
          }}
        >
          {isVehiclesExpanded ? 'Araç Seçimini Gizle' : 'Araç Seçimini Göster'}
        </Button>

        <Collapse in={isVehiclesExpanded}>
          <Typography variant="h6" gutterBottom style={{ color: '#333', fontWeight: 500, marginTop: '16px' }}>Select Vehicles</Typography>
          <Button variant="outlined" onClick={selectAllVehicles} style={{ marginBottom: '8px', marginRight: '8px' }}>Tümünü Seç</Button>
          <Button variant="outlined" onClick={deselectAllVehicles} style={{ marginBottom: '8px' }}>Tümünü Kaldır</Button>
          <FormGroup style={{ marginBottom: '16px', paddingLeft: '8px' }} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            {vehicles.map((vehicle, index) => (
              <FormControlLabel
                key={vehicle.id}
                onMouseDown={() => handleMouseDown(index)}
                onMouseMove={() => handleMouseMove(index)}
                control={<Checkbox checked={selectedVehicles.includes(vehicle.name)} color="primary" />}
                label={`${vehicle.name} (SoC: ${vehicle.soc}%)`}
                style={{ marginBottom: '1px' }}
              />
            ))}
          </FormGroup>
        </Collapse>

        <Button 
          variant="contained" 
          fullWidth 
          style={{ 
            marginTop: '16px', 
            backgroundColor: '#004085', 
            color: '#fff', 
            borderRadius: '6px', 
            fontWeight: 500, 
            textTransform: 'none', 
            padding: '12px'
          }}
        >
          Optimizasyonu Başlat
        </Button>
      </CardContent>
    </Card>
  );
}



//drag selection eklenmesi yapıldı