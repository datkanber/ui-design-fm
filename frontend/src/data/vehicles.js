import { routes } from './routes';  // <-- routes'u içe aktarıyoruz

export const vehicles = [
  {
    id: 1,
    name: 'Vehicle 1',
    soc: 15,  // ⚡ Low battery
    velocity: 0, // 🚨 Vehicle stopped
    payload: 100,
    deliveryDeadlineApproaching: false,
    position: [39.751420, 30.481920],  // Simulated Annealing rotası üzerinde farklı bir başlangıç
    routes: routes['Simulated Annealing'],
    driver: "Driver1",
    slope: 75,
    traffic: 15,
    driverCharacter: 10, 
  },
  {
    id: 2,
    name: 'Vehicle 2',
    soc: 70,
    velocity:12.5,  
    payload: 200,
    deliveryDeadlineApproaching: true,
    position: [39.751215, 30.483549],  // Tabu Search rotası üzerinde farklı bir nokta
    routes: routes['Tabu Search'],
    driver: "Driver2",
    slope: 55,
    traffic: 25,
    driverCharacter: 20, 
  },
  {
    id: 3,
    name: 'Vehicle 3',
    soc: 60,
    velocity: 15,  // 🚚 Normal operation
    payload: 150,
    deliveryDeadlineApproaching: false,
    position: [39.74985, 30.48297],  // OR-Tools rotası üzerinde orta bir nokta
    routes: routes['OR-Tools'],
    driver: "Driver3",
    slope: 50,
    traffic: 30,
    driverCharacter: 20, 
  },
  {
    id: 4,
    name: 'Vehicle 4',
    soc: 10,  // ⚡ Critical low battery
    velocity: 5,
    payload: 120,
    deliveryDeadlineApproaching: true,
    position: [39.750370, 30.483896],  // Simulated Annealing rotasında farklı bir orta nokta
    routes: routes['Simulated Annealing'],
    driver: "Driver4",
    slope: 30,
    traffic: 50,
    driverCharacter: 20, 
  },
  {
    id: 5,
    name: 'Vehicle 5',
    soc: 90,
    velocity: 20,  // 🚚 Fast operation
    payload: 300,
    deliveryDeadlineApproaching: false,
    position: [39.75196, 30.48803],  // Tabu Search rotasında sonlara doğru bir konum
    routes: routes['Tabu Search'],
    driver: "Driver5",
    slope: 40,
    traffic: 30,
    driverCharacter: 30, 

  }
];
