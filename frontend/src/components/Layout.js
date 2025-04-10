import React, { useState, useEffect } from "react";
import { 
    IconButton, Dialog, DialogTitle, DialogContent, Typography, Card, CardContent, Button,
    CircularProgress, Snackbar, Alert, Box, List, ListItem, ListItemIcon, ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CompareIcon from "@mui/icons-material/Compare";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete"; 
import MapIcon from "@mui/icons-material/Map";
import CustomerPool from "./RouteOptimization/CustomerPool";
import RouteOptimizationMap from "./RouteOptimization/RouteOptimizationMap";
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
    const [route4PlanUrl, setRoute4PlanUrl] = useState(null);
    const [routePlanData, setRoutePlanData] = useState(null);
    const [loadingPlanData, setLoadingPlanData] = useState(false);
    const [planDataError, setPlanDataError] = useState(null);
    // State for scenario selection
    const [availableScenarios, setAvailableScenarios] = useState([]);
    const [setSelectedScenario] = useState(null); // Add this line to fix the error
    const [processingScenario, setProcessingScenario] = useState(null);
    const [processedScenarios, setProcessedScenarios] = useState([]);
    const [scenarioProgress, setScenarioProgress] = useState({ current: 0, total: 0 });
    const [setShowScenarioSelector] = useState(false);
    // ESOGU task and route data persistence
    useEffect(() => {

        // Get selected task from localStorage on component mount
        const storedTask = localStorage.getItem('selectedEsoguTask');
        if (storedTask) {
            setSelectedTask(storedTask);
        }
        
        // Get route4VehicleUrl from localStorage
        const storedRoute4VehicleUrl = localStorage.getItem('route4VehicleUrl');
        if (storedRoute4VehicleUrl) {
            setRoute4VehicleUrl(storedRoute4VehicleUrl);
        }
        
        // Get route4PlanUrl from localStorage
        const storedRoute4PlanUrl = localStorage.getItem('route4PlanUrl');
        if (storedRoute4PlanUrl) {
            setRoute4PlanUrl(storedRoute4PlanUrl);
        }
        
        // Get downloadedFiles from localStorage
        try {
            const storedDownloadedFiles = localStorage.getItem('downloadedFiles');
            if (storedDownloadedFiles) {
                setDownloadedFiles(JSON.parse(storedDownloadedFiles));
                setShowOptimizationResults(true);
            }
        } catch (error) {
            console.error('Error parsing downloadedFiles from localStorage:', error);
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

    // Save route4VehicleUrl to localStorage when it changes
    useEffect(() => {
        if (route4VehicleUrl) {
            localStorage.setItem('route4VehicleUrl', route4VehicleUrl);
        } else {
            localStorage.removeItem('route4VehicleUrl');
        }
    }, [route4VehicleUrl]);

    // Save route4PlanUrl to localStorage when it changes
    useEffect(() => {
        if (route4PlanUrl) {
            localStorage.setItem('route4PlanUrl', route4PlanUrl);
        } else {
            localStorage.removeItem('route4PlanUrl');
        }
    }, [route4PlanUrl]);

    // Save downloadedFiles to localStorage when they change
    useEffect(() => {
        if (downloadedFiles.length > 0) {
            localStorage.setItem('downloadedFiles', JSON.stringify(downloadedFiles));
        } else {
            localStorage.removeItem('downloadedFiles');
        }
    }, [downloadedFiles]);

    // Verify file existence on component mount
    useEffect(() => {
        const checkFileExistence = async () => {
            if (route4VehicleUrl) {
                try {
                    // Check if file exists with HEAD request
                    await axios.head(route4VehicleUrl);
                    console.log('Route4Vehicle file exists');
                } catch (error) {
                    console.warn('Route4Vehicle file does not exist:', error);
                    // If file doesn't exist, clear the URL from state and localStorage
                    setRoute4VehicleUrl(null);
                    localStorage.removeItem('route4VehicleUrl');
                }
            }
            
            if (route4PlanUrl) {
                try {
                    await axios.head(route4PlanUrl);
                    console.log('Route4Plan file exists');
                } catch (error) {
                    console.warn('Route4Plan file does not exist:', error);
                    setRoute4PlanUrl(null);
                    localStorage.removeItem('route4PlanUrl');
                }
            }
        };
        
        // Don't run on first render, only when the component updates
        if (route4VehicleUrl || route4PlanUrl) {
            checkFileExistence();
        }
    }, [route4PlanUrl, route4VehicleUrl]);

    // Load available scenarios from localStorage
    useEffect(() => {
        const loadScenarios = () => {
            try {
                const savedScenarios = localStorage.getItem('optimizationScenarios');
                if (savedScenarios) {
                    const parsedData = JSON.parse(savedScenarios);
                    // Flatten into a single array of all scenarios
                    const allScenarios = Object.values(parsedData).flat();
                    setAvailableScenarios(allScenarios);
                    
                    // If scenarios exist, show the selector
                    setShowScenarioSelector(allScenarios.length > 0);
                    
                    // If there's exactly one scenario, select it by default
                    if (allScenarios.length === 1) {
                        setSelectedScenario(allScenarios[0]);
                    }
                }
            } catch (error) {
                console.error('Error loading scenarios:', error);
            }
        };
        
        loadScenarios();
    }, [setSelectedScenario, setShowScenarioSelector]);
    
    // Get the endpoint URL based on algorithm
    const getAlgorithmEndpoint = (algorithm) => {
        switch (algorithm) {
            case 'ALNS':
                return 'http://31.141.247.181:8003/start_alns';
            case 'SA':
                return 'http://localhost:8000/start_sa';
            case 'TS':
                return 'http://localhost:8000/start_ts';
            case 'OR':
            default:
                return 'http://localhost:8000/start_ortools';
        }
    };

    // Route click handler
    const handleRouteClick = (route) => {
        setSelectedRoute(route);
        setOpenRouteDetail(true);
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
    
    // Process a single scenario
    const processScenario = async (scenario) => {
        try {
            setProcessingScenario(scenario);
            
            // Create FormData for file uploads
            const formData = new FormData();
            
            // Fetch each XML file and append to FormData
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
                    path: '/esogu_dataset/Info4Vehicle/Info4Vehicle.xml', 
                    name: 'Info4Vehicle.xml' 
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
                const response = await fetch(file.path);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${file.path}: ${response.statusText}`);
                }
                const blob = await response.blob();
                
                // Append each file with the field name 'input_files'
                formData.append('input_files', blob, file.name);
            }
            
            // Add the task type as a form field
            formData.append('taskType', selectedTask);
            
            // Add scenario parameters to the form data
            Object.entries(scenario.parameters).forEach(([key, value]) => {
                formData.append(`param_${key}`, value);
            });
            
            // Add algorithm type and other scenario settings
            formData.append('algorithmType', scenario.algorithm);
            formData.append('objectiveFunction', scenario.objectiveFunction);
            formData.append('chargeStrategy', scenario.chargeStrategy);
            
            // Choose the endpoint based on the scenario algorithm
            const endpoint = getAlgorithmEndpoint(scenario.algorithm);
            
            console.log(`Processing scenario: ${scenario.algorithm} - ${scenario.objectiveFunction} to endpoint: ${endpoint}`);
            
            // Send FormData to server with the selected algorithm's endpoint
            const response = await axios.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                responseType: 'arraybuffer' // Important for binary responses
            });
            
            // If response is a ZIP file
            if (response.headers['content-type'] === 'application/zip') {
                // Get filename from Content-Disposition header if available
                let filename = `output_${selectedTask}_${scenario.algorithm}_${new Date().getTime()}.zip`;
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
                    // Process the extracted files
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    const extractedFilesResponse = await axios.get('http://localhost:3001/list-extracted-files');
                    const extractedFiles = extractedFilesResponse.data.files;
                    
                    // Find important files in the extracted files
                    const route4VehiclePath = extractedFiles.find(filePath => filePath.includes('Route4Vehicle.json'));
                    const route4PlanPath = extractedFiles.find(filePath => filePath.includes('Route4Plan.xml'));
                    
                    // Set the file URLs if found
                    if (route4VehiclePath) {
                        const baseUrl = window.location.origin;
                        const url = `${baseUrl}${route4VehiclePath}`;
                        setRoute4VehicleUrl(url);
                    }
                    
                    if (route4PlanPath) {
                        const baseUrl = window.location.origin;
                        const url = `${baseUrl}${route4PlanPath}`;
                        setRoute4PlanUrl(url);
                    }
                    
                    // Add scenario to processed scenarios
                    setProcessedScenarios(prev => [...prev, { 
                        ...scenario,
                        processingTime: new Date(),
                        result: 'success',
                        files: extractedFiles.map(path => ({
                            path,
                            name: path.split('/').pop(),
                            type: path.endsWith('.json') 
                                ? 'application/json' 
                                : path.endsWith('.xml') 
                                    ? 'application/xml' 
                                    : 'application/octet-stream'
                        }))
                    }]);
                    
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error(`Error processing scenario ${scenario.algorithm}:`, error);
            setProcessedScenarios(prev => [...prev, { 
                ...scenario,
                processingTime: new Date(),
                result: 'error',
                errorMessage: error.message
            }]);
            return false;
        }
    };

    // Handle Start Optimization - Updated to process all scenarios
    const handleStartOptimization = async () => {
        // Check if a task is selected
        if (!selectedTask) {
            alert('Please select an ESOGU task first using the Select ESOGU Task Data button');
            return;
        }
        
        // Check if there are scenarios available
        if (availableScenarios.length === 0) {
            alert('Please create optimization scenarios first using the Optimization Settings button');
            return;
        }

        setIsOptimizing(true);
        setOptimizationError('');
        setProcessedScenarios([]);
        
        try {
            // Clear output directory first
            await axios.post('http://localhost:3001/clear-output');
            console.log('Output directory cleared successfully');
            
            // Process each scenario one at a time
            const totalScenarios = availableScenarios.length;
            setScenarioProgress({ current: 0, total: totalScenarios });
            
            let hasSuccessfulScenario = false;
            
            for (let i = 0; i < totalScenarios; i++) {
                const scenario = availableScenarios[i];
                setScenarioProgress({ current: i + 1, total: totalScenarios });
                
                const success = await processScenario(scenario);
                if (success) {
                    hasSuccessfulScenario = true;
                }
                
                // Add a small delay between processing scenarios
                if (i < totalScenarios - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            // Show success message if at least one scenario was successful
            if (hasSuccessfulScenario) {
                setOptimizationSuccess(true);
                setShowOptimizationResults(true);
            } else {
                setOptimizationError('No scenarios were successfully processed. Please check the console for errors.');
            }

        } catch (error) {
            console.error('Error during optimization:', error);
            setOptimizationError(error.message || 'Failed to process optimization. Please try again.');
        } finally {
            setIsOptimizing(false);
            setProcessingScenario(null);
        }
    };

    // Reset task handler
    const resetTask = () => {
        localStorage.removeItem('selectedEsoguTask');
        localStorage.removeItem('route4VehicleUrl');
        localStorage.removeItem('route4PlanUrl');
        localStorage.removeItem('downloadedFiles');
        setSelectedTask('');
        setDownloadedFiles([]);
        setOptimizationSuccess(false);
        setShowOptimizationResults(false);
        setRoute4VehicleUrl(null);
        setRoute4PlanUrl(null);
        setRoutePlanData(null);
    };

    const printScenarios = () => {
        const scenarios = localStorage.getItem('optimizationScenarios');
        console.log("Senaryolar :", scenarios);
    };

    // Delete files handler
    const handleDeleteFiles = async () => {
        setIsClearing(true);
        try {
            await axios.post('http://localhost:3001/clear-output');
            console.log('Output directory cleared successfully');
            
            // Clear localStorage
            localStorage.removeItem('route4VehicleUrl');
            localStorage.removeItem('route4PlanUrl');
            localStorage.removeItem('downloadedFiles');
            
            // Clear component state
            setDownloadedFiles([]);
            setShowOptimizationResults(false);
            setRoute4VehicleUrl(null);
            setRoute4PlanUrl(null);
            setRoutePlanData(null);
            setClearSuccess(true);
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
                    
                    {/* Scenarios Info - Show how many scenarios will be processed */}
                    {availableScenarios.length > 0 && (
                        <Box sx={{ mb: 2, p: 1, bgcolor: '#fff4e5', borderRadius: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                                Available Scenarios: <span style={{ color: '#ed6c02', fontWeight: 'bold' }}>{availableScenarios.length}</span>
                                {isOptimizing && processingScenario && (
                                    <span style={{ marginLeft: '10px', color: '#1976d2' }}>
                                        Processing: {scenarioProgress.current}/{scenarioProgress.total} - {processingScenario.algorithm}
                                    </span>
                                )}
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

                        {/* Start Optimization Button - Updated text to show it will run all scenarios */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: "15px" }}>
                            <IconButton 
                                color="success" 
                                onClick={handleStartOptimization}
                                disabled={isOptimizing || !selectedTask || availableScenarios.length === 0}
                                style={{ position: 'relative' }}
                            >
                                {isOptimizing ? 
                                    <CircularProgress size={24} color="inherit" /> : 
                                    <PlayArrowIcon />
                                }
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: "14px", color: "#555", marginTop: "2px" }}>
                                {isOptimizing ? `Processing ${scenarioProgress.current}/${scenarioProgress.total}` : "Run All Scenarios"}
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
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: "15px" }}>
                            <IconButton 
                                color="info" 
                                onClick={printScenarios}
                                style={{ position: 'relative' }}
                            >
                                <MapIcon />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: "14px", color: "#555", marginTop: "2px" }}>
                                Console Log
                            </Typography>
                        </div>
                    </div>

                    {/* Show processed scenarios results */}
                    {processedScenarios.length > 0 && (
                        <Box sx={{ 
                            mt: 3, 
                            p: 2, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 1,
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Processed Scenarios:
                            </Typography>
                            
                            <List dense disablePadding>
                                {processedScenarios.map((scenario, index) => (
                                    <ListItem 
                                        key={index} 
                                        sx={{ 
                                            mb: 0.5, 
                                            py: 0.5,
                                            bgcolor: scenario.result === 'success' ? '#f0fff0' : '#fff0f0',
                                            borderRadius: 1
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2">
                                                    <strong>{scenario.algorithm}</strong> - {scenario.objectiveFunction}
                                                </Typography>
                                            }
                                            secondary={
                                                scenario.result === 'success' 
                                                    ? `Success (${scenario.files?.length || 0} files)` 
                                                    : `Error: ${scenario.errorMessage || 'Processing failed'}`
                                            }
                                            primaryTypographyProps={{ fontSize: '0.85rem' }}
                                            secondaryTypographyProps={{ 
                                                fontSize: '0.75rem',
                                                color: scenario.result === 'success' ? 'green' : 'error'
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

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
            <Dialog open={openOptimization} onClose={() => setOpenOptimization(false)} maxWidth="lg" fullWidth>
                <DialogContent>
                    <OptimizationForm onClose={() => setOpenOptimization(false)} />
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