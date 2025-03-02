import React, { useState } from "react";
import { 
  Card, CardContent, Typography, List, ListItem, Box, Chip, TextField, 
  IconButton, Modal, Grid, FormControl, InputLabel, Select, MenuItem, 
  Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import AddTaskIcon from '@mui/icons-material/AddTask';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { keyframes, styled } from "@mui/system";

const statusColors = {
  Requested: "#FFC107", // Yellow
  "On the way": "#2196F3", // Blue
  Delivered: "#4CAF50", // Green
  Cancelled: "#F44336", // Red
};

// Blinking Animation (For pending and cancelled orders)
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

export default function CustomerPool({ customers }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCriteria, setFilterCriteria] = useState({
    demand: "",
    weight: "",
    timeWindow: ""
  });
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  
  // New states for customer selection and detail modal
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);

  // Filtering function
  const applyFilters = (customers) => {
    if (!customers) return [];
    
    return customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.id?.toString().includes(searchTerm);
      
      const matchesDemand = !filterCriteria.demand || 
                           customer.demand >= parseInt(filterCriteria.demand);
      
      const matchesWeight = !filterCriteria.weight || 
                           customer.weight >= parseInt(filterCriteria.weight);
      
      const matchesTimeWindow = !filterCriteria.timeWindow || 
                               (customer.timeWindow && customer.timeWindow.includes(filterCriteria.timeWindow));

      return matchesSearch && matchesDemand && matchesWeight && matchesTimeWindow;
    });
  };

  const handleFilterChange = (field, value) => {
    setFilterCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle customer selection
  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };

  // Open customer details modal
  const handleCustomerClick = (customer) => {
    setCurrentCustomer(customer);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setCurrentCustomer(null);
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2
  };

  const filteredCustomers = applyFilters(customers);

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
      <CardContent sx={{ flex: "0 1 auto", paddingBottom: "16px" }}>
        {/* Filtering Area */}
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
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Demand Amount</InputLabel>
                <Select
                  value={filterCriteria.demand}
                  label="Demand Amount"
                  onChange={(e) => handleFilterChange('demand', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="10">10+ kg</MenuItem>
                  <MenuItem value="20">20+ kg</MenuItem>
                  <MenuItem value="50">50+ kg</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Weight</InputLabel>
                <Select
                  value={filterCriteria.weight}
                  label="Weight"
                  onChange={(e) => handleFilterChange('weight', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="100">100+ kg</MenuItem>
                  <MenuItem value="200">200+ kg</MenuItem>
                  <MenuItem value="500">500+ kg</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Window</InputLabel>
                <Select
                  value={filterCriteria.timeWindow}
                  label="Time Window"
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

        {/* Title and Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            variant="h5"
            sx={{
              color: "#222",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Customer Pool
          </Typography>
          <Box>
            <IconButton 
              color="primary" 
              onClick={() => setOpenTaskModal(true)}
              sx={{ mr: 1 }}
            >
              <AddTaskIcon />
            </IconButton>
            <IconButton 
              color="primary" 
              onClick={() => setOpenCustomerModal(true)}
            >
              <PersonAddIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Status Labels */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            padding: "1px",
            backgroundColor: "#F9F9F9",
            borderRadius: "10px",
            fontWeight: 600,
            marginBottom: "10px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          {Object.keys(statusColors).map((status) => (
            <Box key={status} display="flex" alignItems="center" gap={1}>
              <CircleIcon sx={{ color: statusColors[status], fontSize: "1.2rem" }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#444" }}>
                {status}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>

      {/* Scrollable Customer List (Simplified View) */}
      <Box sx={{ flex: "1 1 auto", overflowY: "auto", padding: "0 10px", scrollbarWidth: "thin", scrollbarColor: "#999 #ddd" }}>
        <List sx={{ paddingRight: "5px" }}>
          {filteredCustomers.map((customer, index) => (
            <ListItem key={index} divider sx={{ padding: "8px 0" }}>
              <Box
                display="flex"
                alignItems="center"
                width="100%"
                sx={{
                  padding: "8px 12px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "10px",
                  borderLeft: `5px solid ${statusColors[customer.status]}`,
                  boxShadow: "0 1px 6px rgba(0, 0, 0, 0.06)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": { 
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
                    cursor: "pointer"
                  },
                }}
              >
                {/* Checkbox for selection */}
                <Checkbox 
                  checked={selectedCustomers.includes(customer.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleCustomerSelect(customer.id);
                  }}
                  sx={{ padding: "4px" }}
                />
                
                {/* Simplified Customer Info - Clickable to see details */}
                <Box 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  width="100%"
                  onClick={() => handleCustomerClick(customer)}
                >
                  <Box display="flex" alignItems="center">
                    <BlinkingCircle status={customer.status} sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {customer.name}
                    </Typography>
                  </Box>
                  
                  <Chip
                    label={customer.status}
                    size="small"
                    sx={{
                      backgroundColor: statusColors[customer.status],
                      color: "#fff",
                      fontWeight: 600,
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                    }}
                  />
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Customer Detail Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={closeDetailModal}
        maxWidth="sm"
        fullWidth
      >
        {currentCustomer && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              borderBottom: `3px solid ${statusColors[currentCustomer.status]}`
            }}>
              <Typography variant="h6">Customer Details</Typography>
              <Chip
                label={currentCustomer.status}
                sx={{
                  backgroundColor: statusColors[currentCustomer.status],
                  color: "#fff",
                  fontWeight: 600,
                }}
              />
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                {currentCustomer.name}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>📦 Brand:</strong> {currentCustomer.brand}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>📍 Address:</strong> {currentCustomer.address}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>📦 Demand:</strong> {currentCustomer.demand} kg
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>⚖️ Weight:</strong> {currentCustomer.weight} kg
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>📆 Order Date:</strong> {currentCustomer.orderDate}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>⏱️ Time Window:</strong> {currentCustomer.timeWindow}
                  </Typography>
                </Grid>
                {currentCustomer.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>📝 Notes:</strong> {currentCustomer.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDetailModal}>Close</Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  handleCustomerSelect(currentCustomer.id);
                  closeDetailModal();
                }}
              >
                {selectedCustomers.includes(currentCustomer.id) ? "Deselect" : "Select"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add Task Modal */}
      <Modal
        open={openTaskModal}
        onClose={() => setOpenTaskModal(false)}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add New Task
          </Typography>
          {/* Task addition form content will go here */}
        </Box>
      </Modal>

      {/* Add Customer Modal */}
      <Modal
        open={openCustomerModal}
        onClose={() => setOpenCustomerModal(false)}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add New Customer
          </Typography>
          {/* Customer addition form content will go here */}
        </Box>
      </Modal>
    </Card>
  );
}