const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const mongoURI = "mongodb+srv://burak2kanber:ploW4nuSpzwXakhM@cluster0.on8m7.mongodb.net/RouteManagementDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Atlas bağlantısı başarılı!"))
.catch(err => console.error("MongoDB bağlantı hatası:", err));

// Alert Schema ve Model
const alertSchema = new mongoose.Schema({
    type: String,
    message: String,
    source: String,
    timestamp: { type: Date, default: Date.now },
    detail: String,
    resolved: { type: Boolean, default: false } // Yeni alan eklendi
  });
  

const Alert = mongoose.model("Alert", alertSchema);

// **Tüm Uyarıları Getir**
app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await Alert.find(); // MongoDB'den tüm uyarıları çek
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Veriler alınırken hata oluştu." });
    }
  });
  

// **Yeni Uyarı Ekle**
app.post("/api/alerts", async (req, res) => {
  try {
    const newAlert = new Alert(req.body);
    await newAlert.save();
    res.status(201).json(newAlert);
  } catch (error) {
    res.status(400).json({ error: "Uyarı eklenirken hata oluştu." });
  }
});

// **Uyarıyı Çözümle**
app.patch("/api/alerts/:id", async (req, res) => {
    try {
      const updatedAlert = await Alert.findByIdAndUpdate(
        req.params.id,
        { $set: req.body }, // Değerleri güvenli bir şekilde güncelle
        { new: true, runValidators: true } // Yeni veriyi döndür ve doğrulama yap
      );
  
      if (!updatedAlert) {
        return res.status(404).json({ error: "Uyarı bulunamadı" });
      }
  
      res.json(updatedAlert);
    } catch (error) {
      console.error("Uyarı güncelleme hatası:", error);
      res.status(400).json({ error: "Uyarı güncellenirken hata oluştu." });
    }
  });
  

app.put("/api/alerts/:id/resolve", async (req, res) => {
    try {
      const updatedAlert = await Alert.findByIdAndUpdate(
        req.params.id, 
        { $set: { resolved: true } }, 
        { new: true, runValidators: true }
      );
        
      if (!updatedAlert) {
        return res.status(404).json({ error: "Uyarı bulunamadı" });
      }
        
      res.json(updatedAlert);
    } catch (error) {
      console.error("Uyarı çözümleme hatası:", error);
      res.status(500).json({ error: "Güncelleme sırasında hata oluştu." });
    }
  });
  
  

// **Uyarıyı Sil**
app.delete("/api/alerts/:id", async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ message: "Uyarı silindi" });
  } catch (error) {
    res.status(400).json({ error: "Uyarı silinirken hata oluştu." });
  }
});

// **Sunucuyu Başlat**
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
