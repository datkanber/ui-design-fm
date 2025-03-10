require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const customerRoutes = require('./routes/customerRoutes');
const routePlanRoutes = require('./routes/routePlanRoutes');
const vehicleRoutes = require("./routes/vehicleRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// 📌 MongoDB'ye bağlan
connectDB();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('✅ Backend is running!');
});

// 📌 API Rotalarını Kullan
app.use('/api/customers', customerRoutes);
app.use('/api/routes', routePlanRoutes);
app.use("/api/vehicles", vehicleRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`);
});
