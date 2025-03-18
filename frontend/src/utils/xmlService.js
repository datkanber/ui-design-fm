import axios from 'axios';

/**
 * Reads an XML file from the given path
 * @param {string} filePath - Path to the XML file
 * @returns {Promise<string>} - XML content as string
 */
export const readXMLFile = async (filePath) => {
  try {
    const response = await axios.get(filePath);
    return response.data;
  } catch (error) {
    console.error(`Error reading XML file from ${filePath}:`, error);
    throw new Error(`Could not read XML file: ${error.message}`);
  }
};

/**
 * Saves XML content to the specified path
 * @param {string} filePath - Path where XML will be saved
 * @param {string} content - XML content
 * @returns {Promise<object>} - Server response
 */
export const saveXMLFile = async (filePath, content) => {
  try {
    const response = await axios.post('http://localhost:3001/save-xml', {
      path: filePath,
      content: content
    });
    return response.data;
  } catch (error) {
    console.error(`Error saving XML file to ${filePath}:`, error);
    throw new Error(`Could not save XML file: ${error.message}`);
  }
};

/**
 * Updates algorithm parameters in Input.xml
 * @param {object} scenario - Scenario with algorithm and parameters
 * @returns {Promise<void>}
 */
export const updateAlgorithmParameters = async (scenario) => {
  try {
    const filePath = '/esogu_dataset/Info4Algorithm/Input.xml';
    let xmlContent = await readXMLFile(filePath);
    
    // Update algorithm type
    const algorithmTypeRegex = /<AlgorithmType>(.*?)<\/AlgorithmType>/;
    xmlContent = xmlContent.replace(algorithmTypeRegex, `<AlgorithmType>${scenario.algorithm}</AlgorithmType>`);
    
    // Update parameters
    const parametersRegex = /<AlgorithmParameters>([\s\S]*?)<\/AlgorithmParameters>/;
    let parametersXml = '<AlgorithmParameters>\n';
    
    Object.entries(scenario.parameters).forEach(([key, value]) => {
      parametersXml += `  <Parameter Name="${key}" Value="${value}" />\n`;
    });
    
    parametersXml += '</AlgorithmParameters>';
    
    if (parametersRegex.test(xmlContent)) {
      xmlContent = xmlContent.replace(parametersRegex, parametersXml);
    } else {
      // If AlgorithmParameters doesn't exist, add after AlgorithmType
      xmlContent = xmlContent.replace(/<\/AlgorithmType>/, '</AlgorithmType>\n' + parametersXml);
    }
    
    await saveXMLFile(filePath, xmlContent);
    return true;
  } catch (error) {
    console.error("Error updating algorithm parameters:", error);
    throw error;
  }
};

/**
 * Updates objective function in task XML
 * @param {string} taskName - Name of the task
 * @param {string} objectiveFunction - Objective function to set
 * @returns {Promise<void>}
 */
export const updateObjectiveFunction = async (taskName, objectiveFunction) => {
  try {
    const filePath = `/esogu_dataset/Info4Tasks/newesoguv32-${taskName.toLowerCase()}-ds1.xml`;
    let xmlContent = await readXMLFile(filePath);
    
    // Update objective function
    const objFuncRegex = /<ObjectiveFunction Name="(.*?)"><\/ObjectiveFunction>/;
    xmlContent = xmlContent.replace(objFuncRegex, `<ObjectiveFunction Name="Min${objectiveFunction}"></ObjectiveFunction>`);
    
    await saveXMLFile(filePath, xmlContent);
    return true;
  } catch (error) {
    console.error("Error updating objective function:", error);
    throw error;
  }
};

/**
 * Updates charging strategy in Info4Vehicle.xml
 * @param {string} chargeStrategy - Charging strategy to set
 * @returns {Promise<void>}
 */
export const updateChargingStrategy = async (chargeStrategy) => {
  try {
    const filePath = '/esogu_dataset/Info4Vehicle/Info4Vehicle.xml';
    let xmlContent = await readXMLFile(filePath);
    
    // Determine strategy value
    let strategyValue;
    switch (chargeStrategy) {
      case 'Full':
        strategyValue = 'FullCharge';
        break;
      case 'Partial':
        strategyValue = 'PartialCharge';
        break;
      case '%20-%80':
        strategyValue = 'RangeCharge';
        break;
      default:
        strategyValue = 'FullCharge';
    }
    
    // Update charging strategy
    const strategyRegex = /<ChargingStrategy>(.*?)<\/ChargingStrategy>/;
    xmlContent = xmlContent.replace(strategyRegex, `<ChargingStrategy>${strategyValue}</ChargingStrategy>`);
    
    await saveXMLFile(filePath, xmlContent);
    return true;
  } catch (error) {
    console.error("Error updating charging strategy:", error);
    throw error;
  }
};
