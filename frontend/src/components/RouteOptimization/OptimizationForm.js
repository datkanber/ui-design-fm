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
  Card,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
// import InfoIcon from "@mui/icons-material/Info";
// import { useScenarios } from "../../contexts/ScenarioContext";

export default function OptimizationForm({ onClose }) {
  // Algoritmalara özel varsayılan parametreler - Güncellendi
  const defaultParams = {
    "SA": {
      max_iteration: 1000,
      initial_temperature: 1000,
      cooling_rate: 0.003,
    },
    "TS": {
      iterationNumber: 100,
      tabuListLength: 10,
      candidateSolutionCount: 20,
    },
    "ALNS": {
      cooling_rate: 0.9995,
      initial_temperature: 10000,
      N: 4,
      K: 15,
      Z: 1,
    },
    "OR-Tools": {},
  };

  // Algoritma uyarı mesajları
  const algorithmWarnings = {
    "SA": "Bu algoritma çözümünde gecikmeler oluşmaktadır. Zaman pencereleri dikkate alınmamaktadır.",
    "TS": "Bu algoritma çözümünde gecikmeler oluşmaktadır. Zaman pencereleri dikkate alınmamaktadır.",
    "OR": "Bu algoritma çözümünde gecikmeler oluşmaktadır. Zaman pencereleri dikkate alınmamaktadır.",
  };

  // Formdaki mevcut senaryo
  const [currentScenario, setCurrentScenario] = useState({
    id: Date.now(),
    algorithm: "OR",
    objectiveFunction: "MinDistance",
    chargeStrategy: "FullCharge",
    parameters: {},
  });

  // Kaydedilmiş senaryolar listesi
  const [scenarios, setScenarios] = useState([]);
  
  // Status indicators
  const [saveStatus, setSaveStatus] = useState({ show: false, message: "", severity: "info" });

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
    
    setSaveStatus({
      show: true,
      message: "Senaryo başarıyla eklendi",
      severity: "success"
    });
  };

  // Kaydedilen senaryoyu silme
  const handleDeleteScenario = (id) => {
    try {
      // State'den sil
      setScenarios(prev => prev.filter(s => s.id !== id));
      
      // localStorage'dan da sil
      const savedScenarios = localStorage.getItem('optimizationScenarios');
      if (savedScenarios) {
        const parsedData = JSON.parse(savedScenarios);
        
        // Tüm algoritma gruplarında ara ve sil
        Object.keys(parsedData).forEach(algorithm => {
          parsedData[algorithm] = parsedData[algorithm].filter(s => s.id !== id);
          // Eğer grup boş kaldıysa tamamen kaldır
          if (parsedData[algorithm].length === 0) {
            delete parsedData[algorithm];
          }
        });
        
        // Güncellenmiş veriyi localStorage'a kaydet
        localStorage.setItem('optimizationScenarios', JSON.stringify(parsedData));
      }
      
      setSaveStatus({
        show: true,
        message: "Senaryo başarıyla silindi",
        severity: "success"
      });
    } catch (error) {
      console.error("Senaryo silme hatası:", error);
      setSaveStatus({
        show: true,
        message: `Hata: ${error.message}`,
        severity: "error"
      });
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSaveStatus({ ...saveStatus, show: false });
  };

  // Kaydedilmiş senaryoları localStorage'dan yükle (component mount olduğunda)
  useEffect(() => {
    loadScenariosFromLocalStorage();
  }, []);

  // LocalStorage'dan senaryoları yükleme
  const loadScenariosFromLocalStorage = () => {
    try {
      const savedScenarios = localStorage.getItem('optimizationScenarios');
      if (savedScenarios) {
        // JSON.parse ile çözümle ve her algoritma grubu için array'leri düzleştir
        const parsedData = JSON.parse(savedScenarios);
        // Object.values ile her algoritma grubundaki senaryoları al ve tek bir array'e düzleştir
        const allScenarios = Object.values(parsedData).flat();
        setScenarios(allScenarios);
      }
    } catch (error) {
      console.error("Senaryoları yükleme hatası:", error);
      setSaveStatus({
        show: true,
        message: `Hata: Kaydedilmiş senaryolar yüklenemedi - ${error.message}`,
        severity: "error"
      });
    }
  };

  // Senaryoları localStorage'a kaydetme
  const saveScenarios = () => {
    try {
      // Mevcut senaryolara currentScenario'yu ekle (eğer parametre içeriyorsa)
      const allScenarios = [...scenarios];
      
      // Eğer mevcut senaryoda parametreler varsa ve eklenmemişse ekle
      if (currentScenario.algorithm && Object.keys(currentScenario.parameters).length > 0) {
        // Kontrol et - aynı senaryo daha önce eklendi mi?
        const scenarioExists = scenarios.some(s => 
          s.algorithm === currentScenario.algorithm && 
          s.objectiveFunction === currentScenario.objectiveFunction &&
          s.chargeStrategy === currentScenario.chargeStrategy
        );
        
        if (!scenarioExists) {
          allScenarios.push({ ...currentScenario, id: Date.now() });
        }
      }
      
      // Eğer senaryo yoksa hata göster
      if (allScenarios.length === 0) {
        setSaveStatus({
          show: true,
          message: "Kaydedilecek senaryo bulunamadı!",
          severity: "warning"
        });
        return;
      }
      
      // Her senaryo için gereksiz bilgileri temizle (daha temiz bir JSON için)
      const cleanScenarios = allScenarios.map(scenario => ({
        id: scenario.id,
        algorithm: scenario.algorithm,
        objectiveFunction: scenario.objectiveFunction,
        chargeStrategy: scenario.chargeStrategy,
        parameters: scenario.parameters,
        createdAt: scenario.createdAt || new Date().toISOString() // Eğer zaten var ise aynısını koru
      }));
      
      // Algoritmalara göre grupla
      const scenariosByAlgorithm = {};
      cleanScenarios.forEach(scenario => {
        if (!scenariosByAlgorithm[scenario.algorithm]) {
          scenariosByAlgorithm[scenario.algorithm] = [];
        }
        scenariosByAlgorithm[scenario.algorithm].push(scenario);
      });
      
      // LocalStorage'a kaydet
      localStorage.setItem('optimizationScenarios', JSON.stringify(scenariosByAlgorithm));
      
      // scenarios state'ini de güncelle
      setScenarios(cleanScenarios);
      
      setSaveStatus({
        show: true,
        message: "Senaryolar başarıyla kaydedildi!",
        severity: "success"
      });
      
      // 1 saniye sonra modal'ı kapat
      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
      
    } catch (error) {
      console.error("Senaryo kaydetme hatası:", error);
      setSaveStatus({
        show: true,
        message: `Hata: ${error.message}`,
        severity: "error"
      });
    }
    console.log("Senaryolar:", scenarios);
  };

  // const getAllScenarios = () => {
  //   try {
  //     const savedScenarios = JSON.parse(localStorage.getItem('optimizationScenarios'));
  //     if (savedScenarios) {
  //       setScenarios(Object.values(savedScenarios).flat());
  //     }
  //   } catch (error) {
  //     console.error("Senaryolar çekme hatası:", error);
  //     setSaveStatus({
  //       show: true,
  //       message: `Hata: ${error.message}`,
  //       severity: "error"
  //     });
  //   }
  // };

  return (
    <Card sx={{ p: 3, maxHeight: '80vh', overflowY: 'auto' }}>
      <Typography variant="h4" gutterBottom style={{ textAlign: "center", color: "#1976d2" }}>
        Optimizasyon Senaryosu Oluşturma
      </Typography>
      <Box sx={{ mt: 3 }}>
        {/* Algoritma Seçimi */}
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
          Seçilen Rota Algoritması
        </Typography>
        <RadioGroup row value={currentScenario.algorithm} onChange={handleAlgorithmChange}>
          <FormControlLabel value="OR" control={<Radio color="primary" />} label="OR-Tools" />
          <FormControlLabel value="SA" control={<Radio color="primary" />} label="Simulated Annealing" />
          <FormControlLabel value="TS" control={<Radio color="primary" />} label="Tabu Search" />
          <FormControlLabel value="ALNS" control={<Radio color="primary" />} label="Adaptive Large Neighborhood Search" />
        </RadioGroup>
        
        {/* Algoritma uyarı mesajı */}
        {currentScenario.algorithm !== "ALNS" && algorithmWarnings[currentScenario.algorithm] && (
          <Box 
            sx={{ 
              mt: 2, 
              p: 1.5, 
              bgcolor: '#fff3e0', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: '#ffb74d',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1
            }}
          >
             
            <WarningAmberIcon color="warning" sx={{ mt: 0.2 }} />
            <Typography variant="body2" color="text.secondary">
              <strong>{currentScenario.algorithm === "SA" ? "Simulated Annealing" : 
                       currentScenario.algorithm === "TS" ? "Tabu Search" : 
                       "OR-Tools"} Algoritması Uyarısı:</strong> {algorithmWarnings[currentScenario.algorithm]}
            </Typography>
          </Box>
        )}

        {/* Amaç Fonksiyonu */}
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1, mt: 3 }}>
          {currentScenario.algorithm} Algoritması için Amaç Fonksiyonu
        </Typography>
        <RadioGroup row value={currentScenario.objectiveFunction} onChange={handleObjectiveFunctionChange}>
          <FormControlLabel value="MinDistance" control={<Radio color="primary" />} label="Minimum Distance" />
          <FormControlLabel value="MinTime" control={<Radio color="primary" />} label="Minimum Time" />
          <FormControlLabel value="MinEnergy" control={<Radio color="primary" />} label="Minimum Energy" />
          <FormControlLabel value="MinTardiness" control={<Radio color="primary" />} label="Minimum Tardiness" />
        </RadioGroup>

        {/* Şarj Stratejisi */}
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1, mt: 3 }}>
          {currentScenario.algorithm} Algoritması için Şarj Stratejisi
        </Typography>
        <RadioGroup row value={currentScenario.chargeStrategy} onChange={handleChargeStrategyChange}>
          <FormControlLabel value="FullCharge" control={<Radio color="primary" />} label="Full Charge" />
          <FormControlLabel value="PartialCharge" control={<Radio color="primary" />} label="Partial Charge" />
          <FormControlLabel value="%20-%80" control={<Radio color="primary" />} label="%20-%80 Charge" />
        </RadioGroup>

        <Divider sx={{ my: 3 }} />

        {/* Algoritmaya Göre Parametre Alanları */}
        {currentScenario.algorithm === "SA" && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Simulated Annealing Parametreleri
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Max Iteration"
                type="number"
                fullWidth
                value={currentScenario.parameters.max_iteration || ""}
                onChange={(e) =>
                  handleParameterChange("max_iteration", parseInt(e.target.value))
                }
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Initial Temperature"
                type="number"
                fullWidth
                value={currentScenario.parameters.initial_temperature || ""}
                onChange={(e) =>
                  handleParameterChange("initial_temperature", parseInt(e.target.value))
                }
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Cooling Rate"
                type="number"
                fullWidth
                value={currentScenario.parameters.cooling_rate || ""}
                onChange={(e) =>
                  handleParameterChange("cooling_rate", parseFloat(e.target.value))
                }
                variant="outlined"
              />
            </Grid>
          </Grid>
        )}

        {currentScenario.algorithm === "TS" && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Tabu Search Parametreleri
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Iteration Number"
                type="number"
                fullWidth
                value={currentScenario.parameters.iterationNumber || ""}
                onChange={(e) =>
                  handleParameterChange("iterationNumber", parseInt(e.target.value))
                }
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Tabu List Length"
                type="number"
                fullWidth
                value={currentScenario.parameters.tabuListLength || ""}
                onChange={(e) =>
                  handleParameterChange("tabuListLength", parseInt(e.target.value))
                }
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Candidate Solution Count"
                type="number"
                fullWidth
                value={currentScenario.parameters.candidateSolutionCount || ""}
                onChange={(e) =>
                  handleParameterChange("candidateSolutionCount", parseInt(e.target.value))
                }
                variant="outlined"
              />
            </Grid>
          </Grid>
        )}

        {currentScenario.algorithm === "ALNS" && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                ALNS Parametreleri
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Initial Temperature"
                type="number"
                fullWidth
                value={currentScenario.parameters.initial_temperature || ""}
                onChange={(e) =>
                  handleParameterChange("initial_temperature", parseInt(e.target.value))
                }
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Cooling Rate"
                type="number"
                fullWidth
                value={currentScenario.parameters.cooling_rate || ""}
                onChange={(e) =>
                  handleParameterChange("cooling_rate", parseFloat(e.target.value))
                }
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Parameter N"
                type="number"
                fullWidth
                value={currentScenario.parameters.N || ""}
                onChange={(e) =>
                  handleParameterChange("N", parseInt(e.target.value))
                }
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Parameter K"
                type="number"
                fullWidth
                value={currentScenario.parameters.K || ""}
                onChange={(e) =>
                  handleParameterChange("K", parseInt(e.target.value))
                }
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Parameter Z"
                type="number"
                fullWidth
                value={currentScenario.parameters.Z || ""}
                onChange={(e) =>
                  handleParameterChange("Z", parseInt(e.target.value))
                }
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        )}

        {/* Butonlar - Ortada */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SaveIcon />}
            onClick={handleSaveScenario}
          >
            Senaryo Ekle
          </Button>
          
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<ExitToAppIcon />}
            onClick={saveScenarios}
          >
            Kaydet ve Çık
          </Button>
        </Box>
      </Box>

      {/* Kaydedilen Senaryolar Tablosu */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', color: '#333' }}>
          Kaydedilen Senaryolar
        </Typography>
        {scenarios.length === 0 ? (
          <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
            <Typography variant="body1" align="center" color="textSecondary">
              Henüz senaryo kaydedilmedi.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2, maxHeight: '300px', overflowY: 'auto' }}>
            <Table stickyHeader>
              <TableHead sx={{ bgcolor: '#f1f8ff' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Algoritma</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amaç Fonksiyonu</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Şarj Stratejisi</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Parametreler</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 60 }}>İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scenarios.map((scenario) => (
                  <TableRow key={scenario.id} hover>
                    <TableCell>{scenario.algorithm}</TableCell>
                    <TableCell>{scenario.objectiveFunction}</TableCell>
                    <TableCell>{scenario.chargeStrategy}</TableCell>
                    <TableCell>
                      {Object.entries(scenario.parameters || {}).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key}:</strong> {value}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteScenario(scenario.id)}
                        title="Senaryoyu sil"
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      
      {/* Status Snackbar */}
      <Snackbar
        open={saveStatus.show}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={saveStatus.severity} sx={{ width: '100%' }}>
          {saveStatus.message}
        </Alert>
      </Snackbar>
    </Card>
  );
}