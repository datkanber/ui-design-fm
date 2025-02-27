import { routes } from './routes';  // <-- routes'u içe aktarıyoruz

export const vehicles = [
  {
    id: 1,
    name: 'Vehicle 1',
    soc: 15,  // ⚡ Low battery
    velocity: 12.5,
    payload: 100,
    deliveryDeadlineApproaching: false,
    position: [39.751420, 30.481920],  // Simulated Annealing rotası üzerinde farklı bir başlangıç
    routes: routes['Simulated Annealing']
  },
  {
    id: 2,
    name: 'Vehicle 2',
    soc: 70,
    velocity: 0,  // 🚨 Vehicle stopped
    payload: 200,
    deliveryDeadlineApproaching: true,
    position: [39.751215, 30.483549],  // Tabu Search rotası üzerinde farklı bir nokta
    routes: routes['Tabu Search']
  },
  {
    id: 3,
    name: 'Vehicle 3',
    soc: 60,
    velocity: 15,  // 🚚 Normal operation
    payload: 150,
    deliveryDeadlineApproaching: false,
    position: [39.751628, 30.487587],  // OR-Tools rotası üzerinde orta bir nokta
    routes: routes['OR-Tools']
  },
  {
    id: 4,
    name: 'Vehicle 4',
    soc: 10,  // ⚡ Critical low battery
    velocity: 5,
    payload: 120,
    deliveryDeadlineApproaching: true,
    position: [39.750370, 30.483896],  // Simulated Annealing rotasında farklı bir orta nokta
    routes: routes['Simulated Annealing']
  },
  {
    id: 5,
    name: 'Vehicle 5',
    soc: 90,
    velocity: 20,  // 🚚 Fast operation
    payload: 300,
    deliveryDeadlineApproaching: false,
    position: [39.752394, 30.488127],  // Tabu Search rotasında sonlara doğru bir konum
    routes: routes['Tabu Search']
  }
];
