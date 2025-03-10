import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Card, CardContent, Typography, List, ListItem, Box, TextField, 
  IconButton, Grid, FormControl, InputLabel, Select, MenuItem, 
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Tooltip
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import RefreshIcon from "@mui/icons-material/Refresh";
import { keyframes, styled } from "@mui/system";

// API URL - Güncelleyebilirsiniz
const API_URL = "http://localhost:5000/api/customers";

const statusColors = {
  Requested: "#FFC107", // Sarı
  "On the way": "#2196F3", // Mavi
  Delivered: "#4CAF50", // Yeşil
  Cancelled: "#F44336", // Kırmızı
};

// Yanıp Sönme Efekti (Bekleyen ve iptal edilen siparişler için)
const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
`;

const BlinkingCircle = styled(CircleIcon)(({ status }) => ({
  color: statusColors[status],
  fontSize: "1.3rem",
  animation: status === "Requested" || status === "Cancelled" ? `${blink} 1.32s infinite` : "none",
}));

export default function CustomerPool() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCriteria, setFilterCriteria] = useState({
    demand: "",
    timeWindow: ""
  });

  // API'den müşteri verilerini çek
  useEffect(() => {
    axios.get(API_URL)
      .then(response => {
        setCustomers(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("API Fetch Error:", error);
        setError("Müşteri verisi alınırken hata oluştu.");
        setLoading(false);
      });
  }, []);

  // Filtreleme fonksiyonu
  const applyFilters = (customers) => {
    if (!customers) return [];

    return customers.filter(customer => {
      const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            customer.id?.toString().includes(searchTerm);

      const matchesDemand = !filterCriteria.demand || 
                           (customer.demand && customer.demand >= parseInt(filterCriteria.demand));

      const matchesTimeWindow = !filterCriteria.timeWindow || 
                               (customer.timeWindow && customer.timeWindow.includes(filterCriteria.timeWindow));

      return matchesSearch && matchesDemand && matchesTimeWindow;
    });
  };

  const handleFilterChange = (field, value) => {
    setFilterCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);

  const handleCustomerClick = (customer) => {
    setCurrentCustomer(customer);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setCurrentCustomer(null);
  };

  // Refresh işlemi - API'den veriyi tekrar çeker
  const handleRefresh = () => {
    setLoading(true);
    axios.get(API_URL)
      .then(response => {
        setCustomers(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("API Refresh Error:", error);
        setError("Veri yenilenirken hata oluştu.");
        setLoading(false);
      });
  };

  const filteredCustomers = applyFilters(customers);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Card
      sx={{
        borderRadius: "14px",
        padding: "19px",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
        border: "1px solid #E0E0E0",
        height: "681px",
        width: "100%",
        maxWidth: "750px",
        margin: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Customer Pool
          </Typography>
          <Tooltip title="Refresh Data">
            <IconButton color="primary" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Filtreleme Alanı */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                label="Search Customer"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Demand Amount</InputLabel>
                <Select
                  value={filterCriteria.demand}
                  onChange={(e) => handleFilterChange('demand', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="10">10+ adet</MenuItem>
                  <MenuItem value="20">20+ adet</MenuItem>
                  <MenuItem value="50">50+ adet</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Window</InputLabel>
                <Select
                  value={filterCriteria.timeWindow}
                  onChange={(e) => handleFilterChange('timeWindow', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="morning">Morning</MenuItem>
                  <MenuItem value="afternoon">Afternoon</MenuItem>
                  <MenuItem value="evening">Evening</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <List>
          {filteredCustomers.map((customer, index) => (
            <ListItem key={customer.id || index} divider onClick={() => handleCustomerClick(customer)}>
              <BlinkingCircle status={customer.status} sx={{ mr: 2 }} />
              <Typography>{customer.name} - {customer.demand} adet</Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>

      {/* Detay Modalı */}
      <Dialog open={detailModalOpen} onClose={closeDetailModal}>
        {currentCustomer && (
          <>
            <DialogTitle>{currentCustomer.name}</DialogTitle>
            <DialogContent>
              <Typography>Demand: {currentCustomer.demand} adet</Typography>
              <Typography>Status: {currentCustomer.status}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDetailModal}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Card>
  );
}
