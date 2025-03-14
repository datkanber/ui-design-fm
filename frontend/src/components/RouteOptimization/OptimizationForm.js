import React, { useState, useEffect } from "react";
import {
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Divider,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";

// Hide the default close button
const hideCloseIconStyle = `
  .MuiDialog-root .MuiDialogTitle-root .MuiIconButton-root,
  [data-testid="CloseIcon"] {
    display: none !important;
  }
`;

export default function OptimizationForm({ onClose }) {
  // Add useEffect to inject the style when component mounts
  useEffect(() => {
    // Create style element
    const style = document.createElement('style');
    style.innerHTML = hideCloseIconStyle;
    document.head.appendChild(style);
    
    // Clean up when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Algoritmalara özel varsayılan parametreler
  const defaultParams = {
    "Simulated Annealing": {
      iterationNumber: 100,
      initialTemperature: 1000,
      coolingRate: 0.95,
    },
    "Tabu Search": {
      iterationNumber: 100,
      tabuListLength: 10,
      candidateSolutionCount: 20,
    },
    "Adaptive Large Neighborhood Search": {
      iterationNumber: 100,
      stationInsertionFrequency: 0.3,
      routeRemovalFrequency: 0.3,
      weightUpdateFrequency: 0.1,
      initialTemperature: 1000,
      coolingRate: 0.95,
    },
    "OR-Tools": {},
  };

  // Formdaki mevcut senaryo
  const [currentScenario, setCurrentScenario] = useState({
    id: Date.now(),
    algorithm: "OR-Tools",
    objectiveFunction: "Distance",
    chargeStrategy: "Full",
    parameters: {},
  });

  // Kaydedilmiş senaryolar listesi
  const [scenarios, setScenarios] = useState([]);

  // Event handlerlar
  const handleAlgorithmChange = (e) => {
    const newAlgorithm = e.target.value;
    setCurrentScenario((prev) => ({
      ...prev,
      algorithm: newAlgorithm,
      // Algoritma değişince varsayılan parametre seti yükleniyor
      parameters: defaultParams[newAlgorithm] || {},
    }));
  };

  const handleObjectiveFunctionChange = (e) => {
    setCurrentScenario((prev) => ({
      ...prev,
      objectiveFunction: e.target.value,
    }));
  };

  const handleChargeStrategyChange = (e) => {
    setCurrentScenario((prev) => ({
      ...prev,
      chargeStrategy: e.target.value,
    }));
  };

  const handleParameterChange = (key, value) => {
    setCurrentScenario((prev) => ({
      ...prev,
      parameters: { ...prev.parameters, [key]: value },
    }));
  };

  // Senaryoyu kaydet ve formu resetle
  const handleSaveScenario = () => {
    setScenarios((prev) => [...prev, { ...currentScenario, id: Date.now() }]);
    setCurrentScenario({
      id: Date.now(),
      algorithm: "OR-Tools",
      objectiveFunction: "Distance",
      chargeStrategy: "Full",
      parameters: {},
    });
  };

  // Kaydedilen senaryoyu silme
  const handleDeleteScenario = (id) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  // Enhanced handleFormClose function to ensure it closes the dialog
  const handleFormClose = () => {
    try {
      // Method 1: Try using the provided onClose prop
      if (typeof onClose === 'function') {
        onClose();
        return;
      }

      // Method 2: Try to find the closest dialog container and close it
      const closeDialog = () => {
        // Find the dialog or modal containing this form
        const dialogElement = document.querySelector('.MuiDialog-root');
        const modalElement = document.querySelector('.MuiModal-root');
        
        if (dialogElement) {
          // For Dialog components
          const backdropElement = dialogElement.querySelector('.MuiBackdrop-root');
          if (backdropElement) {
            backdropElement.click(); // Click the backdrop to close the dialog
            return true;
          }
          
          // Try to find and click the close button
          const closeButton = dialogElement.querySelector('[aria-label="close"]');
          if (closeButton) {
            closeButton.click();
            return true;
          }
          
          // Simulate Escape key to close dialog
          dialogElement.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Escape',
            code: 'Escape',
            which: 27,
            keyCode: 27,
            bubbles: true
          }));
          return true;
        }
        
        if (modalElement) {
          // For Modal components
          const backdropElement = modalElement.querySelector('.MuiBackdrop-root');
          if (backdropElement) {
            backdropElement.click();
            return true;
          }
        }
        
        return false;
      };

      // Execute the close function
      const closed = closeDialog();
      
      // Method 3: Last resort - dispatch a custom event that parent components can listen for
      if (!closed) {
        window.dispatchEvent(new CustomEvent('requestCloseOptimizationForm', {
          detail: { timestamp: Date.now() }
        }));
        
        console.log("Dispatched custom event to request form closure");
      }
    } catch (error) {
      console.error("Error attempting to close form:", error);
    }
  };

  return (
    <div style={{padding: "16px", position: "relative" }}>
      <Typography variant="h4" gutterBottom style={{ textAlign: "center" }}>
        Optimizasyon Senaryosu Oluşturma
      </Typography>
      <div style={{ marginBottom: "24px" }}>
        {/* Algoritma Seçimi */}
        <Typography variant="subtitle1" style={{ fontWeight: "bold", marginTop: "10px" }}>
          Seçilen Rota Algoritması
        </Typography>
        <RadioGroup row value={currentScenario.algorithm} onChange={handleAlgorithmChange}>
          <FormControlLabel value="OR-Tools" control={<Radio />} label="OR-Tools" />
          <FormControlLabel value="Simulated Annealing" control={<Radio />} label="Simulated Annealing" />
          <FormControlLabel value="Tabu Search" control={<Radio />} label="Tabu Search" />
          <FormControlLabel value="Adaptive Large Neighborhood Search" control={<Radio />} label="ALNS" />
        </RadioGroup>

        {/* Amaç Fonksiyonu */}
        <Typography variant="subtitle1" style={{ fontWeight: "bold", marginTop: "15px" }}>
          {currentScenario.algorithm} Algoritması için Amaç Fonksiyonu
        </Typography>
        <RadioGroup row value={currentScenario.objectiveFunction} onChange={handleObjectiveFunctionChange}>
          <FormControlLabel value="Distance" control={<Radio />} label="Minimum Distance" />
          <FormControlLabel value="Time" control={<Radio />} label="Minimum Time" />
          <FormControlLabel value="Energy" control={<Radio />} label="Minimum Energy" />
          <FormControlLabel value="Tardiness" control={<Radio />} label="Minimum Tardiness" />
        </RadioGroup>

        {/* Şarj Stratejisi */}
        <Typography variant="subtitle1" style={{ fontWeight: "bold", marginTop: "15px" }}>
          {currentScenario.algorithm} Algoritması için Şarj Stratejisi
        </Typography>
        <RadioGroup row value={currentScenario.chargeStrategy} onChange={handleChargeStrategyChange}>
          <FormControlLabel value="Full" control={<Radio />} label="Full Charge" />
          <FormControlLabel value="Partial" control={<Radio />} label="Partial Charge" />
          <FormControlLabel value="%20-%80" control={<Radio />} label="%20-%80 Charge" />
        </RadioGroup>

        <Divider style={{ margin: "16px 0" }} />

        {/* Algoritmaya Göre Parametre Alanları */}
        {currentScenario.algorithm === "Simulated Annealing" && (
          <>
            <Typography variant="h6" style={{ fontWeight: "bold" }}>
              Simulated Annealing Parametreleri
            </Typography>
            <TextField
              label="Iteration Number"
              type="number"
              fullWidth
              value={currentScenario.parameters.iterationNumber || ""}
              onChange={(e) =>
                handleParameterChange("iterationNumber", parseInt(e.target.value))
              }
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Initial Temperature"
              type="number"
              fullWidth
              value={currentScenario.parameters.initialTemperature || ""}
              onChange={(e) =>
                handleParameterChange("initialTemperature", parseInt(e.target.value))
              }
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Cooling Rate"
              type="number"
              fullWidth
              value={currentScenario.parameters.coolingRate || ""}
              onChange={(e) =>
                handleParameterChange("coolingRate", parseFloat(e.target.value))
              }
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
          </>
        )}

        {currentScenario.algorithm === "Tabu Search" && (
          <>
            <Typography variant="h6" style={{ fontWeight: "bold" }}>
              Tabu Search Parametreleri
            </Typography>
            <TextField
              label="Iteration Number"
              type="number"
              fullWidth
              value={currentScenario.parameters.iterationNumber || ""}
              onChange={(e) =>
                handleParameterChange("iterationNumber", parseInt(e.target.value))
              }
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Tabu List Length"
              type="number"
              fullWidth
              value={currentScenario.parameters.tabuListLength || ""}
              onChange={(e) =>
                handleParameterChange("tabuListLength", parseInt(e.target.value))
              }
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Candidate Solution Count"
              type="number"
              fullWidth
              value={currentScenario.parameters.candidateSolutionCount || ""}
              onChange={(e) =>
                handleParameterChange("candidateSolutionCount", parseInt(e.target.value))
              }
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
          </>
        )}

        {currentScenario.algorithm === "Adaptive Large Neighborhood Search" && (
          <>
            <Typography variant="h6" style={{ fontWeight: "bold" }}>
              ALNS Parametreleri
            </Typography>
            <TextField
              label="Iteration Number"
              type="number"
              fullWidth
              value={currentScenario.parameters.iterationNumber || ""}
              onChange={(e) =>
                handleParameterChange("iterationNumber", parseInt(e.target.value))
              }
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Station Insertion Frequency"
              type="number"
              fullWidth
              value={currentScenario.parameters.stationInsertionFrequency || ""}
              onChange={(e) =>
                handleParameterChange("stationInsertionFrequency", parseFloat(e.target.value))
              }
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Route Removal Frequency"
              type="number"
              fullWidth
              value={currentScenario.parameters.routeRemovalFrequency || ""}
              onChange={(e) =>
                handleParameterChange("routeRemovalFrequency", parseFloat(e.target.value))
              }
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Weight Update Frequency"
              type="number"
              fullWidth
              value={currentScenario.parameters.weightUpdateFrequency || ""}
              onChange={(e) =>
                handleParameterChange("weightUpdateFrequency", parseFloat(e.target.value))
              }
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Initial Temperature"
              type="number"
              fullWidth
              value={currentScenario.parameters.initialTemperature || ""}
              onChange={(e) =>
                handleParameterChange("initialTemperature", parseInt(e.target.value))
              }
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Cooling Rate"
              type="number"
              fullWidth
              value={currentScenario.parameters.coolingRate || ""}
              onChange={(e) =>
                handleParameterChange("coolingRate", parseFloat(e.target.value))
              }
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
          </>
        )}

        <Button variant="contained" color="primary" style={{ marginTop: "16px" }} onClick={handleSaveScenario}>
          Senaryoyu Kaydet
        </Button>
      </div>

      {/* Kaydedilen Senaryolar Tablosu */}
      <Typography variant="h5" gutterBottom>
        Kaydedilen Senaryolar
      </Typography>
        
      {scenarios.length === 0 ? (
        <Typography variant="body1">Henüz senaryo kaydedilmedi.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Algoritma</TableCell>
                <TableCell>Amaç Fonksiyonu</TableCell>
                <TableCell>Şarj Stratejisi</TableCell>
                <TableCell>Parametreler</TableCell>
                <TableCell>İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scenarios.map((scenario) => (
                <TableRow key={scenario.id}>
                  <TableCell>{scenario.algorithm}</TableCell>
                  <TableCell>{scenario.objectiveFunction}</TableCell>
                  <TableCell>{scenario.chargeStrategy}</TableCell>
                  <TableCell>
                    {Object.entries(scenario.parameters).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {value}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDeleteScenario(scenario.id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Add a check icon button at the bottom */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        mt: 3,
        mb: 2
      }}>
        <IconButton
          onClick={handleFormClose}
          style={{
            backgroundColor: "#4CAF50", 
            color: "white",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          <CheckIcon fontSize="medium" />
        </IconButton>
      </Box>
    </div>
  );
}