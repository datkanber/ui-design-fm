const fs = require('fs');
const xml2js = require('xml2js');
const { MongoClient } = require('mongodb');  // Use MongoDB native driver
const path = require('path');

// MongoDB Connection URI
const MONGO_URI = 'mongodb+srv://burak2kanber:ploW4nuSpzwXakhM@cluster0.on8m7.mongodb.net/RouteManagementDB?retryWrites=true&w=majority&appName=Cluster0';

// XML dosyasını oku ve MongoDB'ye aktar
const importXmlToMongo = async () => {
  let client;

  try {
    // Connect directly using MongoDB driver
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('MongoDB connection successful');

    // Get database and collection
    const db = client.db('RouteManagementDB');
    const collection = db.collection('route4plans');

    // XML dosya yolunu kontrol et
    const xmlFilePath = path.join(__dirname, '../data/C10_Route4Plan.xml');
    if (!fs.existsSync(xmlFilePath)) {
      console.error(`Hata: Dosya bulunamadı: ${xmlFilePath}`);
      await client.close();
      return;
    }

    console.log(`XML dosyası okunuyor: ${xmlFilePath}`);
    
    // XML dosyasını oku
    const xmlFile = fs.readFileSync(xmlFilePath, 'utf8');
    
    // XML'i JSON'a dönüştür
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlFile);
    
    // XML yapısını kontrol et
    if (!result.Route4Plan || !result.Route4Plan.Solution) {
      console.error('Hata: XML yapısı beklenen formatta değil. Route4Plan.Solution bulunamadı.');
      await client.close();
      return;
    }
    
    // Route4Plan verilerini çıkar
    const route4PlanData = result.Route4Plan.Solution;
    console.log('XML başarıyla ayrıştırıldı');
    
    // Veri zaten var mı kontrol et - using direct MongoDB query
    const existingData = await collection.findOne({ Name: route4PlanData.$.Name });
    
    if (existingData) {
      console.log('Bu veri zaten MongoDB\'de mevcut');
    } else {
      try {
        // MongoDB için veriyi hazırla
        const mongoData = {
          Name: route4PlanData.$.Name,
          ProblemType: route4PlanData.$.ProblemType,
          ObjectiveFunction: route4PlanData.$.ObjectiveFunction,
          ChargingStrategy: route4PlanData.$.ChargingStrategy,
          NumberOfCustomers: parseInt(route4PlanData.$.NumberOfCustomers),
          BatteryCapacity: parseInt(route4PlanData.$.BatteryCapacity),
          MaxSpeed: parseFloat(route4PlanData.$.MaxSpeed),
          VehicleMass: parseInt(route4PlanData.$.VehicleMass),
          MaximumLoadCapacityVolume: parseInt(route4PlanData.$.MaximumLoadCapacityVolume),
          MaximumLoadCapacityKg: parseInt(route4PlanData.$.MaximumLoadCapacityKg),
          BatteryRechargingRate: parseFloat(route4PlanData.$.BatteryRechargingRate),
          EnergyConsumptionRate: parseFloat(route4PlanData.$.EnergyConsumptionRate),
          PerformanceMeasure: route4PlanData.PerformanceMeasure,
          Routes: Array.isArray(route4PlanData.Routes.Route) 
            ? route4PlanData.Routes.Route.map(route => ({
                RouteId: route.$.RouteId,
                VehicleId: route.$.VehicleId,
                DriverId: route.$.DriverId,
                PerformanceMeasure: route.PerformanceMeasure,
                Nodes: Array.isArray(route.Nodes.Node) ? route.Nodes.Node : [route.Nodes.Node]
              }))
            : [{
                RouteId: route4PlanData.Routes.Route.$.RouteId,
                VehicleId: route4PlanData.Routes.Route.$.VehicleId,
                DriverId: route4PlanData.Routes.Route.$.DriverId,
                PerformanceMeasure: route4PlanData.Routes.Route.PerformanceMeasure,
                Nodes: Array.isArray(route4PlanData.Routes.Route.Nodes.Node) 
                  ? route4PlanData.Routes.Route.Nodes.Node 
                  : [route4PlanData.Routes.Route.Nodes.Node]
              }]
        };
        
        // Add timestamps manually
        mongoData.createdAt = new Date();
        mongoData.updatedAt = new Date();
        
        console.log('Veri MongoDB için hazırlandı');
        
        // MongoDB'ye kaydet using insertOne
        const result = await collection.insertOne(mongoData);
        console.log('Veri başarıyla MongoDB\'ye aktarıldı', result.insertedId);
      } catch (saveError) {
        console.error('Veri kaydedilirken hata oluştu:', saveError);
      }
    }
    
    // Close MongoDB connection
    await client.close();
    console.log('MongoDB bağlantısı kapatıldı');
    
  } catch (error) {
    console.error('XML\'i MongoDB\'ye aktarma hatası:', error.message || error);
    console.error('Error stack:', error.stack);
    
    // Close connection in case of error
    if (client) {
      try {
        await client.close();
        console.log('Hata sonrası MongoDB bağlantısı kapatıldı');
      } catch (disconnectError) {
        console.error('MongoDB bağlantısı kapatılırken hata oluştu:', disconnectError);
      }
    }
  }
};

// Script başlatıldığında çalıştırılır
console.log('XML import işlemi başlatılıyor...');
importXmlToMongo().then(() => {
  console.log('İşlem tamamlandı');
}).catch(err => {
  console.error('İşlem sırasında bir hata oluştu:', err.message || err);
});
