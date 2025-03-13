export const parseRouteXML = async (xmlUrl) => {
  try {
    const response = await fetch(xmlUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch XML: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Temel verileri çıkarma
    const solution = xmlDoc.getElementsByTagName('Solution')[0];
    const performanceMeasure = xmlDoc.getElementsByTagName('PerformanceMeasure')[0];
    const routes = xmlDoc.getElementsByTagName('Route');
    
    // Performans metrikleri
    const metrics = {
      totalDistance: parseFloat(getElementTextContent(performanceMeasure, "TotalDistance")),
      totalDuration: parseFloat(getElementTextContent(performanceMeasure, "TotalDuration")),
      totalEnergyConsumption: parseFloat(getElementTextContent(performanceMeasure, "TotalEnergyConsumption")),
      totalTardiness: parseFloat(getElementTextContent(performanceMeasure, "TotalTardiness")),
      totalChargingTime: parseFloat(getElementTextContent(performanceMeasure, "TotalChargingTime")),
      numberOfNodes: parseInt(getElementTextContent(performanceMeasure, "NumberOfNodes")),
      numberOfServedCustomers: parseInt(getElementTextContent(performanceMeasure, "NumberOfServedCustomers")),
      numberOfChargeStation: parseInt(getElementTextContent(performanceMeasure, "NumberOfChargeStation")),
      runtime: parseFloat(getElementTextContent(performanceMeasure, "Runtime")),
    };
    
    // Rota metriklerini çıkarma
    const routeList = [];
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const routeId = route.getAttribute('RouteId');
      const vehicleId = route.getAttribute('VehicleId');
      
      const routePM = route.getElementsByTagName('PerformanceMeasure')[0];
      
      routeList.push({
        routeId,
        vehicleId,
        distance: parseFloat(getElementTextContent(routePM, "RouteDistance")),
        duration: parseFloat(getElementTextContent(routePM, "RouteDuration")),
        energyConsumption: parseFloat(getElementTextContent(routePM, "RouteEnergyConsumption")),
        tardiness: parseFloat(getElementTextContent(routePM, "RouteTardiness")),
        chargingTime: parseFloat(getElementTextContent(routePM, "RouteChargingTime")),
        numberOfNodes: parseInt(getElementTextContent(routePM, "NumberOfNodes")),
        numberOfChargeStation: parseInt(getElementTextContent(routePM, "NumberOfChargeStation")),
      });
    }
    
    return {
      metrics,
      routes: routeList,
      problemType: solution.getAttribute('ProblemType'),
      objectiveFunction: solution.getAttribute('ObjectiveFunction'),
      numberOfCustomers: solution.getAttribute('NumberOfCustomers')
    };
    
  } catch (error) {
    console.error("Error parsing XML:", error);
    throw error;
  }
};

// Yardımcı fonksiyon - belirtilen elementin altındaki metin içeriğini alır
function getElementTextContent(parentElement, tagName) {
  const elements = parentElement.getElementsByTagName(tagName);
  if (elements.length > 0) {
    return elements[0].textContent;
  }
  return "0"; // Varsayılan değer olarak 0 döner
}
