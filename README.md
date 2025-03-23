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
    participant Kullanıcı
    participant FiloApp as Filo Yönetim Uygulaması
    participant DB as Veritabanı
    participant RML as RoutingMarkupLanguage Servisi
    participant Cloud as Cloud Algoritma Servisi
    participant EV as Elektrikli Araç
    participant SUMO as Simulasyon Sistemi
    participant Analiz as Filo Yönetim Analiz Modülü
    
    %% Kullanıcı Kaydı Süreci
    Kullanıcı->>FiloApp: Kayıt İsteği Gönder
    FiloApp->>DB: Kullanıcı Bilgilerini Kaydet
    DB->>FiloApp: Kayıt Onayı
    FiloApp->>RML: Kullanıcı Bilgisi ile RML Yapısını Güncelle
    RML->>FiloApp: RML Güncelleme Onayı
    FiloApp->>Kullanıcı: Kayıt Başarılı Bildirimi
    
    %% Sipariş Oluşturma Süreci
    Kullanıcı->>FiloApp: Sipariş Oluştur (Konum, Zaman, Detaylar)
    FiloApp->>DB: Sipariş Bilgilerini Kaydet
    DB->>FiloApp: Sipariş Kaydı Onayı
    FiloApp->>Kullanıcı: Sipariş Oluşturuldu Bildirimi
    
    %% Task Toplama ve Cloud'a Gönderme
    FiloApp->>FiloApp: Bekleyen Taskları Topla
    FiloApp->>RML: Taskları RML Formatına Dönüştür
    RML->>FiloApp: RML Formatında Tasklar
    FiloApp->>Cloud: RML Formatında Taskları Gönder
    
    %% Cloud İşleme Süreci
    Cloud->>Cloud: Optimizasyon Algoritmasını Çalıştır
    
    %% Sonuçların Alınması ve İşlenmesi
    Cloud->>FiloApp: EV Rota Sonuçları (RML)
    Cloud->>FiloApp: Simulasyon Sonuçları (RML)
    Cloud->>FiloApp: Analiz Sonuçları (RML)
    
    %% Veritabanı Güncellemesi
    FiloApp->>DB: Cloud Sonuçlarını Kaydet
    DB->>FiloApp: Güncelleme Onayı
    
    %% Sonuçların İlgili Sistemlere Dağıtılması
    FiloApp->>EV: EV Rota Talimatları Gönder
    FiloApp->>SUMO: Simulasyon Verilerini Gönder
    FiloApp->>Analiz: Analiz Verilerini Gönder
    
    %% Sonuçların İşlenmesi
    EV->>FiloApp: Rota Alındı Onayı
    SUMO->>FiloApp: Simulasyon Başlatıldı Onayı
    Analiz->>FiloApp: Analiz Başlatıldı Onayı
    
    %% Teslimat Süreci
    EV->>FiloApp: Teslimat Başladı Bildirimi
    FiloApp->>DB: Teslimat Durumu Güncelle
    EV->>FiloApp: Teslimat Tamamlandı Bildirimi
    FiloApp->>DB: Teslimat Tamamlandı Bilgisi Kaydet
    FiloApp->>Kullanıcı: Teslimat Tamamlandı Bildirimi
```