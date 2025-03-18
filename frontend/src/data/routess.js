// routess.js - Route tasks data

export const routess = {
  "Simulated Annealing": [
    {
      name: "Route 1",
      tasks: [
        { status: "completed", duration: 30 }, // Task takes 30 minutes
        { status: "completed", duration: 30 },
        { status: "pending", duration: 30 },
        { status: "pending", duration: 30 }
      ]
    },
    {
      name: "Route 2",
      tasks: [
        { status: "completed", duration: 30 },
        { status: "completed", duration: 30 },
        { status: "completed", duration: 30 }
      ]
    }
  ],
  // Additional routes can go here...
};

export default routess;