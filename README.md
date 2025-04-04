# Fleet Management Application

Bu uygulama OPEVA ve SUIT projesi kapsamında bir filo yöneticisinin gözünden filo yönetimini kolaylaştırmak amacıyla geliştirilmiştir. Uygulama, filo yöneticisinin filosundaki araçları, araçların bakım ve onarım durumlarını, araçların konumlarını ve araçların sürücülerini takip etmesine olanak sağlar. Ayrıca filo yöneticisi, araçların bakım ve onarım durumlarını, araçların konumlarını ve araçların sürücülerini düzenleyebilir.


## Kullanılan Teknolojiler
- React
- Node.js
- Leaflet.js
- Material-UI

## Gereksinimler

- 

  
## Kurulum
Projeyi klonlayın
```bash
  git clone https://github.com/datkanber/ui-design-fm.git
```
Proje dizinine gidin
```bash
  cd ui-design-fm
```
Gerekli paketleri yükleyin
```bash
  npm install
```
Uygulamayı başlatın
```bash
  cd frontend
  npm start
```
Yeni bir terminal penceresi açın ve sunucuyu başlatın
```bash
  cd backend
  node server.js
```

## Ekran Görüntüleri

![alt text](temp_images/v1.8.png)


## System Diagrams 


```mermaid	
sequenceDiagram
    actor Admin
    participant FleetApp as Fleet Management Application
    participant Cloud as Cloud Routing Algorithms
    participant EV as EV (MUSOSHI)
    participant SUMO as Simulation (SUMO)
    
    %% Admin selects customer requests
    Admin->>FleetApp: Select Customer Requests
    FleetApp->>FleetApp: Process Selected Requests
    
    %% Convert to RoutingML format and send to Cloud
    FleetApp->>FleetApp: Convert Requests to RoutingML Format
    FleetApp->>Cloud: Send Requests in RoutingML Format
    
    %% Cloud processing
    Cloud->>Cloud: Run Route Optimization Algorithm
    
    %% Return optimized routes
    Cloud->>FleetApp: Send Optimized Results (RoutingML: R4P, R4V, R4S)
    FleetApp->>Admin: Display Optimized Results
    
    %% Admin approval
    Admin->>FleetApp: Approve Routes
    
    %% Distribution of approved routes
    FleetApp->>FleetApp: Save Approved Results (RoutingML: R4P)
    FleetApp->>EV: Send Approved Results (RoutingML: R4V)
    FleetApp->>SUMO: Send Approved Results (RoutingML: R4S)
    
    %% Continuous status updates
    loop Periodic Status Updates
        EV->>FleetApp: Route Status Update
        SUMO->>FleetApp: Route Status Update
        FleetApp->>Admin: Route Status Notification
    end
    
    %% Simulation results
    SUMO->>FleetApp: Simulation Results
    FleetApp->>Admin: Simulation Results Notification
    FleetApp->>FleetApp: Real vs Simulation Comparison and Analysis
```
