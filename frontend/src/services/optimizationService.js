import axios from 'axios';
import { 
  updateAlgorithmParameters, 
  updateObjectiveFunction, 
  updateChargingStrategy 
} from '../utils/xmlService';

/**
 * Updates all XML configuration files based on optimization settings
 * @param {object} scenario - Current scenario with all parameters
 * @returns {Promise<object>} - Result of the update operations
 */
export const saveOptimizationSettings = async (scenario) => {
  try {
    const results = {
      algorithm: false,
      objectiveFunction: false,
      chargingStrategy: false
    };
    
    // 1. Update algorithm parameters
    results.algorithm = await updateAlgorithmParameters(scenario);
    
    // 2. Update objective function in the selected task file
    const selectedTask = localStorage.getItem('selectedEsoguTask');
    if (selectedTask) {
      results.objectiveFunction = await updateObjectiveFunction(selectedTask, scenario.objectiveFunction);
    }
    else {
      console.error('No selected task found');
    }
    
    // 3. Update charging strategy in the selected task file
    results.chargingStrategy = await updateChargingStrategy(scenario.chargingStrategy);
    return results;
    } catch (error) {
    console.error('Error saving optimization settings:', error);
    return { error: 'Failed to save optimization settings' };
  }
}