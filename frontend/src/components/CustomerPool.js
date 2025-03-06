import React, { useState, useEffect } from "react";
import { 
  Card, CardContent, Typography, List, ListItem, Box, Chip, TextField, 
  IconButton, Modal, Grid, FormControl, InputLabel, Select, MenuItem, 
  Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  FormHelperText, Tooltip
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import AddTaskIcon from '@mui/icons-material/AddTask';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
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

export default function CustomerPool({ customers: initialCustomers }) {
  // Local state for managing customers internally
  const [customers, setCustomers] = useState([]);
  const [originalCustomers, setOriginalCustomers] = useState([]);
  const [isNewDataAdded, setIsNewDataAdded] = useState(false);
  
  // Initialize customers state from props
  useEffect(() => {
    if (initialCustomers && initialCustomers.length > 0) {
      setCustomers(initialCustomers);
      setOriginalCustomers(initialCustomers);
    }
  }, [initialCustomers]);

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

  // New task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: [],
    dueDate: '',  // Changed from Date object to string
    priority: 'medium',
    status: 'pending'
  });
  
  // New customer form state
  const [customerForm, setCustomerForm] = useState({
    name: '',
    brand: '',
    address: '',
    demand: '',
    weight: '',
    orderDate: '',  // Changed from Date object to string
    timeWindow: '',
    status: 'Requested',
    notes: ''
  });
  
  // Form validation states
  const [taskFormErrors, setTaskFormErrors] = useState({});
  const [customerFormErrors, setCustomerFormErrors] = useState({});

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

  // Handle task form changes
  const handleTaskFormChange = (field, value) => {
    setTaskForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if exists
    if (taskFormErrors[field]) {
      setTaskFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Handle customer form changes
  const handleCustomerFormChange = (field, value) => {
    setCustomerForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if exists
    if (customerFormErrors[field]) {
      setCustomerFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Refresh functionality
  const handleRefresh = () => {
    // Reset to original data or you could simulate fetching new data
    setCustomers(originalCustomers);
    setIsNewDataAdded(false);
    setSelectedCustomers([]);
  };

  // Validate and submit task form
  const handleTaskSubmit = () => {
    const errors = {};
    
    if (!taskForm.title.trim()) errors.title = "Title is required";
    if (!taskForm.description.trim()) errors.description = "Description is required";
    if (taskForm.assignedTo.length === 0) errors.assignedTo = "Assign to at least one customer";
    if (!taskForm.dueDate.trim()) errors.dueDate = "Due date is required";
    
    if (Object.keys(errors).length > 0) {
      setTaskFormErrors(errors);
      return;
    }
    
    // Update customers with the task
    setCustomers(prevCustomers => {
      return prevCustomers.map(customer => {
        if (taskForm.assignedTo.includes(customer.id)) {
          // Add task to this customer
          return {
            ...customer,
            tasks: [...(customer.tasks || []), {
              id: Date.now() + Math.random().toString(36).substring(2, 9),
              title: taskForm.title,
              description: taskForm.description,
              dueDate: taskForm.dueDate,
              priority: taskForm.priority,
              status: taskForm.status
            }],
            status: "On the way" // Update status to show change
          };
        }
        return customer;
      });
    });
    
    setIsNewDataAdded(true);
    
    // Reset form and close modal
    setTaskForm({
      title: '',
      description: '',
      assignedTo: [],
      dueDate: '',
      priority: 'medium',
      status: 'pending'
    });
    setOpenTaskModal(false);
  };

  // Validate and submit customer form
  const handleCustomerSubmit = () => {
    const errors = {};
    
    if (!customerForm.name.trim()) errors.name = "Name is required";
    if (!customerForm.address.trim()) errors.address = "Address is required";
    if (!customerForm.demand) errors.demand = "Demand is required";
    if (!customerForm.weight) errors.weight = "Weight is required";
    if (!customerForm.orderDate.trim()) errors.orderDate = "Order date is required";
    
    if (Object.keys(errors).length > 0) {
      setCustomerFormErrors(errors);
      return;
    }
    
    // Add the new customer to the list
    const newCustomer = {
      ...customerForm,
      id: Date.now() + Math.random().toString(36).substring(2, 9), // Generate unique ID
      demand: Number(customerForm.demand),
      weight: Number(customerForm.weight)
    };
    
    setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
    setIsNewDataAdded(true);
    
    // Reset form and close modal
    setCustomerForm({
      name: '',
      brand: '',
      address: '',
      demand: '',
      weight: '',
      orderDate: '',
      timeWindow: '',
      status: 'Requested',
      notes: ''
    });
    setOpenCustomerModal(false);
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
                  <MenuItem value="10">10+ adet</MenuItem>
                  <MenuItem value="20">20+ adet</MenuItem>
                  <MenuItem value="50">50+ adet</MenuItem>
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
                  <MenuItem value="100">100+ adet</MenuItem>
                  <MenuItem value="200">200+ adet</MenuItem>
                  <MenuItem value="500">500+ adet</MenuItem>
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
            {isNewDataAdded && (
              <Chip 
                label="New Data Added" 
                color="success" 
                size="small" 
                sx={{ ml: 2, fontSize: '0.7rem' }}
              />
            )}
          </Typography>
          <Box>
            <Tooltip title="Refresh Data">
              <IconButton 
                color="primary" 
                onClick={handleRefresh}
                sx={{ mr: 1 }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add Task">
              <IconButton 
                color="primary" 
                onClick={() => setOpenTaskModal(true)}
                sx={{ mr: 1 }}
              >
                <AddTaskIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add Customer">
              <IconButton 
                color="primary" 
                onClick={() => setOpenCustomerModal(true)}
              >
                <PersonAddIcon />
              </IconButton>
            </Tooltip>
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
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer, index) => (
              <ListItem key={customer.id || index} divider sx={{ padding: "8px 0" }}>
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
                  
                  {/* 3-Column Layout - Clickable to see details */}
                  <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center" 
                    width="100%"
                    onClick={() => handleCustomerClick(customer)}
                  >
                    <Grid container spacing={1} alignItems="center">
                      {/* Column 1: Status Dot + Time Window */}
                      <Grid item xs={3} sx={{ display: "flex", alignItems: "center" }}>
                        <BlinkingCircle status={customer.status} sx={{ mr: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {customer.timeWindow || "Any time"}
                        </Typography>
                      </Grid>
                      
                      {/* Column 2: Customer Name */}
                      <Grid item xs={5}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {customer.name}
                          {customer.tasks && customer.tasks.length > 0 && (
                            <Chip 
                              label={`${customer.tasks.length} task${customer.tasks.length > 1 ? 's' : ''}`}
                              size="small"
                              color="primary"
                              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Typography>
                      </Grid>
                      
                      {/* Column 3: Request Details (units) */}
                      <Grid item xs={4} sx={{ textAlign: "right" }}>
                        <Typography variant="body2">
                          {customer.demand} adet
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </ListItem>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="textSecondary">
                No customers found. Add a new customer or adjust your filters.
              </Typography>
            </Box>
          )}
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
                    <strong>📦 Demand:</strong> {currentCustomer.demand} adet
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    <strong>⚖️ Weight:</strong> {currentCustomer.weight} adet
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
                {/* Show tasks if any */}
                {currentCustomer.tasks && currentCustomer.tasks.length > 0 && (
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Assigned Tasks
                    </Typography>
                    {currentCustomer.tasks.map((task, index) => (
                      <Box key={task.id || index} sx={{ 
                        mb: 1, 
                        p: 1, 
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        backgroundColor: '#f9f9f9'
                      }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {task.title}
                          <Chip
                            label={task.priority}
                            size="small"
                            color={task.priority === 'high' ? 'error' : (task.priority === 'medium' ? 'warning' : 'default')}
                            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                          />
                        </Typography>
                        <Typography variant="body2">{task.description}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Due: {task.dueDate}
                        </Typography>
                      </Box>
                    ))}
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
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                variant="outlined"
                value={taskForm.title}
                onChange={(e) => handleTaskFormChange('title', e.target.value)}
                error={!!taskFormErrors.title}
                helperText={taskFormErrors.title}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                rows={3}
                value={taskForm.description}
                onChange={(e) => handleTaskFormChange('description', e.target.value)}
                error={!!taskFormErrors.description}
                helperText={taskFormErrors.description}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!taskFormErrors.assignedTo}>
                <InputLabel>Assign To</InputLabel>
                <Select
                  multiple
                  value={taskForm.assignedTo}
                  onChange={(e) => handleTaskFormChange('assignedTo', e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((customerId) => {
                        const customer = customers.find(c => c.id === customerId);
                        return customer ? (
                          <Chip key={customerId} label={customer.name} />
                        ) : null;
                      })}
                    </Box>
                  )}
                >
                  {customers?.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      <Checkbox checked={taskForm.assignedTo.indexOf(customer.id) > -1} />
                      <Typography>{customer.name}</Typography>
                    </MenuItem>
                  ))}
                </Select>
                {taskFormErrors.assignedTo && (
                  <FormHelperText>{taskFormErrors.assignedTo}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                value={taskForm.dueDate}
                onChange={(e) => handleTaskFormChange('dueDate', e.target.value)}
                error={!!taskFormErrors.dueDate}
                helperText={taskFormErrors.dueDate}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={taskForm.priority}
                  onChange={(e) => handleTaskFormChange('priority', e.target.value)}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button 
              onClick={() => setOpenTaskModal(false)} 
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleTaskSubmit}
            >
              Create Task
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Add Customer Modal */}
      <Modal
        open={openCustomerModal}
        onClose={() => setOpenCustomerModal(false)}
      >
        <Box sx={{...modalStyle, width: 500}}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add New Customer
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Name"
                variant="outlined"
                value={customerForm.name}
                onChange={(e) => handleCustomerFormChange('name', e.target.value)}
                error={!!customerFormErrors.name}
                helperText={customerFormErrors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Brand"
                variant="outlined"
                value={customerForm.brand}
                onChange={(e) => handleCustomerFormChange('brand', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                variant="outlined"
                value={customerForm.address}
                onChange={(e) => handleCustomerFormChange('address', e.target.value)}
                error={!!customerFormErrors.address}
                helperText={customerFormErrors.address}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Demand (adet)"
                variant="outlined"
                type="number"
                value={customerForm.demand}
                onChange={(e) => handleCustomerFormChange('demand', e.target.value)}
                error={!!customerFormErrors.demand}
                helperText={customerFormErrors.demand}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weight (adet)"
                variant="outlined"
                type="number"
                value={customerForm.weight}
                onChange={(e) => handleCustomerFormChange('weight', e.target.value)}
                error={!!customerFormErrors.weight}
                helperText={customerFormErrors.weight}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Order Date"
                type="date"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                value={customerForm.orderDate}
                onChange={(e) => handleCustomerFormChange('orderDate', e.target.value)}
                error={!!customerFormErrors.orderDate}
                helperText={customerFormErrors.orderDate}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Time Window</InputLabel>
                <Select
                  value={customerForm.timeWindow}
                  onChange={(e) => handleCustomerFormChange('timeWindow', e.target.value)}
                >
                  <MenuItem value="">Any time</MenuItem>
                  <MenuItem value="morning">Morning</MenuItem>
                  <MenuItem value="afternoon">Afternoon</MenuItem>
                  <MenuItem value="evening">Evening</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={customerForm.status}
                  onChange={(e) => handleCustomerFormChange('status', e.target.value)}
                >
                  <MenuItem value="Requested">Requested</MenuItem>
                  <MenuItem value="On the way">On the way</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                variant="outlined"
                multiline
                rows={3}
                value={customerForm.notes}
                onChange={(e) => handleCustomerFormChange('notes', e.target.value)}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button 
              onClick={() => setOpenCustomerModal(false)} 
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleCustomerSubmit}
            >
              Add Customer
            </Button>
          </Box>
        </Box>
      </Modal>
    </Card>
  );
}