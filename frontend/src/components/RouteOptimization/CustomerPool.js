import React, { useState, useEffect } from "react";
import {
  Card, CardContent, Typography, List, ListItem, Box, Chip, TextField,
  IconButton, Modal, Grid, FormControl, InputLabel, Select, MenuItem,
  Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  FormHelperText, Tooltip, Radio, RadioGroup, FormControlLabel, FormLabel, CircularProgress,
  ListItemIcon, ListItemText
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import AddTaskIcon from '@mui/icons-material/AddTask';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import DescriptionIcon from '@mui/icons-material/Description';
import { keyframes, styled } from "@mui/system";
import axios from "axios";
import { loadTaskData } from "../../services/taskService";

const statusColors = {
  Requested: "#FFC107",
  "On the way": "#2196F3",
  Delivered: "#4CAF50",
  Cancelled: "#F44336",
};

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
  // Genel müşteri ve UI state'leri
  const [customers, setCustomers] = useState([]);
  const [originalCustomers, setOriginalCustomers] = useState([]);
  const [isNewDataAdded, setIsNewDataAdded] = useState(false);
  const [downloadedFiles, setDownloadedFiles] = useState([]);

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

  // Müşteri detay modalı state'leri
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: [],
    dueDate: '',
    priority: 'medium',
    status: 'pending'
  });

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: '',
    brand: '',
    address: '',
    demand: '',
    orderDate: '',
    startTime: '',
    endTime: '',
    status: 'Requested',
    notes: ''
  });

  // Form doğrulama state'leri
  const [taskFormErrors, setTaskFormErrors] = useState({});
  const [customerFormErrors, setCustomerFormErrors] = useState({});

  // Filtreleme fonksiyonu
  const applyFilters = (customers) => {
    if (!customers) return [];
    return customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              customer.id?.toString().includes(searchTerm);
      const matchesDemand = !filterCriteria.demand || customer.demand >= parseInt(filterCriteria.demand);
      const matchesWeight = !filterCriteria.weight || customer.weight >= parseInt(filterCriteria.weight);
      const matchesTimeWindow = !filterCriteria.timeWindow || (customer.timeWindow && customer.timeWindow.includes(filterCriteria.timeWindow));
      return matchesSearch && matchesDemand && matchesWeight && matchesTimeWindow;
    });
  };

  const handleFilterChange = (field, value) => {
    setFilterCriteria(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId) ? prev.filter(id => id !== customerId) : [...prev, customerId]
    );
  };

  const handleCustomerClick = (customer) => {
    setCurrentCustomer(customer);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setCurrentCustomer(null);
  };

  const handleTaskFormChange = (field, value) => {
    setTaskForm(prev => ({ ...prev, [field]: value }));
    if (taskFormErrors[field]) {
      setTaskFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleCustomerFormChange = (field, value) => {
    setCustomerForm(prev => ({ ...prev, [field]: value }));
    if (customerFormErrors[field]) {
      setCustomerFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleRefresh = () => {
    setCustomers(originalCustomers);
    setIsNewDataAdded(false);
    setSelectedCustomers([]);
  };

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
    setCustomers(prevCustomers =>
      prevCustomers.map(customer => {
        if (taskForm.assignedTo.includes(customer.id)) {
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
            status: "On the way"
          };
        }
        return customer;
      })
    );
    setIsNewDataAdded(true);
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

  const handleCustomerSubmit = () => {
    const errors = {};
    if (!customerForm.name.trim()) errors.name = "Name is required";
    if (!customerForm.address.trim()) errors.address = "Address is required";
    if (!customerForm.demand) errors.demand = "Demand is required";
    if (!customerForm.orderDate.trim()) errors.orderDate = "Order date is required";
    if ((customerForm.startTime && !customerForm.endTime) || (!customerForm.startTime && customerForm.endTime)) {
      errors.timeWindow = "Both start and end time must be provided";
    }
    if (Object.keys(errors).length > 0) {
      setCustomerFormErrors(errors);
      return;
    }
    let timeWindow = '';
    if (customerForm.startTime && customerForm.endTime) {
      timeWindow = `${customerForm.startTime}-${customerForm.endTime}`;
    }
    const newCustomer = {
      ...customerForm,
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      demand: Number(customerForm.demand),
      timeWindow: timeWindow
    };
    setCustomers(prev => [...prev, newCustomer]);
    setIsNewDataAdded(true);
    setCustomerForm({
      name: '',
      brand: '',
      address: '',
      demand: '',
      orderDate: '',
      startTime: '',
      endTime: '',
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

  // ESOGU Task Selection modal state
  const [openEsoguModal, setOpenEsoguModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [taskError, setTaskError] = useState('');

  const handleOpenEsoguModal = () => setOpenEsoguModal(true);
  const handleCloseEsoguModal = () => setOpenEsoguModal(false);

  const handleTaskSelection = (event) => {
    setSelectedTask(event.target.value);
    setTaskError('');
  };

  const saveResponseToPublicOutput = async (data, contentType, filename) => {
    try {
      const blob = new Blob([data], { type: contentType });
      const formData = new FormData();
      formData.append('file', blob, filename);
      const saveResponse = await axios.post('http://localhost:3001/save-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('File saved to public/output:', saveResponse.data);
      return saveResponse.data.path;
    } catch (error) {
      console.error('Error saving file to public/output:', error);
      return null;
    }
  };

  const saveZipToPublicOutput = async (data, filename) => {
    try {
      const blob = new Blob([data], { type: 'application/zip' });
      const formData = new FormData();
      formData.append('zipFile', blob, filename);
      const saveResponse = await axios.post('http://localhost:3001/save-zip', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Zip saved and extracted to public/output:', saveResponse.data);
      return saveResponse.data;
    } catch (error) {
      console.error('Error saving zip to public/output:', error);
      return null;
    }
  };

  const handleTaskConfirm = async () => {
    if (!selectedTask) {
      setTaskError('Please select a task');
      return;
    }
  
    // Save to localStorage
    localStorage.setItem('selectedEsoguTask', selectedTask);
    
    // Dispatch a custom event to notify other components
    const taskSelectedEvent = new CustomEvent('esoguTaskSelected', { 
      detail: { task: selectedTask } 
    });
    window.dispatchEvent(taskSelectedEvent);
    
    alert(`Task ${selectedTask} selected successfully! Click "Start Optimize" in the Optimization panel to process.`);
    handleCloseEsoguModal();
  };
  //   setIsLoading(true);
  //   try {
  //     // Load task data using the imported function
  //     // const taskDataResponse = await loadTaskData(selectedTask);
  //     const formData = new FormData();
  //     const filesToFetch = [
  //       { path: `/esogu_dataset/Info4Tasks/newesoguv32-${selectedTask.toLowerCase()}-ds1.xml`, name: `newesoguv32-${selectedTask.toLowerCase()}-ds1.xml` },
  //       { path: '/esogu_dataset/Info4Environment/Info4Environment.xml', name: 'Info4Environment.xml' },
  //       { path: '/esogu_dataset/Info4ChargingStation/Info4ChargingStation.xml', name: 'Info4ChargingStation.xml' },
  //       { path: '/esogu_dataset/Info4Vehicle/FC_Info4Vehicle.xml', name: 'FC_Info4Vehicle.xml' },
  //       { path: '/esogu_dataset/Map4Environment/Map4Environment.xml', name: 'Map4Environment.xml' },
  //       { path: '/esogu_dataset/Input4Algorithm/Input.xml', name: 'Input.xml' }
  //     ];
      
  //     for (const file of filesToFetch) {
  //       const response = await fetch(file.path);
  //       const blob = await response.blob();
  //       formData.append('input_files', blob, file.name);
  //     }
      
  //     formData.append('taskType', selectedTask);
      
  //     const response = await axios.post('http://localhost:8000/start_alns', formData, {
  //       headers: { 'Content-Type': 'multipart/form-data' },
  //       responseType: 'blob'
  //     });
      

      
  //     console.log('Algorithm response:', response);
  //     const savedFiles = [];
    
  //     if (response.headers['content-type'] === 'application/zip') {
  //       let filename = `output_${selectedTask}_${new Date().getTime()}.zip`;
  //       const contentDisposition = response.headers['content-disposition'];
  //       if (contentDisposition) {
  //         const filenameMatch = contentDisposition.match(/filename="(.+)"/);
  //         if (filenameMatch) {
  //           filename = filenameMatch[1];
  //         }
  //       }
  //       const saveResult = await saveZipToPublicOutput(response.data, filename);
  //       if (saveResult) {
  //         savedFiles.push({ name: filename, path: saveResult.zipPath, type: 'application/zip' });
  //       }
  //     } else if (response.headers['content-type'].includes('application/json')) {
  //       const jsonResponse = JSON.parse(new TextDecoder().decode(response.data));
  //       if (jsonResponse.xmlFiles) {
  //         for (const [filename, content] of Object.entries(jsonResponse.xmlFiles)) {
  //           const blob = base64ToBlob(content, 'application/xml');
  //           const filePath = await saveResponseToPublicOutput(blob, 'application/xml', filename);
  //           if (filePath) {
  //             savedFiles.push({ name: filename, path: filePath, type: 'application/xml' });
  //           }
  //         }
  //       }
  //       if (jsonResponse.jsonFile) {
  //         const jsonContent = JSON.stringify(jsonResponse.jsonFile);
  //         const filename = `output_${selectedTask}_${new Date().getTime()}.json`;
  //         const filePath = await saveResponseToPublicOutput(jsonContent, 'application/json', filename);
  //         if (filePath) {
  //           savedFiles.push({ name: filename, path: filePath, type: 'application/json' });
  //         }
  //       }
  //       if (jsonResponse.customers) {
  //         setCustomers(jsonResponse.customers);
  //         setOriginalCustomers(jsonResponse.customers);
  //         setIsNewDataAdded(true);
  //       }
  //     } else {
  //       const contentType = response.headers['content-type'] || 'application/octet-stream';
  //       const fileExtension = getFileExtensionFromMimeType(contentType);
  //       let filename = `output_${selectedTask}_${new Date().getTime()}.${fileExtension}`;
  //       const contentDisposition = response.headers['content-disposition'];
  //       if (contentDisposition) {
  //         const filenameMatch = contentDisposition.match(/filename="(.+)"/);
  //         if (filenameMatch) {
  //           filename = filenameMatch[1];
  //         }
  //       }
  //       const filePath = await saveResponseToPublicOutput(response.data, contentType, filename);
  //       if (filePath) {
  //         savedFiles.push({ name: filename, path: filePath, type: contentType });
  //       }
  //     }
      
  //     setDownloadedFiles(savedFiles);
  //     alert('Algorithm executed successfully! Files have been saved to public/output directory.');
      
  //   } catch (error) {
  //     console.error('Error processing task data:', error);
  //     setTaskError('Failed to process task data. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //     handleCloseEsoguModal();
  //   }
  // };

  // const base64ToBlob = (base64, mimeType) => {
  //   const byteCharacters = atob(base64);
  //   const byteArrays = [];
  //   for (let i = 0; i < byteCharacters.length; i += 512) {
  //     const slice = byteCharacters.slice(i, i + 512);
  //     const byteNumbers = new Array(slice.length);
  //     for (let j = 0; j < slice.length; j++) {
  //       byteNumbers[j] = slice.charCodeAt(j);
  //     }
  //     const byteArray = new Uint8Array(byteNumbers);
  //     byteArrays.push(byteArray);
  //   }
  //   return new Blob(byteArrays, { type: mimeType });
  // };

  // const getFileExtensionFromMimeType = (mimeType) => {
  //   const extensions = {
  //     'application/json': 'json',
  //     'application/xml': 'xml',
  //     'application/octet-stream': 'bin',
  //     'text/plain': 'txt'
  //   };
  //   return extensions[mimeType] || 'bin';

  return (
    <Card
      sx={{
        borderRadius: "14px",
        padding: "19px",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
        border: "1px solid #E0E0E0",
        height: "90vh",
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
            variant="h6"
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
            <Tooltip title="Select ESOGU Task Data">
              <IconButton 
                color="primary" 
                onClick={handleOpenEsoguModal}
                sx={{ mr: 1 }}
              >
                <CheckCircleIcon />
              </IconButton>
            </Tooltip>
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
          {downloadedFiles.length > 0 && (
            <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Downloaded Output Files:</Typography>
              <List dense>
                {downloadedFiles.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText primary={file.name} secondary={file.type} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
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

      {/* Scrollable Customer List */}
      <Box sx={{flex: "1 1 auto", overflowY: "auto", padding: "0 10px", scrollbarWidth: "thin", scrollbarColor: "#999 #ddd" }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            mb: 1,
            px: 3,
            py: 1,
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px 8px 0 0',
          }}
        >
          <Box sx={{ width: '5%' }}></Box>
          <Box sx={{ width: '30%', fontWeight: 600, fontSize: '0.75rem', color: '#555' }}>Time Window</Box>
          <Box sx={{ height: '20px', borderRight: '1px solid #ccc', mx: 1 }}></Box>
          <Box sx={{ width: '45%', fontWeight: 600, fontSize: '0.75rem', color: '#555' }}>Customer</Box>
          <Box sx={{ height: '20px', borderRight: '1px solid #ccc', mx: 1 }}></Box>
          <Box sx={{ width: '20%', fontWeight: 600, fontSize: '0.75rem', color: '#555', textAlign: 'right' }}>Amount</Box>
        </Box>

        <List sx={{ paddingRight: "5px" }}>
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer, index) => (
              <ListItem key={customer.id || index} divider sx={{ padding: "6px 0" }}>
                <Box
                  display="flex"
                  alignItems="center"
                  width="100%"
                  sx={{
                    padding: "6px 10px",
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
                  <Checkbox 
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleCustomerSelect(customer.id);
                    }}
                    sx={{ padding: "2px" }}
                    size="small"
                  />
                  <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center" 
                    width="100%"
                    onClick={() => handleCustomerClick(customer)}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", width: '30%', paddingRight: 1 }}>
                      <BlinkingCircle status={customer.status} sx={{ mr: 1, fontSize: "1rem" }} />
                      <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                        {customer.timeWindow || "Any time"}
                      </Typography>
                    </Box>
                    <Box sx={{ height: '24px', borderRight: '1px solid #e0e0e0', mx: 1 }}></Box>
                    <Box sx={{ width: '45%' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        {customer.name}
                        {customer.tasks && customer.tasks.length > 0 && (
                          <Chip 
                            label={`${customer.tasks.length} task${customer.tasks.length > 1 ? 's' : ''}`}
                            size="small"
                            color="primary"
                            sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                          />
                        )}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                        {customer.address?.substring(0, 30)}{customer.address?.length > 30 ? '...' : ''}
                      </Typography>
                    </Box>
                    <Box sx={{ height: '24px', borderRight: '1px solid #e0e0e0', mx: 1 }}></Box>
                    <Box sx={{ width: '20%', textAlign: "right" }}>
                      <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                        {customer.demand} adet
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="textSecondary">
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
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: `3px solid ${statusColors[currentCustomer.status]}`, py: 1.5 }}>
              <Typography variant="subtitle1">Customer Details</Typography>
              <Chip label={currentCustomer.status} size="small" sx={{ backgroundColor: statusColors[currentCustomer.status], color: "#fff", fontWeight: 600, fontSize: '0.7rem' }} />
            </DialogTitle>
            <DialogContent sx={{ mt: 1.5 }}>
              <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
                {currentCustomer.name}
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>📦 Brand:</strong> {currentCustomer.brand}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>📍 Address:</strong> {currentCustomer.address}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>📦 Demand:</strong> {currentCustomer.demand} adet</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>📆 Order Date:</strong> {currentCustomer.orderDate}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>⏱️ Time Window:</strong> {currentCustomer.timeWindow || "Any time"}</Typography>
                </Grid>
                {currentCustomer.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>📝 Notes:</strong> {currentCustomer.notes}</Typography>
                  </Grid>
                )}
                {currentCustomer.tasks && currentCustomer.tasks.length > 0 && (
                  <Grid item xs={12} sx={{ mt: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: '0.85rem' }}>Assigned Tasks</Typography>
                    {currentCustomer.tasks.map((task, index) => (
                      <Box key={task.id || index} sx={{ mb: 0.8, p: 0.8, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                          {task.title}
                          <Chip
                            label={task.priority}
                            size="small"
                            color={task.priority === 'high' ? 'error' : (task.priority === 'medium' ? 'warning' : 'default')}
                            sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                          />
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>{task.description}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem' }}>Due: {task.dueDate}</Typography>
                      </Box>
                    ))}
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDetailModal} size="small">Close</Button>
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                onClick={() => { handleCustomerSelect(currentCustomer.id); closeDetailModal(); }}
              >
                {selectedCustomers.includes(currentCustomer.id) ? "Deselect" : "Select"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add Task Modal */}
      <Modal open={openTaskModal} onClose={() => setOpenTaskModal(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}>Add New Task</Typography>
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
                        return customer ? <Chip key={customerId} label={customer.name} /> : null;
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
                {taskFormErrors.assignedTo && <FormHelperText>{taskFormErrors.assignedTo}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
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
            <Button onClick={() => setOpenTaskModal(false)} sx={{ mr: 1 }}>Cancel</Button>
            <Button variant="contained" onClick={handleTaskSubmit}>Create Task</Button>
          </Box>
        </Box>
      </Modal>

      {/* Add Customer Modal */}
      <Modal open={openCustomerModal} onClose={() => setOpenCustomerModal(false)}>
        <Box sx={{ ...modalStyle, width: 500 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Add New Customer</Typography>
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
                label="Order Date"
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={customerForm.orderDate}
                onChange={(e) => handleCustomerFormChange('orderDate', e.target.value)}
                error={!!customerFormErrors.orderDate}
                helperText={customerFormErrors.orderDate}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Time Window</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  label="Start Time"
                  type="time"
                  value={customerForm.startTime}
                  onChange={(e) => handleCustomerFormChange('startTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  sx={{ mr: 1, flexGrow: 1 }}
                />
                <Typography sx={{ mx: 1 }}>to</Typography>
                <TextField
                  label="End Time"
                  type="time"
                  value={customerForm.endTime}
                  onChange={(e) => handleCustomerFormChange('endTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  sx={{ ml: 1, flexGrow: 1 }}
                />
              </Box>
              {customerFormErrors.timeWindow && (
                <FormHelperText error>{customerFormErrors.timeWindow}</FormHelperText>
              )}
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
            <Button onClick={() => setOpenCustomerModal(false)} sx={{ mr: 1 }}>Cancel</Button>
            <Button variant="contained" onClick={handleCustomerSubmit}>Add Customer</Button>
          </Box>
        </Box>
      </Modal>

      {/* ESOGU Task Selection Modal */}
      <Modal open={openEsoguModal} onClose={handleCloseEsoguModal}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Select ESOGU Task Data
          </Typography>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend">Available Tasks</FormLabel>
            <RadioGroup value={selectedTask} onChange={handleTaskSelection} sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>Clustered Tasks (C)</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['C05', 'C10', 'C20', 'C40', 'C60'].map(task => (
                  <FormControlLabel key={task} value={task} control={<Radio />} label={task} />
                ))}
              </Box>
              <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>Random Tasks (R)</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['R05', 'R10', 'R20', 'R40', 'R60'].map(task => (
                  <FormControlLabel key={task} value={task} control={<Radio />} label={task} />
                ))}
              </Box>
              <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>Random-Clustered Tasks (RC)</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['RC05', 'RC10', 'RC20', 'RC40', 'RC60'].map(task => (
                  <FormControlLabel key={task} value={task} control={<Radio />} label={task} />
                ))}
              </Box>
            </RadioGroup>
          </FormControl>
          {taskError && (
            <Typography color="error" sx={{ mt: 1 }}>{taskError}</Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button onClick={handleCloseEsoguModal} sx={{ mr: 1 }}>Cancel</Button>
            <Button variant="contained" onClick={handleTaskConfirm} disabled={isLoading || !selectedTask}>
              {isLoading ? <CircularProgress size={24} /> : 'Confirm'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Card>
  );
}