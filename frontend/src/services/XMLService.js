import axios from 'axios';

class XMLService {
  // XML dosyasından veri oku
  static async readXML(path) {
    try {
      const response = await axios.get(path);
      return response.data;
    } catch (error) {
      console.error(`Error reading XML from ${path}:`, error);
      throw error;
    }
  }

  // XML dosyasını kaydet
  static async saveXML(path, content) {
    try {
      const response = await axios.post('http://localhost:3001/save-xml', { path, content });
      return response.data;
    } catch (error) {
      console.error(`Error saving XML to ${path}:`, error);
      throw error;
    }
  }

  // XML string'ini parse et
  static parseXML(xmlString) {
    const parser = new DOMParser();
    return parser.parseFromString(xmlString, "text/xml");
  }

  // XML document'ını string'e dönüştür
  static serializeXML(xmlDoc) {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
  }
}

export default XMLService;
