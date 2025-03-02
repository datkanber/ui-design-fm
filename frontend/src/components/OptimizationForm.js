import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  Divider,
} from "@mui/material";

export default function OptimizationForm({ algorithm, setAlgorithm }) {
  const [parameters, setParameters] = useState({});
  const [chargeStrategy, setChargeStrategy] = useState("Full");
  const [objectiveFunction, setObjectiveFunction] = useState("Distance");
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
    },
  });

  useEffect(() => {
    // Seçilen algoritmanın parametrelerini yükle
    setParameters(algorithmParams[algorithm] || {});
  }, [algorithm]);

  return (
    <Card style={{
      padding: "16px",
      backgroundColor: "#f9f9f9",
      borderRadius: "8px",
      boxShadow: "0px 2px 4px rgba(0,0,0,0.1)"
    }}>
      <CardContent>
        <Typography variant="h5" gutterBottom style={{ textAlign: "center", fontWeight: "bold" }}>
          Optimization Settings
        </Typography>

        {/* Algoritma Seçimi */}
        <Typography variant="subtitle1" style={{ fontWeight: "bold", marginTop: "10px" }}>
          Selected Routing Algorithm
        </Typography>
        <RadioGroup row value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
          <FormControlLabel value="OR-Tools" control={<Radio />} label="OR-Tools" />
          <FormControlLabel value="Simulated Annealing" control={<Radio />} label="Simulated Annealing" />
          <FormControlLabel value="Tabu Search" control={<Radio />} label="Tabu Search" />
          <FormControlLabel value="Adaptive Large Neighborhood Search" control={<Radio />} label="ALNS" />
        </RadioGroup>

        {/* Amaç Fonksiyonu */}
        <Typography variant="subtitle1" style={{ fontWeight: "bold", marginTop: "15px" }}>
          {algorithm} Algoritması için Amaç Fonksiyonu
        </Typography>
        <RadioGroup row value={objectiveFunction} onChange={(e) => setObjectiveFunction(e.target.value)}>
          <FormControlLabel value="Distance" control={<Radio />} label="Minimum Distance" />
          <FormControlLabel value="Time" control={<Radio />} label="Minimum Time" />
          <FormControlLabel value="Energy" control={<Radio />} label="Minimum Energy" />
          <FormControlLabel value="Tardiness" control={<Radio />} label="Minimum Tardiness" />
        </RadioGroup>

        {/* Şarj Stratejisi */}
        <Typography variant="subtitle1" style={{ fontWeight: "bold", marginTop: "15px" }}>
          {algorithm} Algoritması için Şarj Stratejisi
        </Typography>
        <RadioGroup row value={chargeStrategy} onChange={(e) => setChargeStrategy(e.target.value)}>
          <FormControlLabel value="Full" control={<Radio />} label="Full Charge" />
          <FormControlLabel value="Partial" control={<Radio />} label="Partial Charge" />
          <FormControlLabel value="%20-%80" control={<Radio />} label="%20-%80 Charge" />
        </RadioGroup>

        <Divider style={{ margin: "16px 0" }} />

        {/* Algoritmaya Göre Dinamik Parametre Alanları */}
        {algorithm === "Simulated Annealing" && (
          <>
            <Typography variant="h6" style={{ fontWeight: "bold" }}>
              Simulated Annealing Parameters
            </Typography>
            <TextField
              label="Iteration Number"
              type="number"
              fullWidth
              value={parameters.iterationNumber || ""}
              onChange={(e) => setParameters({ ...parameters, iterationNumber: parseInt(e.target.value) })}
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Initial Temperature"
              type="number"
              fullWidth
              value={parameters.initialTemperature || ""}
              onChange={(e) => setParameters({ ...parameters, initialTemperature: parseInt(e.target.value) })}
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Cooling Rate"
              type="number"
              fullWidth
              value={parameters.coolingRate || ""}
              onChange={(e) => setParameters({ ...parameters, coolingRate: parseFloat(e.target.value) })}
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
          </>
        )}

        {algorithm === "Tabu Search" && (
          <>
            <Typography variant="h6" style={{ fontWeight: "bold" }}>
              Tabu Search Parameters
            </Typography>
            <TextField
              label="Iteration Number"
              type="number"
              fullWidth
              value={parameters.iterationNumber || ""}
              onChange={(e) => setParameters({ ...parameters, iterationNumber: parseInt(e.target.value) })}
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Tabu List Length"
              type="number"
              fullWidth
              value={parameters.tabuListLength || ""}
              onChange={(e) => setParameters({ ...parameters, tabuListLength: parseInt(e.target.value) })}
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Candidate Solution Count"
              type="number"
              fullWidth
              value={parameters.candidateSolutionCount || ""}
              onChange={(e) => setParameters({ ...parameters, candidateSolutionCount: parseInt(e.target.value) })}
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
          </>
        )}

        {algorithm === "Adaptive Large Neighborhood Search" && (
          <>
            <Typography variant="h6" style={{ fontWeight: "bold" }}>
              ALNS Parameters
            </Typography>
            <TextField
              label="Iteration Number"
              type="number"
              fullWidth
              value={parameters.iterationNumber || ""}
              onChange={(e) => setParameters({ ...parameters, iterationNumber: parseInt(e.target.value) })}
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Station Insertion Frequency"
              type="number"
              fullWidth
              value={parameters.stationInsertionFrequency || ""}
              onChange={(e) => setParameters({ ...parameters, stationInsertionFrequency: parseFloat(e.target.value) })}
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Route Removal Frequency"
              type="number"
              fullWidth
              value={parameters.routeRemovalFrequency || ""}
              onChange={(e) => setParameters({ ...parameters, routeRemovalFrequency: parseFloat(e.target.value) })}
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Weight Update Frequency"
              type="number"
              fullWidth
              value={parameters.weightUpdateFrequency || ""}
              onChange={(e) => setParameters({ ...parameters, weightUpdateFrequency: parseFloat(e.target.value) })}
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Initial Temperature"
              type="number"
              fullWidth
              value={parameters.initialTemperature || ""}
              onChange={(e) => setParameters({ ...parameters, initialTemperature: parseInt(e.target.value) })}
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Cooling Rate"
              type="number"
              fullWidth
              value={parameters.coolingRate || ""}
              onChange={(e) => setParameters({ ...parameters, coolingRate: parseFloat(e.target.value) })}
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
          </>
        )}


        {/* Kaydet Butonu */}
        <Button
          variant="contained"
          fullWidth
          style={{
            marginTop: "16px",
            backgroundColor: "#004085",
            color: "#fff",
            borderRadius: "6px",
            fontWeight: 500,
            textTransform: "none",
            padding: "10px"
          }}
          onClick={() => {
            setAlgorithmParams(prev => ({
              ...prev,
              [algorithm]: parameters
            }));
          }}
        >
          Save Parameters
        </Button>
      </CardContent>
    </Card>
  );
}
