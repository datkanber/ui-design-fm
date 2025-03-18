import React, { createContext, useState, useContext } from 'react';

// Create context
const ScenarioContext = createContext();

// Custom hook to use the scenario context
export const useScenarios = () => useContext(ScenarioContext);

// Provider component
export const ScenarioProvider = ({ children }) => {
  const [scenarios, setScenarios] = useState([]);

  // Add a new scenario
  const addScenario = (scenario) => {
    setScenarios(prev => [...prev, { ...scenario, id: Date.now() }]);
  };

  // Delete a scenario by id
  const deleteScenario = (id) => {
    setScenarios(prev => prev.filter(scenario => scenario.id !== id));
  };

  // Clear all scenarios
  const clearScenarios = () => {
    setScenarios([]);
  };

  // Apply algorithm parameters to XML (to be used when needed)
  const applyScenarioToXML = async (scenarioId) => {
    // This functionality will be implemented later
    console.log("XML update for scenario:", scenarioId);
  };

  // The context value
  const contextValue = {
    scenarios,
    addScenario,
    deleteScenario,
    clearScenarios,
    applyScenarioToXML
  };

  return (
    <ScenarioContext.Provider value={contextValue}>
      {children}
    </ScenarioContext.Provider>
  );
};
