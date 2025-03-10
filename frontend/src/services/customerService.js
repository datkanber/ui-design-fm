import axios from "axios";

const API_URL = "http://localhost:5000/api/customers";

// 📌 Tüm müşterileri getir
export const getCustomers = async () => {
  try {
    const response = await axios.get(API_URL);
    console.log("Müşteri Verileri:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Fetch Error:", error.response?.data || error.message);
    return [];
  }
};
