const Customer = require("../models/Customer");

// 📌 Tüm müşterileri getir
const getAllCustomers = async () => {
  return await Customer.find();
};

// 📌 Belirli bir müşteriyi getir
const getCustomerById = async (id) => {
  return await Customer.findById(id);
};

// 📌 Yeni müşteri ekle
const addCustomer = async (data) => {
  const newCustomer = new Customer(data);
  return await newCustomer.save();
};

// 📌 Müşteri güncelle
const updateCustomer = async (id, data) => {
  return await Customer.findByIdAndUpdate(id, data, { new: true });
};

// 📌 Müşteriyi sil
const deleteCustomer = async (id) => {
  return await Customer.findByIdAndDelete(id);
};

module.exports = { getAllCustomers, getCustomerById, addCustomer, updateCustomer, deleteCustomer };
