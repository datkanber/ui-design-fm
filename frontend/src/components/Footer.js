import React from 'react';
import '../assets/styles/global.css';

export default function Footer({ vehicles = [], chargingStations = [], darkMode }) {
    // Acil durumda olan araçları filtreler Hello
    const urgentVehicles = vehicles.filter(vehicle => 
        Number(vehicle.soc) < 20 || vehicle.velocity === 0 || vehicle.deliveryDeadlineApproaching
    );

    // En yakın şarj istasyonunu döner
    const nearestChargingStation = (vehicle, stations) => {
        if (!stations.length) return 'N/A';
        return stations[0].id;
    };

    // Araç durumuna göre ikon belirler
    const getStatusIcon = (vehicle) => {
        if (Number(vehicle.soc) < 20) return '⚡';
        if (vehicle.velocity === 0) return '🚨';
        if (vehicle.deliveryDeadlineApproaching) return '⏰';
        return '✅';
    };

    // Araç durumuna göre mesaj belirler
    const getStatusMessage = (vehicle) => {
        if (Number(vehicle.soc) < 20) return `⚡ Low Battery - Charge at Station ${nearestChargingStation(vehicle, chargingStations)}`;
        if (vehicle.velocity === 0) return '🚨 Stopped - Requires Assistance';
        if (vehicle.deliveryDeadlineApproaching) return '⏰ Delivery Deadline Approaching';
        return '✅ Normal Operation';
    };

    return (
        <footer className={`footer ${darkMode ? 'dark-mode' : ''}`}>
            <div className="marquee">
                <div className="marquee-content">
                    {urgentVehicles.length > 0 ? (
                        urgentVehicles.map((vehicle, index) => (
                            <span key={index} className={`urgent-text ${Number(vehicle.soc) < 20 ? 'low-battery' : ''}`}>
                                <span className="urgent-icon">{getStatusIcon(vehicle)}</span>
                                ARAÇ ID: {vehicle.name} | STATUS: {getStatusMessage(vehicle)} | 
                                CHARGE: %{vehicle.soc} | PAYLOAD: {vehicle.payload} kg
                            </span>
                        ))
                    ) : (
                        <span className="no-urgent">✅ Tüm araçlar normal çalışıyor.</span>
                    )}
                </div>
            </div>
        </footer>
    );
}
