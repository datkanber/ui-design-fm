import React, { useRef, useEffect } from 'react';
import { Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import Chart from 'chart.js/auto';

export default function MultiAlgorithmComparison({ algorithms, setAlgorithms, runComparison }) {
  const availableAlgorithms = ['Simulated Annealing', 'Tabu Search', 'OR-Tools'];

  const handleAlgorithmChange = (event) => {
    setAlgorithms(event.target.value);
  };

  return (
    <Card style={{ padding: '16px', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Algoritma Karşılaştırması
        </Typography>

        <FormControl fullWidth variant="outlined" style={{ marginBottom: '16px' }}>
          <InputLabel id="algorithm-label">Algoritmalar</InputLabel>
          <Select
            labelId="algorithm-label"
            multiple
            value={algorithms}
            onChange={handleAlgorithmChange}
            label="Algoritmalar"
          >
            {availableAlgorithms.map((algo) => (
              <MenuItem key={algo} value={algo}>{algo}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" fullWidth onClick={runComparison} style={{ backgroundColor: '#004085', color: '#fff' }}>
          Karşılaştırmayı Başlat
        </Button>
      </CardContent>
    </Card>
  );
}

export function ComparisonResults({ results }) {
  return (
    <Card style={{ padding: '16px', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Sonuç Karşılaştırması
        </Typography>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Algoritma</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Süre (ms)</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>Maliyet</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{result.algorithm}</td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{result.time}</td>
                <td style={{ borderBottom: '1px solid #ddd', padding: '8px' }}>{result.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export function ComparisonChart({ results }) {
  const chartRef = useRef(null);
  let chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy(); // Önceki grafiği temizle
      }
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: results.map(r => r.algorithm),
          datasets: [
            {
              label: 'Çalışma Süresi (ms)',
              data: results.map(r => r.time),
              backgroundColor: 'blue',
            },
            {
              label: 'Toplam Maliyet',
              data: results.map(r => r.cost),
              backgroundColor: 'green',
            },
          ],
        },
      });
    }
  }, [results]);

  return <canvas ref={chartRef} />;
}
