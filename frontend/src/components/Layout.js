import React, { useState, useEffect } from "react";
import { 
    IconButton, Dialog, DialogTitle, DialogContent, Typography, Card, CardContent, Button,
    CircularProgress, Snackbar, Alert, Box, List, ListItem, ListItemIcon, ListItemText
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CompareIcon from "@mui/icons-material/Compare";
import SettingsIcon from "@mui/icons-material/Settings";
import CustomerPool from "./RouteOptimization/CustomerPool";
import RouteOptimizationMap from "./RouteOptimization/RouteOptimizationMap";
import { ComparisonResults, ComparisonChart } from "./RouteOptimization/MultiAlgorithmComparison";
import OptimizationForm from "./RouteOptimization/OptimizationForm";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DescriptionIcon from "@mui/icons-material/Description";
import RouteDetailPanel from "./RouteDetailPanel"; 
import axios from "axios";

export default function Layout({
    customers,
    vehicles,
    chargingStations,
    orders,
    routeColors,
    plannedRoutes,
    completedRoutes,
    traffic,
    openComparison,
    setOpenComparison,
    comparisonResults,
    runComparison,
    openOptimization,
    setOpenOptimization,
    algorithm,
    setAlgorithm,
    handleSaveParameters,
}) {
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [openRouteDetail, setOpenRouteDetail] = useState(false);
    
    // States for ESOGU task optimization
    const [selectedTask, setSelectedTask] = useState('');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationSuccess, setOptimizationSuccess] = useState(false);
    const [optimizationError, setOptimizationError] = useState('');
    const [downloadedFiles, setDownloadedFiles] = useState([]);
    const [showOptimizationResults, setShowOptimizationResults] = useState(false);

    useEffect(() => {
        // Get selected task from localStorage on component mount
        const storedTask = localStorage.getItem('selectedEsoguTask');
        if (storedTask) {
            setSelectedTask(storedTask);
        }
        
        // Add event listener for task selection events
        const handleTaskSelected = (event) => {
            console.log('Task selected event received:', event.detail.task);
            setSelectedTask(event.detail.task);
        };
        
        // Add event listener
        window.addEventListener('esoguTaskSelected', handleTaskSelected);
        
        // Clean up event listener on component unmount
        return () => {
            window.removeEventListener('esoguTaskSelected', handleTaskSelected);
        };
    }, []);

    const handleRouteClick = (route) => {
        setSelectedRoute(route);
        setOpenRouteDetail(true);
    };
    
    // Helper functions for file handling
    const base64ToBlob = (base64, mimeType) => {
        const byteCharacters = atob(base64);
        const byteArrays = [];
        for (let i = 0; i < byteCharacters.length; i += 512) {
            const slice = byteCharacters.slice(i, i + 512);
            const byteNumbers = new Array(slice.length);
            for (let j = 0; j < slice.length; j++) {
                byteNumbers[j] = slice.charCodeAt(j);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, { type: mimeType });
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

    const getFileExtensionFromMimeType = (mimeType) => {
        const extensions = {
            'application/json': 'json',
            'application/xml': 'xml',
            'application/octet-stream': 'bin',
            'text/plain': 'txt'
        };
        return extensions[mimeType] || 'bin';
    };
    
    // Handle Start Optimization
    const handleStartOptimization = async () => {
        // Check if a task is selected
        if (!selectedTask) {
            alert('Please select an ESOGU task first using the Select ESOGU Task Data button');
            return;
        }

        setIsOptimizing(true);
        setOptimizationError('');
        try {
            // Step 1: Create FormData for file uploads
            const formData = new FormData();
            
            // Step 2: Fetch each XML file and append to FormData
            const filesToFetch = [
                { 
                    path: `/esogu_dataset/Info4Tasks/newesoguv32-${selectedTask.toLowerCase()}-ds1.xml`, 
                    name: `newesoguv32-${selectedTask.toLowerCase()}-ds1.xml` 
                },
                { 
                    path: '/esogu_dataset/Info4Environment/Info4Environment.xml', 
                    name: 'Info4Environment.xml' 
                },
                { 
                    path: '/esogu_dataset/Info4ChargingStation/Info4ChargingStation.xml', 
                    name: 'Info4ChargingStation.xml' 
                },
                { 
                    path: '/esogu_dataset/Info4Vehicle/FC_Info4Vehicle.xml', 
                    name: 'FC_Info4Vehicle.xml' 
                },
                { 
                    path: '/esogu_dataset/Map4Environment/Map4Environment.xml', 
                    name: 'Map4Environment.xml' 
                },
                { 
                    path: '/esogu_dataset/Input4Algorithm/Input.xml', 
                    name: 'Input.xml' 
                }
            ];
            
            // Fetch each file and convert to blob
            for (const file of filesToFetch) {
                try {
                    const response = await fetch(file.path);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch ${file.path}: ${response.statusText}`);
                    }
                    const blob = await response.blob();
                    
                    // Append each file with the field name 'input_files' (matching Python example)
                    formData.append('input_files', blob, file.name);
                } catch (error) {
                    console.error(`Error fetching file ${file.path}:`, error);
                    throw error;
                }
            }
            
            // Add the task type as a form field
            formData.append('taskType', selectedTask);
            
            // Step 3: Send FormData to server
            const response = await axios.post('http://localhost:8000/start_alns', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                responseType: 'arraybuffer' // Important for binary responses
            });
            
            // Step 4: Handle server response with files
            console.log('Server response received');
            const savedFiles = [];
            
            // If response is a ZIP file
            if (response.headers['content-type'] === 'application/zip') {
                // Get filename from Content-Disposition header if available
                let filename = `output_${selectedTask}_${new Date().getTime()}.zip`;
                const contentDisposition = response.headers['content-disposition'];
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                    if (filenameMatch) {
                        filename = filenameMatch[1];
                    }
                }
                
                // Save and extract zip file to public/output
                const saveResult = await saveZipToPublicOutput(response.data, filename);
                
                if (saveResult) {
                    savedFiles.push({
                        name: filename,
                        path: saveResult.zipPath,
                        type: 'application/zip'
                    });
                }
            }
            // If response contains multiple files in JSON format
            else if (response.headers['content-type'].includes('application/json')) {
                const jsonResponse = JSON.parse(new TextDecoder().decode(response.data));
                
                // Process XML files
                if (jsonResponse.xmlFiles) {
                    for (const [filename, content] of Object.entries(jsonResponse.xmlFiles)) {
                        const blob = base64ToBlob(content, 'application/xml');
                        const filePath = await saveResponseToPublicOutput(
                            blob, 
                            'application/xml', 
                            filename
                        );
                        
                        if (filePath) {
                            savedFiles.push({
                                name: filename,
                                path: filePath,
                                type: 'application/xml'
                            });
                        }
                    }
                }
                
                // Process JSON file
                if (jsonResponse.jsonFile) {
                    const jsonContent = JSON.stringify(jsonResponse.jsonFile);
                    const filename = `output_${selectedTask}_${new Date().getTime()}.json`;
                    const filePath = await saveResponseToPublicOutput(
                        jsonContent,
                        'application/json',
                        filename
                    );
                    
                    if (filePath) {
                        savedFiles.push({
                            name: filename,
                            path: filePath,
                            type: 'application/json'
                        });
                    }
                }
            }
            // For binary files directly in the response
            else {
                const contentType = response.headers['content-type'] || 'application/octet-stream';
                const fileExtension = getFileExtensionFromMimeType(contentType);
                
                // Get filename from Content-Disposition header if available
                let filename = `output_${selectedTask}_${new Date().getTime()}.${fileExtension}`;
                const contentDisposition = response.headers['content-disposition'];
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                    if (filenameMatch) {
                        filename = filenameMatch[1];
                    }
                }
                
                // Save file to public/output
                const filePath = await saveResponseToPublicOutput(
                    response.data,
                    contentType,
                    filename
                );
                
                if (filePath) {
                    savedFiles.push({
                        name: filename,
                        path: filePath,
                        type: contentType
                    });
                }
            }
            
            // Update UI with saved files
            setDownloadedFiles(savedFiles);
            setOptimizationSuccess(true);
            setShowOptimizationResults(true);

        } catch (error) {
            console.error('Error during optimization:', error);
            setOptimizationError(error.message || 'Failed to process optimization. Please try again.');
        } finally {
            setIsOptimizing(false);
        }
    };

    const resetTask = () => {
        localStorage.removeItem('selectedEsoguTask');
        setSelectedTask('');
        setDownloadedFiles([]);
        setOptimizationSuccess(false);
        setShowOptimizationResults(false);
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: "16px", padding: "1rem" }}>
            {/* Sol Taraf - Müşteri Havuzu ve İkonlar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* Müşteri Havuzu */}
                <CustomerPool customers={customers} />
                
                {/* Alt Kısım - İkonlar ve Task Info */}
                <Card style={{ padding: "12px", borderRadius: "8px", boxShadow: "0px 2px 4px rgba(0,0,0,0.1)" }}>
                    {/* Selected Task Info */}
                    {selectedTask && (
                        <Box sx={{ mb: 2, p: 1, bgcolor: '#f0f8ff', borderRadius: 1 }}>
                            <Typography height={"20px"} variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Selected ESOGU Task: <span style={{ color: '#1976d2' }}>{selectedTask}</span>
                            </Typography>
                        </Box>
                    )}
                    
                    <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
                        {/* Algoritma Karşılaştırma Butonu */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "15px" }}>
                            <IconButton onClick={() => setOpenComparison(true)} color="primary">
                                <CompareIcon />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: "14px", color: "#555", marginTop: "2px" }}>
                                Algorithm Comparison
                            </Typography>
                        </div>

                        {/* Algoritma Optimizasyon Parametreleri */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <IconButton onClick={() => setOpenOptimization(true)} color="secondary">
                                <SettingsIcon />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: "14px", color: "#555", marginTop: "2px" }}>
                                Optimization Settings
                            </Typography>
                        </div>

                        {/* Start Optimize Butonu */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: "15px" }}>
                            <IconButton 
                                color="success" 
                                onClick={handleStartOptimization}
                                disabled={isOptimizing || !selectedTask}
                                style={{ position: 'relative' }}
                            >
                                {isOptimizing ? 
                                    <CircularProgress size={24} color="inherit" /> : 
                                    <PlayArrowIcon />
                                }
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: "14px", color: "#555", marginTop: "2px" }}>
                                {isOptimizing ? "Processing..." : "Start Optimize"}
                            </Typography>
                        </div>
                    </div>

                    {/* Show optimization results */}
                    {showOptimizationResults && downloadedFiles.length > 0 && (
                        <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2">Optimization Results:</Typography>
                                <Button 
                                    size="small" 
                                    color="secondary" 
                                    onClick={resetTask}
                                    disabled={isOptimizing}
                                >
                                    Reset
                                </Button>
                            </Box>
                            <List dense sx={{ maxHeight: 150, overflowY: 'auto' }}>
                                {downloadedFiles.map((file, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <DescriptionIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={file.name} 
                                            secondary={file.type}
                                            primaryTypographyProps={{ fontSize: '0.85rem' }}
                                            secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </Card>
            </div>

            {/* Sağ Taraf - Harita */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0px", height: "100vh" }}>
                <RouteOptimizationMap
                    vehicles={vehicles}
                    chargingStations={chargingStations}
                    orders={orders}
                    routeColors={routeColors}
                    plannedRoutes={plannedRoutes}
                    completedRoutes={completedRoutes}
                    traffic={traffic}
                    onRouteClick={handleRouteClick}
                />
            </div>

            {/* Algoritma Karşılaştırma Dialog */}
            <Dialog open={openComparison} onClose={() => setOpenComparison(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Typography variant="h6">Sonuç Karşılaştırma</Typography>
                    <IconButton onClick={() => setOpenComparison(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Card>
                        <CardContent>
                            <ComparisonResults results={comparisonResults} />
                            <ComparisonChart results={comparisonResults} />
                            <Button variant="contained" fullWidth onClick={runComparison} style={{ marginTop: "16px" }}>
                                Tekrar Karşılaştır
                            </Button>
                        </CardContent>
                    </Card>
                </DialogContent>
            </Dialog>

            {/* Algoritma Seçimi Dialog */}
            <Dialog open={openOptimization} onClose={() => setOpenOptimization(false)} maxWidth="l" fullWidth>
                <DialogTitle>
                    <Typography variant="h6">Algoritma Seçimi</Typography>
                    <IconButton onClick={() => setOpenOptimization(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <OptimizationForm algorithm={algorithm} setAlgorithm={setAlgorithm} onSave={handleSaveParameters} />
                </DialogContent>
            </Dialog>

            {/* Route Detail Popup */}
            <RouteDetailPanel selectedRoute={selectedRoute} open={openRouteDetail} onClose={() => setOpenRouteDetail(false)} />

            {/* Snackbar notifications for success/error */}
            <Snackbar
                open={optimizationSuccess}
                autoHideDuration={6000}
                onClose={() => setOptimizationSuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="success" onClose={() => setOptimizationSuccess(false)}>
                    Optimization completed successfully! Files saved to output directory.
                </Alert>
            </Snackbar>
            
            <Snackbar
                open={!!optimizationError}
                autoHideDuration={6000}
                onClose={() => setOptimizationError('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="error" onClose={() => setOptimizationError('')}>
                    {optimizationError}
                </Alert>
            </Snackbar>
        </div>
    );
}