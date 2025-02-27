import React, { useState, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Box,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";

export default function OptimizationForm({
  onDemandChange,
  vehicles,
  selectedVehicles,
  setSelectedVehicles,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVehiclesExpanded, setIsVehiclesExpanded] = useState(false);
  const [isDemandExpanded, setIsDemandExpanded] = useState(false);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState([
    "Simulated Annealing",
  ]);
  const [objectiveFunction, setObjectiveFunction] =
    useState("Minimum Distance");
  const [chargingStrategy, setChargingStrategy] = useState("Full Charge");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState("");
  const [algorithmParams, setAlgorithmParams] = useState({
    "Simulated Annealing": {
      iterationNumber: 100,
      initialTemperature: 1000,
      coolingRate: 0.95,
    },
    "Tabu Search": {
      tabuListLength: 10,
      iterationNumber: 100,
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
    "OR-Tools": {
      timeLimit: 30,
      solutionCount: 1,
      optimizationGoal: "MINIMIZE_DISTANCE",
    },
  });
  const [isAlgorithmSettingsOpen, setIsAlgorithmSettingsOpen] = useState(false);
  const [currentAlgorithm, setCurrentAlgorithm] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState("add");
  const [taskFormData, setTaskFormData] = useState({
    id: "",
    customerName: "",
    location: "",
    demand: 0,
    timeWindow: {
      start: "",
      end: "",
    },
  });
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
      setSelectedVehicles(
        vehicles.slice(start, end + 1).map((vehicle) => vehicle.name)
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    startIndexRef.current = null;
  };

  const selectAllVehicles = () => {
    setSelectedVehicles(vehicles.map((vehicle) => vehicle.name));
  };

  const deselectAllVehicles = () => {
    setSelectedVehicles([]);
  };

  const handleDemandChange = (event) => {
    const newValue = event.target.value;
    setSelectedDemand(newValue);
    if (onDemandChange) {
      onDemandChange(newValue);
    }
  };

  const handleTaskModalOpen = (mode, taskData = null) => {
    setTaskModalMode(mode);
    if (taskData) {
      setTaskFormData(taskData);
    } else {
      setTaskFormData({
        id: "",
        customerName: "",
        location: "",
        demand: 0,
        timeWindow: {
          start: "",
          end: "",
        },
      });
    }
    setIsTaskModalOpen(true);
  };

  const handleTaskModalClose = () => {
    setIsTaskModalOpen(false);
  };

  const handleTaskFormSubmit = () => {
    console.log("Task Form Data:", taskFormData);
    handleTaskModalClose();
  };

  const handleAlgorithmSettingsOpen = (algorithm) => {
    setCurrentAlgorithm(algorithm);
    setIsAlgorithmSettingsOpen(true);
  };

  const handleAlgorithmParamChange = (algorithm, param, value) => {
    setAlgorithmParams((prev) => ({
      ...prev,
      [algorithm]: {
        ...prev[algorithm],
        [param]: value,
      },
    }));
  };

  const AlgorithmSettingsModal = useCallback(
    () => (
      <Dialog
        open={isAlgorithmSettingsOpen}
        onClose={() => setIsAlgorithmSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{currentAlgorithm} Parametreleri</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {currentAlgorithm === "Simulated Annealing" && (
              <>
                <TextField
                  fullWidth
                  type="number"
                  label="İterasyon Sayısı"
                  value={algorithmParams[currentAlgorithm].iterationNumber}
                  onChange={(e) =>
                    handleAlgorithmParamChange(
                      currentAlgorithm,
                      "iterationNumber",
                      e.target.value
                    )
                  }
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Başlangıç Sıcaklığı"
                  value={algorithmParams[currentAlgorithm].initialTemperature}
                  onChange={(e) =>
                    handleAlgorithmParamChange(
                      currentAlgorithm,
                      "initialTemperature",
                      e.target.value
                    )
                  }
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Soğuma Oranı"
                  value={algorithmParams[currentAlgorithm].coolingRate}
                  onChange={(e) =>
                    handleAlgorithmParamChange(
                      currentAlgorithm,
                      "coolingRate",
                      e.target.value
                    )
                  }
                />
              </>
            )}
            {currentAlgorithm === "Tabu Search" && (
              <>
                <TextField
                  fullWidth
                  type="number"
                  label="Tabu Listesi Uzunluğu"
                  value={algorithmParams[currentAlgorithm].tabuListLength}
                  onChange={(e) =>
                    handleAlgorithmParamChange(
                      currentAlgorithm,
                      "tabuListLength",
                      e.target.value
                    )
                  }
                />
                <TextField
                  fullWidth
                  type="number"
                  label="İterasyon Sayısı"
                  value={algorithmParams[currentAlgorithm].iterationNumber}
                  onChange={(e) =>
                    handleAlgorithmParamChange(
                      currentAlgorithm,
                      "iterationNumber",
                      e.target.value
                    )
                  }
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Aday Çözüm Sayısı"
                  value={
                    algorithmParams[currentAlgorithm].candidateSolutionCount
                  }
                  onChange={(e) =>
                    handleAlgorithmParamChange(
                      currentAlgorithm,
                      "candidateSolutionCount",
                      e.target.value
                    )
                  }
                />
              </>
            )}
            {currentAlgorithm === "Adaptive Large Neighborhood Search" && (
              <>
                <TextField
                  fullWidth
                  type="number"
                  label="İterasyon Sayısı"
                  value={algorithmParams[currentAlgorithm].iterationNumber}
                  onChange={(e) =>
                    handleAlgorithmParamChange(
                      currentAlgorithm,
                      "iterationNumber",
                      e.target.value
                    )
                  }
                />
                <TextField
                  fullWidth
                  type="number"
                  label="İstasyon Ekleme Sıklığı"
                  value={
                    algorithmParams[currentAlgorithm].stationInsertionFrequency
                  }
                  onChange={(e) =>
                    handleAlgorithmParamChange(
                      currentAlgorithm,
                      "stationInsertionFrequency",
                      e.target.value
                    )
                  }
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Rota Kaldırma Sıklığı"
                  value={
                    algorithmParams[currentAlgorithm].routeRemovalFrequency
                  }
                  onChange={(e) =>
                    handleAlgorithmParamChange(
                      currentAlgorithm,
                      "routeRemovalFrequency",
                      e.target.value
                    )
                  }
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Ağırlık Güncelleme Sıklığı"
                  value={
                    algorithmParams[currentAlgorithm].weightUpdateFrequency
                  }
                  onChange={(e) =>
                    handleAlgorithmParamChange(
                      currentAlgorithm,
                      "weightUpdateFrequency",
                      e.target.value
                    )
                  }
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Başlangıç Sıcaklığı"
                  value={algorithmParams[currentAlgorithm].initialTemperature}
                  onChange={(e) =>
                    handleAlgorithmParamChange(
                      currentAlgorithm,
                      "initialTemperature",
                      e.target.value
                    )
                  }
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Soğuma Oranı"
                  value={algorithmParams[currentAlgorithm].coolingRate}
                  onChange={(e) =>
                    handleAlgorithmParamChange(
                      currentAlgorithm,
                      "coolingRate",
                      e.target.value
                    )
                  }
                />
              </>
            )}
            {currentAlgorithm === "OR-Tools" && (
              <>
                <TextField
                  fullWidth
                  type="number"
                  label="Zaman Sınırı (saniye)"
                  value={algorithmParams[currentAlgorithm].timeLimit}
                  onChange={(e) =>
                    handleAlgorithmParamChange(
                      currentAlgorithm,
                      "timeLimit",
                      e.target.value
                    )
                  }
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Çözüm Sayısı"
                  value={algorithmParams[currentAlgorithm].solutionCount}
                  onChange={(e) =>
                    handleAlgorithmParamChange(
                      currentAlgorithm,
                      "solutionCount",
                      e.target.value
                    )
                  }
                />
                <FormControl fullWidth>
                  <InputLabel>Optimizasyon Hedefi</InputLabel>
                  <Select
                    value={algorithmParams[currentAlgorithm].optimizationGoal}
                    onChange={(e) =>
                      handleAlgorithmParamChange(
                        currentAlgorithm,
                        "optimizationGoal",
                        e.target.value
                      )
                    }
                    label="Optimizasyon Hedefi"
                  >
                    <MenuItem value="MINIMIZE_DISTANCE">
                      Mesafe Minimizasyonu
                    </MenuItem>
                    <MenuItem value="MINIMIZE_TIME">
                      Zaman Minimizasyonu
                    </MenuItem>
                    <MenuItem value="MINIMIZE_ENERGY">
                      Enerji Minimizasyonu
                    </MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAlgorithmSettingsOpen(false)}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    ),
    [isAlgorithmSettingsOpen, currentAlgorithm, algorithmParams]
  );

  const TaskModal = () => (
    <Dialog
      open={isTaskModalOpen}
      onClose={handleTaskModalClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {taskModalMode === "add"
          ? "Yeni Görev Ekle"
          : taskModalMode === "edit"
          ? "Görevi Düzenle"
          : "Görevi Sil"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Müşteri Adı"
            value={taskFormData.customerName}
            onChange={(e) =>
              setTaskFormData({ ...taskFormData, customerName: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Konum"
            value={taskFormData.location}
            onChange={(e) =>
              setTaskFormData({ ...taskFormData, location: e.target.value })
            }
          />
          <TextField
            fullWidth
            type="number"
            label="Talep Miktarı"
            value={taskFormData.demand}
            onChange={(e) =>
              setTaskFormData({ ...taskFormData, demand: e.target.value })
            }
          />
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              type="time"
              label="Başlangıç Zamanı"
              value={taskFormData.timeWindow.start}
              onChange={(e) =>
                setTaskFormData({
                  ...taskFormData,
                  timeWindow: {
                    ...taskFormData.timeWindow,
                    start: e.target.value,
                  },
                })
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="time"
              label="Bitiş Zamanı"
              value={taskFormData.timeWindow.end}
              onChange={(e) =>
                setTaskFormData({
                  ...taskFormData,
                  timeWindow: {
                    ...taskFormData.timeWindow,
                    end: e.target.value,
                  },
                })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleTaskModalClose} color="primary">
          İptal
        </Button>
        <Button
          onClick={handleTaskFormSubmit}
          color="primary"
          variant="contained"
          disabled={taskModalMode === "delete"}
        >
          {taskModalMode === "add"
            ? "Ekle"
            : taskModalMode === "edit"
            ? "Güncelle"
            : "Sil"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Card
      style={{
        borderRadius: "16px",
        padding: "16px",
        backgroundColor: "#f9f9f9",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        border: "1px solid #ddd",
        width: "100%",
      }}
    >
      <CardContent>
        <Typography
          variant="h5"
          gutterBottom
          style={{
            color: "#222",
            fontWeight: 600,
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          Rota Optimizasyon Algoritması
        </Typography>

        <Button
          variant="contained"
          fullWidth
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            marginBottom: "16px",
            backgroundColor: "#004085",
            color: "#fff",
            borderRadius: "6px",
            fontWeight: 500,
            textTransform: "none",
            padding: "10px",
          }}
        >
          {isExpanded ? "Parametreleri Gizle" : "Parametreleri Göster"}
        </Button>

        <Collapse in={isExpanded}>
          <Stack spacing={2} sx={{ mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Algoritmalar</InputLabel>
              <Select
                multiple
                value={selectedAlgorithms}
                onChange={(e) => setSelectedAlgorithms(e.target.value)}
                label="Algoritmalar"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value, index) => (
                      <Tooltip key={value} title="Algoritma Ayarları">
                        {" "}
                        {/* ✅ key eklendi */}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAlgorithmSettingsOpen(value);
                          }}
                        >
                          <SettingsIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="Simulated Annealing">
                  Simulated Annealing
                </MenuItem>
                <MenuItem value="Tabu Search">Tabu Search</MenuItem>
                <MenuItem value="Adaptive Large Neighborhood Search">
                  Adaptive Large Neighborhood Search
                </MenuItem>
                <MenuItem value="OR-Tools">OR-Tools</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Amaç Fonksiyonu</InputLabel>
              <Select
                value={objectiveFunction}
                onChange={(e) => setObjectiveFunction(e.target.value)}
                label="Amaç Fonksiyonu"
              >
                <MenuItem value="Minimum Distance">Minimum Mesafe</MenuItem>
                <MenuItem value="Minimum Time">Minimum Zaman</MenuItem>
                <MenuItem value="Minimum Energy">Minimum Enerji</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Şarj Stratejisi</InputLabel>
              <Select
                value={chargingStrategy}
                onChange={(e) => setChargingStrategy(e.target.value)}
                label="Şarj Stratejisi"
              >
                <MenuItem value="Full Charge">Tam Şarj</MenuItem>
                <MenuItem value="Partial Charge">Kısmi Şarj</MenuItem>
                <MenuItem value="%20-%80 Charge">%20-%80 Şarj</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Collapse>

        <Button
          variant="contained"
          fullWidth
          onClick={() => setIsVehiclesExpanded(!isVehiclesExpanded)}
          style={{
            marginTop: "16px",
            marginBottom: "16px",
            backgroundColor: "#004085",
            color: "#fff",
            borderRadius: "6px",
            fontWeight: 500,
            textTransform: "none",
            padding: "10px",
          }}
        >
          {isVehiclesExpanded ? "Araç Seçimini Gizle" : "Araç Seçimini Göster"}
        </Button>

        <Collapse in={isVehiclesExpanded}>
          <Typography
            variant="h6"
            gutterBottom
            style={{ color: "#333", fontWeight: 500, marginTop: "16px" }}
          >
            Select Vehicles
          </Typography>
          <Button
            variant="outlined"
            onClick={selectAllVehicles}
            style={{ marginBottom: "8px", marginRight: "8px" }}
          >
            Tümünü Seç
          </Button>
          <Button
            variant="outlined"
            onClick={deselectAllVehicles}
            style={{ marginBottom: "8px" }}
          >
            Tümünü Kaldır
          </Button>
          <FormGroup
            style={{ marginBottom: "16px", paddingLeft: "8px" }}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {vehicles.map((vehicle, index) => (
              <FormControlLabel
                key={vehicle.id}
                onMouseDown={() => handleMouseDown(index)}
                onMouseMove={() => handleMouseMove(index)}
                control={
                  <Checkbox
                    checked={selectedVehicles.includes(vehicle.name)}
                    color="primary"
                  />
                }
                label={`${vehicle.name} (SoC: ${vehicle.soc}%)`}
                style={{ marginBottom: "1px" }}
              />
            ))}
          </FormGroup>
        </Collapse>

        <Button
          variant="contained"
          fullWidth
          onClick={() => setIsDemandExpanded(!isDemandExpanded)}
          style={{
            marginTop: "16px",
            marginBottom: "16px",
            backgroundColor: "#004085",
            color: "#fff",
            borderRadius: "6px",
            fontWeight: 500,
            textTransform: "none",
            padding: "10px",
          }}
        >
          {isDemandExpanded
            ? "Talep Yönetimini Gizle"
            : "Talep Yönetimini Göster"}
        </Button>

        <Collapse in={isDemandExpanded}>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#fff",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <Typography
                variant="h6"
                style={{ color: "#333", fontWeight: 500 }}
              >
                Talep Yönetimi
              </Typography>
              <div>
                <IconButton
                  color="primary"
                  onClick={() => handleTaskModalOpen("add")}
                  title="Yeni Görev Ekle"
                >
                  <AddIcon />
                </IconButton>
                <IconButton
                  color="primary"
                  onClick={() => handleTaskModalOpen("edit")}
                  title="Görevi Düzenle"
                  disabled={!selectedDemand}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleTaskModalOpen("delete")}
                  title="Görevi Sil"
                  disabled={!selectedDemand}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            </div>
            <FormControl fullWidth>
              <InputLabel>Talep Seçin</InputLabel>
              <Select
                value={selectedDemand}
                onChange={handleDemandChange}
                label="Talep Seçin"
              >
                <MenuItem value="C05">C05</MenuItem>
                <MenuItem value="C10">C10</MenuItem>
                <MenuItem value="C20">C20</MenuItem>
                <MenuItem value="C40">C40</MenuItem>
                <MenuItem value="C60">C60</MenuItem>
                <MenuItem value="R05">R05</MenuItem>
                <MenuItem value="R10">R10</MenuItem>
                <MenuItem value="R20">R20</MenuItem>
                <MenuItem value="R40">R40</MenuItem>
                <MenuItem value="R60">R60</MenuItem>
                <MenuItem value="RC05">RC05</MenuItem>
                <MenuItem value="RC10">RC10</MenuItem>
                <MenuItem value="RC20">RC20</MenuItem>
                <MenuItem value="RC40">RC40</MenuItem>
                <MenuItem value="RC60">RC60</MenuItem>
              </Select>
            </FormControl>
          </div>
        </Collapse>

        <Button
          variant="contained"
          fullWidth
          style={{
            marginTop: "16px",
            backgroundColor: "#28a745",
            color: "#fff",
            borderRadius: "6px",
            fontWeight: 500,
            textTransform: "none",
            padding: "12px",
          }}
        >
          Optimizasyonu Başlat
        </Button>

        <TaskModal />
        <AlgorithmSettingsModal />
      </CardContent>
    </Card>
  );
}

//drag selection eklenmesi yapıldı
