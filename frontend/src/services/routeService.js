import axios from 'axios';

const API_URL = 'http://localhost:5000/api/routes';

export const getRoutes = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('API Fetch Error:', error.response?.data || error.message);
    return [];
  }
};
