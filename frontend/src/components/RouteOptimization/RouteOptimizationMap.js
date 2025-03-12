import React, { useState, useEffect, useRef } from "react";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  LayersControl, 
  LayerGroup, 
  Polyline,
  useMap
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "../../assets/styles/global.css";
import arrowRight from "../../assets/icons/arrow_right.png";  
import arrowLeft from "../../assets/icons/arrow_left.png";    
import arrowUp from "../../assets/icons/arrow_up.png";        
import arrowDown from "../../assets/icons/arrow_down.png";    
import vehicleIconImg from '../../assets/icons/vehicle.png';
import stationIconImg from "../../assets/icons/station.png";  
import orderIconImg from "../../assets/icons/order.png";
import depotIconImg from '../../assets/icons/depot.png';
import deliveryIconImg from '../../assets/icons/order2.png';

// Harita sınırlarını otomatik ayarlayan bileşen
function MapBoundsUpdater({ points }) {
  const map = useMap();
  
  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, points]);
  
  return null;
}

// Ana bileşen
export default function RouteOptimizationMap({ 
  vehicles, 
  chargingStations, 
  routeColors, 
  orders, 
  plannedRoutes, 
  completedRoutes, 
  traffic, 
  onRouteClick,
  viewMode,
  route4VehicleUrl
}) {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allPoints, setAllPoints] = useState([]);
  
  // İkon tanımlamaları
  const vehicleIcon = new L.Icon({ 
    iconUrl: vehicleIconImg, 
    iconSize: [32, 32], 
    iconAnchor: [16, 32], 
    popupAnchor: [0, -32] 
  });
  
  const stationIcon = new L.Icon({ 
    iconUrl: stationIconImg, 
    iconSize: [24, 24], 
    iconAnchor: [12, 24], 
    popupAnchor: [0, -24] 
  });
  
  const orderIcon = new L.Icon({ 
    iconUrl: orderIconImg, 
    iconSize: [28, 28], 
    iconAnchor: [14, 28], 
    popupAnchor: [0, -28] 
  });

  const depotIcon = new L.Icon({
    iconUrl: depotIconImg,
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25]
  });

  const deliveryIcon = new L.Icon({
    iconUrl: deliveryIconImg,
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25]
  });

  // Rota veri yükleme fonksiyonu
  useEffect(() => {
    if (viewMode === "route4vehicle" && route4VehicleUrl) {
      const fetchRouteData = async () => {
        try {
          setLoading(true);
          console.log("Dosya yükleniyor:", route4VehicleUrl);
          
          const response = await axios.get(route4VehicleUrl);
          console.log("Dosya başarıyla yüklendi:", response.status);
          
          if (!response.data) {
            throw new Error("Yanıt verisi boş");
          }
          
          setRouteData(response.data);
          
          // Tüm noktaları toplama
          const points = extractAllPoints(response.data);
          setAllPoints(points);
          
          setLoading(false);
        } catch (err) {
          console.error("Rota verileri yüklenemedi:", err);
          setError(`Rota verileri yüklenemedi: ${err.message}`);
          setLoading(false);
        }
      };
      
      fetchRouteData();
    }
  }, [viewMode, route4VehicleUrl]);

  // Tüm noktaları toplayan yardımcı fonksiyon
  const extractAllPoints = (data) => {
    let points = [];
    if (!data || !data.routes) return points;
    
    data.routes.forEach(route => {
      // Başlangıç noktası
      if (route.start_point && route.start_point.location) {
        const { latitude, longitude } = route.start_point.location;
        points.push([latitude, longitude]);
      }
      
      // Waypoints
      if (route.start_point && route.start_point.waypoints) {
        route.start_point.waypoints.forEach(wp => {
          if (wp.location) {
            points.push([wp.location.latitude, wp.location.longitude]);
          }
        });
      }
      
      // Teslimat noktaları
      if (route.delivery_points) {
        route.delivery_points.forEach(dp => {
          if (dp.location) {
            points.push([dp.location.latitude, dp.location.longitude]);
          }
          
          // Teslimat waypoints
          if (dp.waypoints) {
            dp.waypoints.forEach(wp => {
              if (wp.location) {
                points.push([wp.location.latitude, wp.location.longitude]);
              }
            });
          }
        });
      }
      
      // Bitiş noktası
      if (route.end_point && route.end_point.location) {
        const { latitude, longitude } = route.end_point.location;
        points.push([latitude, longitude]);
      }
      
      // Bitiş waypoints
      if (route.end_point && route.end_point.waypoints) {
        route.end_point.waypoints.forEach(wp => {
          if (wp.location) {
            points.push([wp.location.latitude, wp.location.longitude]);
          }
        });
      }
    });
    
    return points;
  };

  // Aracın yönünü hesaplayan fonksiyon
  const calculateBearing = (start, end) => {
    if (!start || !end) return 0;

    const lat1 = (start[0] * Math.PI) / 180;
    const lon1 = (start[1] * Math.PI) / 180;
    const lat2 = (end[0] * Math.PI) / 180;
    const lon2 = (end[1] * Math.PI) / 180;

    const dLon = lon2 - lon1;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
  };

  // Yönüne göre doğru oku seçen fonksiyon
  const getArrowIcon = (angle) => {
    let arrowImg = arrowRight;
    if (angle >= 45 && angle < 135) {
      arrowImg = arrowUp;
    } else if (angle >= 135 && angle < 225) {
      arrowImg = arrowLeft;
    } else if (angle >= 225 && angle < 315) {
      arrowImg = arrowDown;
    }

    return new L.divIcon({
      html: `<img src='${arrowImg}' style='width: 32px; height: 32px;' />`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: "arrow-icon",
    });
  };

  const handleRouteClick = (route, vehicle) => {
    if (onRouteClick) {
      onRouteClick({
        distance: "4.5 km",
        time: "13 dk",
        vehicle: vehicle?.name || "Vehicle",
      });
    }
    setSelectedRoute(route);
  };

  // ROUTE COLORS - Farklı rotalar için
  const ROUTE_COLORS = [
    "#FF5733", // Kırmızı
    "#3366FF", // Mavi
    "#33CC33", // Yeşil
    "#9933FF", // Mor
    "#FF9933", // Turuncu
    "#CC3333", // Koyu kırmızı
    "#33CCFF", // Açık mavi
    "#FF99CC", // Pembe
    "#333333", // Siyah
    "#336699", // Cadet blue
  ];

  // Route4Vehicle verilerini render eden bileşen
  const Route4VehicleLayer = () => {
    if (!routeData || !routeData.routes) return null;
    
    return (
      <>
        {routeData.routes.map((route, routeIndex) => {
          const routeColor = ROUTE_COLORS[routeIndex % ROUTE_COLORS.length];
          const routePoints = [];

          // Başlangıç noktası kontrolü
          const startLatLng = route.start_point?.location 
            ? [route.start_point.location.latitude, route.start_point.location.longitude]
            : null;

          if (startLatLng && startLatLng.every(coord => coord !== undefined)) {
            routePoints.push(startLatLng);
          }

          // Başlangıç waypoints
          if (route.start_point?.waypoints?.length) {
            route.start_point.waypoints.forEach(wp => {
              if (wp?.location?.latitude && wp?.location?.longitude) {
                routePoints.push([wp.location.latitude, wp.location.longitude]);
              }
            });
          }

          // Teslimat noktaları
          if (route.delivery_points?.length) {
            route.delivery_points.forEach(dp => {
              if (dp?.location?.latitude && dp?.location?.longitude) {
                routePoints.push([dp.location.latitude, dp.location.longitude]);
              }
              if (dp?.waypoints?.length) {
                dp.waypoints.forEach(wp => {
                  if (wp?.location?.latitude && wp?.location?.longitude) {
                    routePoints.push([wp.location.latitude, wp.location.longitude]);
                  }
                });
              }
            });
          }

          // Bitiş noktası kontrolü
          const endLatLng = route.end_point?.location
            ? [route.end_point.location.latitude, route.end_point.location.longitude]
            : null;

          if (endLatLng && endLatLng.every(coord => coord !== undefined)) {
            routePoints.push(endLatLng);
          }

          return (
            <React.Fragment key={`optimized-route-${routeIndex}`}>
              {/* Rota çizgisi */}
              <Polyline 
                positions={routePoints} 
                pathOptions={{ 
                  color: routeColor,
                  weight: 5,
                  opacity: 0.7,
                  dashArray: '10, 10',
                  dashOffset: '0'
                }} 
                eventHandlers={{
                  click: () => handleRouteClick(route, { name: `Route ${routeIndex + 1}` })
                }}
              />

              {/* Başlangıç noktası */}
              {startLatLng && startLatLng.every(coord => coord !== undefined) && (
                <Marker position={startLatLng} icon={depotIcon}>
                  <Popup>
                    <strong>Başlangıç Noktası</strong><br />
                    {route.start_point?.id && <div>ID: {route.start_point.id}</div>}
                  </Popup>
                </Marker>
              )}

              {/* Teslimat noktaları */}
              {route.delivery_points?.map((dp, dpIndex) => (
                dp?.location?.latitude && dp?.location?.longitude ? (
                  <Marker 
                    key={`delivery-${routeIndex}-${dpIndex}`} 
                    position={[dp.location.latitude, dp.location.longitude]} 
                    icon={deliveryIcon}
                  >
                    <Popup>
                      <strong>Teslimat Noktası {dp.id}</strong><br />
                      {dp.address && <div>Adres: {dp.address}</div>}
                      {dp.demand && <div>Talep: {dp.demand}</div>}
                    </Popup>
                  </Marker>
                ) : null
              ))}

              {/* Bitiş noktası */}
              {endLatLng && endLatLng.every(coord => coord !== undefined) && (
                <Marker position={endLatLng} icon={depotIcon}>
                  <Popup>
                    <strong>Bitiş Noktası</strong><br />
                    {route.end_point?.id && <div>ID: {route.end_point.id}</div>}
                  </Popup>
                </Marker>
              )}
            </React.Fragment>
          );
        })}

        {/* Harita sınırlarını ayarla */}
        {allPoints.length > 0 && <MapBoundsUpdater points={allPoints} />}
      </>
    );
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={[39.750745, 30.482254]}
        zoom={16}
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
      >
        <LayersControl position="topright">
          {/* OpenStreetMap - Standart */}
          <LayersControl.BaseLayer checked name="OpenStreetMap Standart">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>

          {/* OpenStreetMap - Humanitarian */}
          <LayersControl.BaseLayer name="OpenStreetMap Humanitarian">
            <TileLayer
              url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>

          {/* Google Maps Stil */}
          <LayersControl.BaseLayer name="Google Streets">
            <TileLayer
              url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              maxZoom={20}
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              attribution='&copy; Google Maps'
            />
          </LayersControl.BaseLayer>

          {/* Google Satellite */}
          <LayersControl.BaseLayer name="Google Satellite">
            <TileLayer
              url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              maxZoom={20}
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              attribution='&copy; Google Maps'
            />
          </LayersControl.BaseLayer>

          {/* Google Terrain */}
          <LayersControl.BaseLayer name="Google Terrain">
            <TileLayer
              url="https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
              maxZoom={20}
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              attribution='&copy; Google Maps'
            />
          </LayersControl.BaseLayer>

          {/* Esri WorldStreetMap */}
          <LayersControl.BaseLayer name="Esri WorldStreetMap">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri &mdash; Sources: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, (c) OpenStreetMap contributors, and the GIS User Community'
            />
          </LayersControl.BaseLayer>

          {/* Esri Satellite */}
          <LayersControl.BaseLayer name="Esri Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            />
          </LayersControl.BaseLayer>

          {/* CartoDB - Aydınlık */}
          <LayersControl.BaseLayer name="CartoDB Aydınlık">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
          </LayersControl.BaseLayer>

          {/* CartoDB - Karanlık */}
          <LayersControl.BaseLayer name="CartoDB Karanlık">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
          </LayersControl.BaseLayer>

          {/* Optimizasyon Rotası Layer - Route4Vehicle.json'dan gelen rota */}
          <LayersControl.Overlay checked={viewMode === "route4vehicle"} name="Optimizasyon Rotası">
            <LayerGroup>
              {viewMode === "route4vehicle" && route4VehicleUrl && <Route4VehicleLayer />}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Araçlar">
            <LayerGroup>
              {vehicles.map((vehicle) => (
                <Marker key={vehicle.id} position={vehicle.position} icon={vehicleIcon}>
                  <Popup>
                    <div>
                      <p>Araç ID: {vehicle.name}</p>
                      <p>Velocity: {vehicle.velocity} km/h</p>
                      <p>Charge: %{vehicle.soc}</p>
                      <p>Payload: {vehicle.payload} kg</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Şarj İstasyonları">
            <LayerGroup>
              {chargingStations.map((station) => (
                <Marker key={station.id} position={station.position} icon={stationIcon}>
                  <Popup>Charging Station {station.id}</Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked={viewMode === "normal"} name="Bekleyen Aktif Talepler (Planlanmamış)">
            <LayerGroup>
              {orders.filter(order => order.status === 'Pending').map((order) => (
                <Marker key={order.id} position={order.position} icon={orderIcon}>
                  <Popup>Order ID: {order.id} - Bekliyor</Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked={viewMode === "normal"} name="Dağıtım Bekleyen Talepler (Atama Yapılmış)">
            <LayerGroup>
              {orders.filter(order => order.status === 'Planned').map((order) => (
                <Marker key={order.id} position={order.position} icon={orderIcon}>
                  <Popup>Order ID: {order.id} - Dağıtım Bekliyor</Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked={viewMode === "normal"} name="Planlanmış Araç Rotaları (Kalan Rota)">
            <LayerGroup>
              {plannedRoutes.map((route, index) => (
                <Polyline
                  key={index}
                  positions={route.positions}
                  color={routeColors[index] || "blue"}
                  weight={4}
                  smoothFactor={2}
                  opacity={0.9}
                  lineCap="round"
                  lineJoin="round"
                />
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked={viewMode === "normal"} name="Gezilmiş Rotalar (Tamamlanan)">
            <LayerGroup>
              {completedRoutes.map((route, index) => (
                <Polyline
                  key={index}
                  positions={route.positions}
                  color="green"
                  weight={4}
                  smoothFactor={2}
                  opacity={0.9}
                  lineCap="round"
                  lineJoin="round"
                  dashArray="5,5"
                />
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked={viewMode === "normal"} name="Trafik Yoğunluğu (Etki Alanı)">
            <LayerGroup>
              {traffic.map((route, index) => (
                <Polyline
                  key={index}
                  positions={route.positions}
                  color="red"
                  weight={3}
                  smoothFactor={2}
                  opacity={0.7}
                  lineCap="round"
                  lineJoin="round"
                  dashArray="10,10"
                />
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>

        {/* Loading/error indicators */}
        {loading && (
          <div className="map-overlay">
            <div className="loading-indicator">Rota verileri yükleniyor...</div>
          </div>
        )}
        
        {error && viewMode === "route4vehicle" && (
          <div className="map-overlay">
            <div className="error-message">{error}</div>
          </div>
        )}
      </MapContainer>
    </div>
  );
}