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
  const [objectiveFunction, setObjectiveFunction] = useState("Time");

  // Algoritma seçildiğinde varsayılan parametreleri otomatik yükle
  useEffect(() => {
    const defaultParams = {
      "Simulated Annealing": {
        iterationNumber: 100000,
        initialTemperature: 1000000,
        alpha: 0.9999,
      },
      "Tabu Search": {
        iterationNumber: 123,
        tabuListLength: 5,
        candidateListSize: 10,
      },
      "OR-Tools": {},
    };

    // Seçim yapıldığında parametreleri sıfırdan yükle
    setParameters({ ...defaultParams[algorithm] });
  }, [algorithm]);

  return (
    <Card
      style={{
        padding: "16px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
      }}
    >
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
        </RadioGroup>

        {/* Amaç Fonksiyonu */}
        <Typography variant="subtitle1" style={{ fontWeight: "bold", marginTop: "15px" }}>
          SA-TS Algorithms Objective Function
        </Typography>
        <RadioGroup row value={objectiveFunction} onChange={(e) => setObjectiveFunction(e.target.value)}>
          <FormControlLabel value="Time" control={<Radio />} label="Time" />
          <FormControlLabel value="Distance" control={<Radio />} label="Distance" />
          <FormControlLabel value="Energy" control={<Radio />} label="Energy" />
          <FormControlLabel value="Tardiness" control={<Radio />} label="Tardiness" />
        </RadioGroup>

        {/* Şarj Stratejisi */}
        <Typography variant="subtitle1" style={{ fontWeight: "bold", marginTop: "15px" }}>
          SA-TS Algorithms Charge Strategy
        </Typography>
        <RadioGroup row value={chargeStrategy} onChange={(e) => setChargeStrategy(e.target.value)}>
          <FormControlLabel value="Full" control={<Radio />} label="Full" />
          <FormControlLabel value="Partial" control={<Radio />} label="Partial" />
          <FormControlLabel value="%20-%80" control={<Radio />} label="%20-%80" />
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
              onChange={(e) => setParameters({ ...parameters, iterationNumber: e.target.value })}
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Initial Temperature"
              type="number"
              fullWidth
              value={parameters.initialTemperature || ""}
              onChange={(e) => setParameters({ ...parameters, initialTemperature: e.target.value })}
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Alpha"
              type="number"
              fullWidth
              value={parameters.alpha || ""}
              onChange={(e) => setParameters({ ...parameters, alpha: e.target.value })}
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <Typography variant="caption" color="textSecondary">
              Alpha value must be between 0 and 1
            </Typography>
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
              onChange={(e) => setParameters({ ...parameters, iterationNumber: e.target.value })}
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Tabu List Length"
              type="number"
              fullWidth
              value={parameters.tabuListLength || ""}
              onChange={(e) => setParameters({ ...parameters, tabuListLength: e.target.value })}
              variant="outlined"
              style={{ marginTop: "8px" }}
            />
            <TextField
              label="Candidate List Size"
              type="number"
              fullWidth
              value={parameters.candidateListSize || ""}
              onChange={(e) => setParameters({ ...parameters, candidateListSize: e.target.value })}
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
            padding: "10px",
          }}
        >
          Save Parameters
        </Button>
      </CardContent>
    </Card>
  );
}
