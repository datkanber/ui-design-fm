"""
Yazar: Ferdanur ARMUTLU
Tarih: 25 Ekim 2024
Açıklama: Bu kod, SUMO simülasyonunda araç verilerini toplar.
"""

import traci  # TraCI kütüphanesi, SUMO simülasyonunu Python üzerinden kontrol etmeyi sağlar
import sumolib  # SUMO ile ilgili yardımcı fonksiyonlar için kullanılan kütüphane
import pandas as pd  # Veriyi DataFrame formatında saklamak ve işlemler yapmak için pandas kütüphanesi

# SUMO binary path (SUMO yürütme dosyasının yolu)
sumo_binary = "sumo"  # Ekransız çalışacaksa "sumo", GUI ile çalışacaksa "sumo-gui"
# sumo_binary = "C:/Program Files (x86)/Eclipse/Sumo/"  # Örneğin Windows için

# SUMO config dosyasının yolu (simülasyon ayar dosyası)
sumo_cfg_file = "dennn.sumocfg"

# TraCI bağlantısını başlat
traci.start([sumo_binary, "-c", sumo_cfg_file])

# Sonuçları saklamak için boş bir liste oluştur
results = []

# Simülasyonu başlat
while traci.simulation.getMinExpectedNumber() > 0:  # Simülasyonun bitip bitmediğini kontrol et
    traci.simulationStep()  # Bir adım simülasyon ilerlet
    
    # Her adımda tüm araçların verilerini topluyoruz
    for vehicle_id in traci.vehicle.getIDList():  # Simülasyondaki tüm araçların listesini al
        # Araç ile ilgili bilgileri al
        edge_id = traci.vehicle.getRoadID(vehicle_id)  # Araç hangi yol üzerinde
        x, y, z = traci.vehicle.getPosition3D(vehicle_id)  # Araç konumunu 3D olarak al (x, y, z)
        lon, lat = traci.simulation.convertGeo(x, y)  # x, y koordinatlarını enlem ve boylama çevir
        altitude = z  # Z ekseninden yükseklik bilgisi
        slope = traci.vehicle.getSlope(vehicle_id)  # Araç eğimini al
        angle = traci.vehicle.getAngle(vehicle_id)  # Araç açısını al
        speed = traci.vehicle.getSpeed(vehicle_id)  # Araç hızını al
        energy_consumption = traci.vehicle.getElectricityConsumption(vehicle_id)  # Araç enerji tüketimini al
        
        # Zaman damgasını al
        timestamp = traci.simulation.getTime()

        # Alınan verileri bir sözlük olarak listeye ekle
        results.append({
            'Time_Stamp': timestamp,
            'altitude': altitude,
            'edge_id': edge_id,
            'longitude': lon,
            'latitude': lat,
            'slope': slope,
            'angle': angle,
            'speed': speed,
            'energy_consumption': energy_consumption
        })

# Simülasyon tamamlandığında bağlantıyı kapat
traci.close()

# Sonuçları DataFrame formatına çevir
df = pd.DataFrame(results)

# DataFrame'i CSV dosyası olarak kaydet
df.to_csv("sumo_simulation_results.csv", index=False)
