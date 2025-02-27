// ========================
// İhtiyaç Duyulan Modüller
// ========================
require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');

// ========================
// Uygulama Başlatma
// ========================
const app = express();

// ========================
// Ortam Değişkenleri
// ========================
const PORT = process.env.PORT || 5000;

// ========================
// .env Kontrolü
// ========================
if (!PORT) {
    console.warn("⚠️ UYARI: PORT ortam değişkeni bulunamadı, varsayılan 5000 kullanılacak.");
}

// ========================
// Middleware'ler
// ========================
app.use(express.json());
app.use(cors());

// ========================
// ✅ Ana Sayfa (Test Route)
// ========================
app.get('/', (req, res) => {
    res.send('✅ Backend is running!');
});

// ========================
// ✅ Sunucuyu Başlat
// ========================
app.listen(PORT, () => {
    console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`);
});
