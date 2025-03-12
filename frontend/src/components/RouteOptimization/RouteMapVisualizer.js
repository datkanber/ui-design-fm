import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import depotIconImg from '../../assets/icons/depot.png';
import deliveryIconImg from '../../assets/icons/order2.png';

// Özel marker ikonları oluşturalım
const createCustomIcon = (iconUrl, size = [25, 25]) => {
  return new L.Icon({
    iconUrl,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]]
  });
};
console.log("depot Iccon", depotIconImg);
// İkonları tanımlayalım
const startIcon = createCustomIcon(depotIconImg);
// // const endIcon = createCustomIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png');
const endIcon = startIcon;
const deliveryIcon = createCustomIcon(deliveryIconImg);
console.log("startIcon", startIcon);
// Color palette
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

// Harita görünümünü rotaya göre ayarlamak için özel bileşen
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
export default function RouteMapVisualizer({ fileUrl, height = 770 }) {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allPoints, setAllPoints] = useState([]);
  
  useEffect(() => {

    // Tüm noktaları çıkart
    // Tüm noktaları toplayan bir yardımcı fonksiyon
    const extractAllPoints = (data) => {
      let points = [];
      if (!data || !data.routes) return points;
      
      data.routes.forEach(route => {
        // Başlangıç noktası
        if (route.start_point && route.start_point.location) {
          const { latitude, longitude } = route.start_point.location;
          points.push([latitude, longitude]);
        }
        
        // Başlangıç waypoints
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
            
            // Teslimat noktası waypoints
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
        // if (route.end_point && route.end_point.waypoints) {
        //   route.end_point.waypoints.forEach(wp => {
        //     if (wp.location) {
        //       points.push([wp.location.latitude, wp.location.longitude]);
        //     }
        //   });
        // }
      });
      
      return points;
    };

    const fetchRouteData = async () => {
      if (!fileUrl) {
        setError("Dosya URL'si belirtilmedi");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // URL kontrolü ve hata ayıklama
        console.log("Dosyayı yüklüyorum:", fileUrl);
        // Önce HEAD isteği ile dosyanın var olup olmadığını kontrol edelim
        try {
          await axios.head(fileUrl);
        } catch (headErr) {
          console.error("Dosya bulunamadı (HEAD isteği):", headErr);
          // HEAD isteği başarısız olursa direkt GET isteği yapmaya devam ediyoruz
        }
        
        // Dosya yolu URL parametresi olarak veriliyor
        const response = await axios.get(fileUrl);
        console.log("Dosya başarıyla yüklendi:", response.status);
        
        // Yanıt içeriğini kontrol et
        if (!response.data) {
          throw new Error("Yanıt verisi boş");
        }
        
        if (typeof response.data === 'string') {
          // Eğer yanıt bir string ise, JSON olarak ayrıştırmayı dene
          try {
            setRouteData(JSON.parse(response.data));
          } catch (parseErr) {
            throw new Error(`JSON ayrıştırma hatası: ${parseErr.message}`);
          }
        } else {
          // Nesne olarak geldi
          setRouteData(response.data);
        }
        
        const points = extractAllPoints(response.data);
        setAllPoints(points);
        setLoading(false);
      } catch (err) {
        console.error("Rota verileri yüklenemedi:", err);
        setError(`Rota verileri yüklenemedi: ${err.message}. URL: ${fileUrl}`);
        setLoading(false);
        
        // Yedek verileri kontrol et - eğer varsayılan bir dosya konumu varsa
        try {
          const defaultFileUrl = `${window.location.origin}/public/output/RML/newesoguv32-c05-ds1_Route4Vehicle.json`;
          console.log("Varsayılan dosya yolunu deniyorum:", defaultFileUrl);
          const fallbackResponse = await axios.get(defaultFileUrl);
          if (fallbackResponse.data) {
            console.log("Varsayılan dosya başarıyla yüklendi");
            setRouteData(fallbackResponse.data);
            const points = extractAllPoints(fallbackResponse.data);
            setAllPoints(points);
            setError(null); // Hata mesajını temizle
            setLoading(false);
          }
        } catch (fallbackErr) {
          console.error("Varsayılan dosya da yüklenemedi:", fallbackErr);
        }
      }
    };
    
    fetchRouteData();
  }, [fileUrl]);
  
  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 20, 
        height: `${height}px`, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '12px',
        border: '1px solid #ddd'
      }}>
        <div>
          <div style={{ marginBottom: 20 }}>Rota verileri yükleniyor...</div>
          <div className="loader" style={{ 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            animation: 'spin 2s linear infinite',
            margin: '0 auto'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ 
        color: 'red', 
        textAlign: 'center', 
        padding: 20, 
        height: `${height}px`, 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#fff0f0',
        borderRadius: '12px',
        border: '1px solid #ffccc7'
      }}>
        <div>{error}</div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: 20,
            padding: '8px 16px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Yenile
        </button>
      </div>
    );
  }
  
  if (!routeData || !routeData.routes || routeData.routes.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 20, 
        height: `${height}px`, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '12px',
        border: '1px solid #ddd'
      }}></div>
        // Rota verisi bulunamadı
    );
  }
  
  // Başlangıç konumu için ilk rotanın başlangıç noktasını kullan
  const startPoint = routeData.routes[0].start_point.location;
  const initialPosition = [startPoint.latitude, startPoint.longitude];
  
  return (
    <div>
      <MapContainer 
        center={initialPosition} 
        zoom={13} 
        style={{ height: `${height}px`, width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Harita sınırlarını güncelleyen bileşen */}
        <MapBoundsUpdater points={allPoints} />

        {routeData.routes.map((route, routeIndex) => {
          const routeColor = ROUTE_COLORS[routeIndex % ROUTE_COLORS.length];
          const routePoints = [];

          // Başlangıç noktası kontrolü
          const startLatLng = [
            route.start_point?.location?.latitude, 
            route.start_point?.location?.longitude
          ];

          if (startLatLng.every(coord => coord !== undefined)) {
            routePoints.push(startLatLng);
          }

          // Başlangıç noktası için waypoints ekle
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
          const endLatLng = [
            route.end_point?.location?.latitude, 
            route.end_point?.location?.longitude
          ];

          if (endLatLng.every(coord => coord !== undefined)) {
            routePoints.push(endLatLng);
          }

          return (
            <React.Fragment key={`route-${routeIndex}`}>
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
              />

              {/* Başlangıç noktası */}
              {startLatLng.every(coord => coord !== undefined) && (
                <Marker position={startLatLng} icon={startIcon}>
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
                    key={`dp-${routeIndex}-${dpIndex}`} 
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
              {endLatLng.every(coord => coord !== undefined) && (
                <Marker position={endLatLng} icon={endIcon}>
                  <Popup>
                    <strong>Bitiş Noktası</strong><br />
                    {route.end_point?.id && <div>ID: {route.end_point.id}</div>}
                  </Popup>
                </Marker>
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}