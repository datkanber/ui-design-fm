import React, { useState, useEffect } from 'react';
import { Dialog, Button } from '@mui/material';
import OptimizationForm from '../components/OptimizationForm';
import RouteOptimizationMap from '../components/RouteOptimizationMap';
import CustomerPool from '../components/CustomerPool';
import OrderManagement from '../components/OrderManagement';
import { vehicles as staticVehicles } from '../data/vehicles';
import { chargingStations as staticChargingStations } from '../data/chargingStations';
import { orders as staticOrders } from '../data/orders';
import { routes as staticRoutes } from '../data/routes';
import { loadTaskData } from '../services/taskService';
import '../assets/styles/global.css';
import 'leaflet/dist/leaflet.css';

export default function RouteOptimization() {
  const [algorithm, setAlgorithm] = useState('Simulated Annealing');
  const [iterationNumber, setIterationNumber] = useState(100);
  const [initialTemperature, setInitialTemperature] = useState(1000);
  const [alpha, setAlpha] = useState(0.95);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [openOrderManagement, setOpenOrderManagement] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState('');
  const [nodes, setNodes] = useState([]);
  const [chargingStations, setChargingStations] = useState(staticChargingStations);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);

  const routeColors = {
    'Simulated Annealing': 'blue',
    'Tabu Search': 'green',
    'OR-Tools': 'red'
  };

  const plannedRoutes = (staticRoutes[algorithm] || []).map(r => ({ positions: r.path || [] }));
  const completedRoutes = (staticRoutes['Completed'] || []).map(r => ({ positions: r.path || [] }));
  const traffic = (staticRoutes['Traffic'] || []).map(r => ({ positions: r.path || [] }));

  useEffect(() => {
    if (selectedDemand) {
      loadTaskData(selectedDemand)
        .then(data => {
          console.log("Yüklenen XML verisi:", data);
          // Müşteri (Delivery) node'larını dönüştür
          const deliveryNodes = data.customers.map(customer => ({
            id: customer.id,
            name: `Müşteri ${customer.name}`,
            nodeType: 'Delivery',
            type: selectedDemand.substring(0, selectedDemand.includes('RC') ? 2 : 1),
            location: {
              lat: customer.location.lat,
              lng: customer.location.lng
            },
            readyTime: customer.request.readyTime,
            dueDate: customer.request.dueDate,
            serviceTime: customer.request.serviceTime,
            demand: customer.request.quantity,
            weight: customer.request.weight,
            productInfo: {
              id: customer.request.productId,
              name: customer.request.productName
            }
          }));

          // Depo node'larını dönüştür
          const depotNodes = data.depot ? [
            {
              id: data.depot.id,
              name: `Depo ${data.depot.name}`,
              nodeType: 'Entrance',
              type: 'Depot',
              location: {
                lat: data.depot.location.lat,
                lng: data.depot.location.lng
              }
            }
          ] : [];

          // Şarj istasyonu node'larını dönüştür
          const chargingNodes = data.chargingStations.map(station => ({
            id: station.id,
            name: `Şarj İstasyonu ${station.name}`,
            nodeType: 'DepoCharging',
            type: 'Charging',
            location: {
              lat: station.location.lat,
              lng: station.location.lng
            }
          }));

          // Tüm node'ları birleştir
          const allNodes = [...deliveryNodes, ...depotNodes, ...chargingNodes];
          console.log('Yüklenen node\'lar:', allNodes);
          setNodes(allNodes);
          
          // Harita için şarj istasyonlarını güncelle
          if (data.depot) {
            const updatedChargingStations = [
              {
                id: data.depot.id,
                name: `Depo ${data.depot.name}`,
                location: {
                  lat: data.depot.location.lat,
                  lng: data.depot.location.lng
                },
                type: 'depot'
              },
              ...data.chargingStations.map(station => ({
                id: station.id,
                name: `Şarj İstasyonu ${station.name}`,
                location: {
                  lat: station.location.lat,
                  lng: station.location.lng
                },
                type: 'charging'
              }))
            ];
            setChargingStations(updatedChargingStations);
          }
        })
        .catch(error => {
          console.error('XML yükleme hatası:', error);
          setNodes([]);
        });
    } else {
      setNodes([]);
    }
  }, [selectedDemand]);

  const handleDemandChange = (demand) => {
    setSelectedDemand(demand);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    if (customer && customer.location) {
      setMapCenter({
        lat: customer.location.lat,
        lng: customer.location.lng,
        zoom: 15
      });
    }
  };

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <OptimizationForm
            algorithm={algorithm}
            setAlgorithm={setAlgorithm}
            iterationNumber={iterationNumber}
            setIterationNumber={setIterationNumber}
            initialTemperature={initialTemperature}
            setInitialTemperature={setInitialTemperature}
            alpha={alpha}
            setAlpha={setAlpha}
            vehicles={staticVehicles}
            selectedVehicles={selectedVehicles}
            setSelectedVehicles={setSelectedVehicles}
            onDemandChange={handleDemandChange}
          />
        </div>
        <div style={{ flex: 3}}>
          <RouteOptimizationMap
            vehicles={staticVehicles}
            chargingStations={chargingStations}
            routeColors={routeColors}
            orders={staticOrders}
            plannedRoutes={plannedRoutes}
            completedRoutes={completedRoutes}
            traffic={traffic}
            selectedCustomer={selectedCustomer}
            mapCenter={mapCenter}
          />
        </div>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <CustomerPool 
            nodes={nodes}
            selectedDemand={selectedDemand}
            onCustomerSelect={handleCustomerSelect}
          />
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Button variant="contained" color="primary" onClick={() => setOpenOrderManagement(true)}>
              Talep Yönetimini Aç
            </Button>
          </div>
        </div>
      </div>
      
      <Dialog open={openOrderManagement} onClose={() => setOpenOrderManagement(false)} maxWidth="sm" fullWidth>
        <OrderManagement />
      </Dialog>
    </div>
  );
}
