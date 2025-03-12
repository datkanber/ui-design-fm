import React, { useState, useEffect } from "react";
import { 
    IconButton, Dialog, DialogTitle, DialogContent, Typography, Card, CardContent, Button,
    CircularProgress, Snackbar, Alert, Box, List, ListItem, ListItemIcon, ListItemText,
    Tabs, Tab, Paper
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CompareIcon from "@mui/icons-material/Compare";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete"; 
import MapIcon from "@mui/icons-material/Map";
import CustomerPool from "./RouteOptimization/CustomerPool";
import RouteOptimizationMap from "./RouteOptimization/RouteOptimizationMap";
import RouteMapVisualizer from "./RouteOptimization/RouteMapVisualizer";
import { ComparisonResults, ComparisonChart } from "./RouteOptimization/MultiAlgorithmComparison";
import OptimizationForm from "./RouteOptimization/OptimizationForm";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DescriptionIcon from "@mui/icons-material/Description";
import RouteDetailPanel from "./RouteDetailPanel"; 
import axios from "axios";
import { parseRouteXML } from '../utils/xmlParser';
import RouteAnalysisDashboard from './RouteOptimization/RouteAnalysisDashboard';

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
    const [isClearing, setIsClearing] = useState(false);
    const [clearSuccess, setClearSuccess] = useState(false);
    const [route4VehicleUrl, setRoute4VehicleUrl] = useState(null);
    const [viewMode, setViewMode] = useState("normal"); // normal veya route4vehicle
    const [responseFiles, setResponseFiles] = useState([]);
    const [route4PlanUrl, setRoute4PlanUrl] = useState(null);
    const [routePlanData, setRoutePlanData] = useState(null);
    const [loadingPlanData, setLoadingPlanData] = useState(false);
    const [planDataError, setPlanDataError] = useState(null);
    // ESOGU task from localStorage and event listener
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

    // Route click handler
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
            // Step 0: Clear output directory first
            try {
                await axios.post('http://localhost:3001/clear-output');
                console.log('Output directory cleared successfully');
            } catch (clearError) {
                console.error('Error clearing output directory:', clearError);
                // Continue with optimization even if clearing fails
            }
            
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
                    
                    // ZIP dosyası extract edildikten sonra içinde Route4Vehicle.json dosyasını arayalım
                    try {
                        console.log('Checking for Route4Vehicle.json in extracted files');
                        // Kısa bir süre bekleyelim, zip dosyasının çıkarılması için
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        // Çıkarılan dosyaları listeleyen endpoint çağrısı
                        const extractedFilesResponse = await axios.get('http://localhost:3001/list-extracted-files');
                        const extractedFiles = extractedFilesResponse.data.files;
                        setResponseFiles(extractedFiles);
                        console.log('Extracted files:', extractedFiles);
                        console.log('Response files:', responseFiles);
                        // RML/Route4Vehicle.json dosyasını bul
                        const results_excel = extractedFiles.find(filePath =>
                            filePath.includes('.xlsx')   
                        );
                        
                        const route4VehiclePath = extractedFiles.find(filePath => 
                            filePath.includes('Route4Vehicle.json')
                        );
                        const route4PlanPath = extractedFiles.find(filePath =>
                            filePath.includes('Route4Plan.xml')
                        );
                        const route4SimPath = extractedFiles.find(filePath =>
                            filePath.includes('Route4Sim.xml')
                        );
                        if (results_excel) {
                            console.log('Found results.xlsx in extracted files:', results_excel);
                            // Bu dosyayı da savedFiles listesine ekleyelim
                            const baseUrl = window.location.origin;
                            const url = `${baseUrl}${results_excel}`;
                            console.log('Results Excel URL:', url);
                            console.log('Base URL:', baseUrl);
                            savedFiles.push({
                                name: 'results.xlsx',
                                path: results_excel,
                                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                            });
                        }    
                        
                        
                        if (route4VehiclePath) {
                            console.log('Found Route4Vehicle.json in extracted files:', route4VehiclePath);
                            // Bu dosyayı da savedFiles listesine ekleyelim
                            const baseUrl = window.location.origin;
                            const url = `${baseUrl}${route4VehiclePath}`;
                            console.log('Route4Vehicle URL:', url);
                            console.log('Base URL:', baseUrl);

                            setRoute4VehicleUrl(url);
                            
                            savedFiles.push({
                                name: 'Route4Vehicle.json',
                                path: route4VehiclePath,
                                type: 'application/json'
                            });
                            
                        } 
                        if (route4PlanPath) {
                            console.log('Found Route4Plan.xml in extracted files:', route4PlanPath);
                            // Bu dosyayı da savedFiles listesine ekleyelim
                            const baseUrl = window.location.origin;
                            const url = `${baseUrl}${route4PlanPath}`;
                            console.log('Route4Plan URL:', url);

                            setRoute4PlanUrl(url);  // Route4Plan.xml URL'sini set et
                            
                            savedFiles.push({
                                name: 'Route4Plan.xml',
                                path: route4PlanPath,
                                type: 'application/xml'
                            });
                        }
                        if (route4SimPath) {
                            console.log('Found Route4Sim.xml in extracted files:', route4SimPath);
                            // Bu dosyayı da savedFiles listesine ekleyelim
                            const baseUrl = window.location.origin;
                            const url = `${baseUrl}${route4SimPath}`;
                            console.log('Route4Sim URL:', url);
                            console.log('Base URL:', baseUrl);

                            savedFiles.push({
                                name: 'Route4Sim.xml',
                                path: route4SimPath,
                                type: 'application/xml'
                            });
                        }
                        console.log('Saved files:', savedFiles);
                        
                    } catch (error) {
                        console.error('Error checking for Route4Vehicle.json in extracted files:', error);
                    }
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

    // Reset task handler
    const resetTask = () => {
        localStorage.removeItem('selectedEsoguTask');
        setSelectedTask('');
        setDownloadedFiles([]);
        setOptimizationSuccess(false);
        setShowOptimizationResults(false);
    };

    // Delete files handler
    const handleDeleteFiles = async () => {
        setIsClearing(true);
        try {
            await axios.post('http://localhost:3001/clear-output');
            console.log('Output directory cleared successfully');
            setDownloadedFiles([]);
            setShowOptimizationResults(false);
            setClearSuccess(true);
            // Route4Vehicle URL'yi ve Route4Plan URL'yi temizle
            setRoute4VehicleUrl(null);
            setRoute4PlanUrl(null);  // Bu satırı ekleyin
            setRoutePlanData(null);  // Analiz verilerini de temizle
        } catch (error) {
            console.error('Error clearing output directory:', error);
            setOptimizationError('Failed to clear output directory');
        } finally {
            setIsClearing(false);
        }
    };

    // Route4Plan.xml Dosyasını Yükleme ve İşleme
    useEffect(() => {
        const fetchRouteData = async () => {
            if (!route4PlanUrl) return;
            
            setLoadingPlanData(true);
            setPlanDataError(null);
            
            try {
                const data = await parseRouteXML(route4PlanUrl);
                console.log("Ayrışan data :", data)
                setRoutePlanData(data);
            } catch (error) {
                console.error("Failed to parse route plan XML:", error);
                setPlanDataError("XML dosyası ayrıştırılamadı");
            } finally {
                setLoadingPlanData(false);
            }
        };
        
        fetchRouteData();
    }, [route4PlanUrl]);

    // Main render
    return (
        <div style={{ 
            display: "grid", 
            gridTemplateColumns: "2fr 3fr", 
            gap: "16px", 
            padding: "1rem",
            height: "calc(100vh - 32px)", // Navbar alanı için biraz boşluk bırak
            overflow: "hidden" // Taşmaları engelle
        }}>
            {/* Sol Taraf - Müşteri Havuzu ve İkonlar */}
            <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                height: "100%", // Sol kolonun tamamını kapla
                overflow: "hidden" // Taşmaları engelle
            }}>
                {/* Müşteri Havuzu - Esnek yükseklik */}
                <div style={{ 
                    flex: "1 1 auto", 
                    overflow: "auto", 
                    marginBottom: "16px" 
                }}>
                    <CustomerPool customers={customers} />
                </div>
                
                {/* Alt Kısım - İkonlar ve Task Info - Sabit yükseklik */}
                <Card style={{ 
                    padding: "12px", 
                    borderRadius: "8px", 
                    boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                    flex: "0 0 auto" // Sabit yükseklik, sıkıştırılmaz
                }}>
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
                        
                        {/* Delete output files */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: "15px" }}>
                            <IconButton 
                                color="error" 
                                onClick={handleDeleteFiles}
                                disabled={isClearing || downloadedFiles.length === 0}
                                style={{ position: 'relative' }}
                            >
                                {isClearing ? 
                                    <CircularProgress size={24} color="inherit" /> : 
                                    <DeleteIcon />
                                }
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: "14px", color: "#555", marginTop: "2px" }}>
                                {isClearing ? "Clearing..." : "Clear Output"}
                            </Typography>
                        </div>
                        
                        {/* Rota görüntüleme butonu - Route4Vehicle.json varsa aktif */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: "15px" }}>
                            <IconButton 
                                color="info" 
                                onClick={() => setViewMode(viewMode === "normal" ? "route4vehicle" : "normal")}
                                disabled={!route4VehicleUrl}
                                style={{ position: 'relative' }}
                            >
                                <MapIcon />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: "14px", color: "#555", marginTop: "2px" }}>
                                {viewMode === "normal" ? "Show Route Map" : "Show Normal Map"}
                            </Typography>
                        </div>
                    </div>

                    {/* Show optimization results and debug info */}
                    {showOptimizationResults && downloadedFiles.length > 0 && (
                        <Box sx={{ 
                            mt: 3, 
                            p: 2, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 1,
                            maxHeight: '200px', // Max yükseklik belirle
                            overflowY: 'auto' // İçerik fazla olursa scroll ekle
                        }}>
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
                            
                            {/* File list */}
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
                            
                            {/* Debug bilgisi */}
                            <Box sx={{ mt: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                <Typography variant="caption" sx={{ display: 'block' }}>
                                    <strong>Debug:</strong> Route4Vehicle URL: {route4VehicleUrl ? route4VehicleUrl : 'Not found'}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block' }}>
                                    <strong>Button state:</strong> {!route4VehicleUrl ? 'Disabled' : 'Enabled'}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Card>
            </div>

            {/* Sağ Taraf - Harita */}
            <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                height: "100%", // Tüm yüksekliği kapla
                overflow: "hidden" // Taşmaları engelle
            }}>
                {/* Harita - Küçültülmüş yükseklik */}
                <div style={{ 
                    flex: "1 1 auto", 
                    minHeight: 0 
                }}>
                    {viewMode === "normal" ? (
                        <RouteOptimizationMap
                            vehicles={vehicles}
                            chargingStations={chargingStations}
                            orders={orders}
                            routeColors={routeColors}
                            plannedRoutes={plannedRoutes}
                            completedRoutes={completedRoutes}
                            traffic={traffic}
                            onRouteClick={handleRouteClick}
                            viewMode={viewMode}
                            route4VehicleUrl={route4VehicleUrl}
                        />
                    ) : (
                        route4VehicleUrl ? (
                            <RouteMapVisualizer fileUrl={route4VehicleUrl} />
                        ) : (
                            <Paper elevation={3} sx={{ 
                                height: "100%", // Tüm yüksekliği kullan
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                borderRadius: "12px"
                            }}>
                                <Typography variant="h6" color="textSecondary">
                                    Route4Vehicle.json file not found in results.
                                </Typography>
                            </Paper>
                        )
                    )}
                </div>
                
                {/* Yeni: Analiz Dashboard - Sabit yükseklik */}
                {(route4PlanUrl || routePlanData) && (
                    <div style={{ 
                        flex: "0 0 auto", 
                        marginTop: "16px",
                        maxHeight: "300px",
                        overflowY: "auto"
                    }}>
                        <RouteAnalysisDashboard 
                            routeData={routePlanData} 
                            loading={loadingPlanData} 
                            error={planDataError} 
                        />
                    </div>
                )}
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
            
            {/* Yeni: Temizleme işlemi için bildirim */}
            <Snackbar
                open={clearSuccess}
                autoHideDuration={3000}
                onClose={() => setClearSuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="info" onClose={() => setClearSuccess(false)}>
                    Output directory cleared successfully
                </Alert>
            </Snackbar>
        </div>
    );
}