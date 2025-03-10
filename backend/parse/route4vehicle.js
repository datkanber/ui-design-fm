const fs = require('fs');
const { MongoClient } = require('mongodb');
const path = require('path');

// MongoDB Bağlantı Bilgileri
const MONGO_URI = 'mongodb+srv://burak2kanber:ploW4nuSpzwXakhM@cluster0.on8m7.mongodb.net/RouteManagementDB?retryWrites=true&w=majority&appName=Cluster0';

const importJsonToMongo = async () => {
  let client;
  try {
    console.log('MongoDB\'ye bağlanılıyor...');
    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('MongoDB bağlantısı başarılı');

    const db = client.db('RouteManagementDB');
    const collection = db.collection('route4vehicles');

    const jsonFilePath = path.join(__dirname, '../data/C10_Route4Vehicle.json');
    if (!fs.existsSync(jsonFilePath)) {
      console.error(`Hata: Dosya bulunamadı: ${jsonFilePath}`);
      await client.close();
      return;
    }

    console.log(`JSON dosyası okunuyor: ${jsonFilePath}`);
    
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const parsedData = JSON.parse(jsonData);

    if (!parsedData.routes || !Array.isArray(parsedData.routes)) {
      console.error('Hata: JSON beklenen formatta değil. "routes" dizisi bulunamadı.');
      await client.close();
      return;
    }

    const formattedData = parsedData.routes.map(route => ({
      routeId: route.id,
      name: route.name,
      startPoint: route.start_point,
      endPoint: route.end_point,
      deliveryPoints: route.delivery_points || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await collection.insertMany(formattedData);
    console.log('Veri başarıyla MongoDB\'ye aktarıldı');

    await client.close();
  } catch (error) {
    console.error('JSON\'u MongoDB\'ye aktarma hatası:', error.message || error);
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

importJsonToMongo();
