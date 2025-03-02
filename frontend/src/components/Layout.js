import React, { useState } from "react";
import { IconButton, Dialog, DialogTitle, DialogContent, Typography, Card, CardContent, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CompareIcon from "@mui/icons-material/Compare";
import SettingsIcon from "@mui/icons-material/Settings";
import CustomerPool from "./CustomerPool";
import RouteOptimizationMap from "./RouteOptimizationMap";
import { ComparisonResults, ComparisonChart } from "./MultiAlgorithmComparison";
import OptimizationForm from "./OptimizationForm";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RouteDetailPanel from "./RouteDetailPanel"; // ✅ Rota detay bileşeni import edildi

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

    const handleRouteClick = (route) => {
        setSelectedRoute(route);
        setOpenRouteDetail(true);
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "16px", padding: "1rem" }}>
            {/* Sol Taraf - Müşteri Havuzu ve İkonlar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* Müşteri Havuzu */}
                <CustomerPool customers={customers} />
                {/* Alt Kısım - İkonlar */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", background: "#fff", padding: "8px", borderRadius: "8px", boxShadow: "0px 2px 4px rgba(0,0,0,0.1)" }}>
                    <div style={{ display: "flex", gap: "20px" }}>
                        {/* Algoritma Karşılaştırma Butonu */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <IconButton onClick={() => setOpenComparison(true)} color="primary">
                                <CompareIcon />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>Algorithm Comparison</Typography>
                        </div>

                        {/* Algoritma Optimizasyon Parametreleri */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <IconButton onClick={() => setOpenOptimization(true)} color="secondary">
                                <SettingsIcon />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>Optimization Parameters</Typography>
                        </div>

                        {/* Start Optimize Butonu */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <IconButton color="success">
                                <PlayArrowIcon />
                            </IconButton>
                            <Typography variant="caption" style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>Start Optimize</Typography>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sağ Taraf - Harita */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <RouteOptimizationMap
                    vehicles={vehicles}
                    chargingStations={chargingStations}
                    orders={orders}
                    routeColors={routeColors}
                    plannedRoutes={plannedRoutes}
                    completedRoutes={completedRoutes}
                    traffic={traffic}
                    onRouteClick={handleRouteClick} // ✅ Rota tıklama event'i ekledik
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
            <Dialog open={openOptimization} onClose={() => setOpenOptimization(false)} maxWidth="sm" fullWidth>
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

            {/* 📌 Route Detail Popup (Yeni Eklendi) */}
            <RouteDetailPanel selectedRoute={selectedRoute} open={openRouteDetail} onClose={() => setOpenRouteDetail(false)} />
        </div>
    );
}