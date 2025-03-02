import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

export const loadTaskData = async (taskType) => {
    try {
      const fileName = `newesoguv32-${taskType.toLowerCase()}-ds1.xml`;
      const response = await axios.get(`/esogu_dataset/Info4Tasks/${fileName}`);
      
      console.log("Çekilen XML verisi:", response.data); // ✅ Veriyi kontrol edelim
  
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        allowBooleanAttributes: true,
        parseAttributeValue: true,
        parseTagValue: true
      });
  
      const result = parser.parse(response.data);
      console.log("Parse edilen JSON:", result); // ✅ XML parse edildikten sonra içeriği kontrol edelim
  
      if (!result || !result.Info4Task || !result.Info4Task.Task) {
        console.error("Beklenen XML formatı yanlış!"); // ❌ Beklenen yapıda değilse hata ver
        return { customers: [], depot: null, chargingStations: [], taskInfo: {} };
      }
  
      const nodes = Array.isArray(result.Info4Task.Task.CEVRPTW.Nodes.Node)
            ? result.Info4Task.Task.CEVRPTW.Nodes.Node
            : [result.Info4Task.Task.CEVRPTW.Nodes.Node];

            console.log("Düzeltilmiş Nodes:", nodes);

      console.log("Düğümler (nodes):", nodes); // ✅ Node listesini kontrol edelim
      nodes.forEach(node => console.log(`Node No: ${node["@_No"]}, Type: ${node["@_Type"]}`));
      console.log("Nodes içindeki Type değerleri:", nodes.map(node => node["@_Type"]));
      
      // Müşteri (Delivery) nodlarını filtrele
      const customers = nodes
        .filter(node => node["@_Type"] === "Delivery") // ✅ Doğru filtreleme
        .map(node => ({
            id: node["@_No"], // ✅ `@_No` olarak düzelttik
            name: node["@_Name"],
            type: taskType.substring(0, taskType.includes('RC') ? 2 : 1),
            nodeType: node["@_Type"],
            location: {
              lat: parseFloat(node.Location.Latitude),
              lng: parseFloat(node.Location.Longitude),
              x: parseFloat(node.Location.X_Coordinates),
              y: parseFloat(node.Location.Y_Coordinates)
            },
            request: {
            productId: node.Requests?.Request?.["@_ProductId"] || "N/A",
            productName: node.Requests?.Request?.["@_ProductName"] || "Bilinmeyen Ürün",
            readyTime: parseInt(node.Requests?.Request?.["@_ReadyTime"]) || 0,
            serviceTime: parseInt(node.Requests?.Request?.["@_ServiceTime"]) || 0,
            dueDate: parseInt(node.Requests?.Request?.["@_DueDate"]) || 0,
            weight: parseInt(node.Requests?.Request?.LoadInformation?.Weight) || 0,
            quantity: parseInt(node.Requests?.Request?.LoadInformation?.Quantity) || 0
            }
        }));

  
      // Depo ve şarj istasyonlarını filtrele
      const depot = nodes.find(node => node["@_Type"] === "Entrance") || null;
      
  
      const chargingStations = nodes
        .filter(node => node["@_Type"] === "DepoCharging")
        .map(station => ({
            id: station["@_No"],
            name: station["@_Name"],
            type: station["@_Type"],
            location: {
            lat: parseFloat(station.Location.Latitude),
            lng: parseFloat(station.Location.Longitude),
            x: parseFloat(station.Location.X_Coordinates),
            y: parseFloat(station.Location.Y_Coordinates)
            }
        }));
  
      console.log("Müşteriler:", customers); // ✅ Müşteri listesini kontrol edelim
      console.log("Depo:", depot); // ✅ Depo bilgisini kontrol edelim
      console.log("Şarj İstasyonları:", chargingStations); // ✅ Şarj istasyonlarını kontrol edelim
  
      return {
        customers,
        depot: depot ? {
          id: depot.No,
          name: depot.Name,
          type: depot.Type,
          location: {
            lat: parseFloat(depot.Location.Latitude),
            lng: parseFloat(depot.Location.Longitude),
            x: parseFloat(depot.Location.X_Coordinates),
            y: parseFloat(depot.Location.Y_Coordinates)
          }
        } : null,
        chargingStations,
        taskInfo: {
          numberOfDelivery: result.Info4Task.Task.CEVRPTW.NumberOfDelivery || 0,
          numberOfPickup: result.Info4Task.Task.CEVRPTW.NumberOfPickup || 0,
          objectiveFunction: result.Info4Task.Task.PerformanceMeasure?.ObjectiveFunction?.Name || "N/A"
        }
      };
  
    } catch (error) {
      console.error('Task verisi yüklenirken hata oluştu:', error);
      return { customers: [], depot: null, chargingStations: [], taskInfo: {} };
    }
  };
  