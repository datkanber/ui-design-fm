import React from "react";
import { Card, CardContent, Typography, List, ListItem, Box, Chip } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import { keyframes, styled } from "@mui/system";

const statusColors = {
  Requested: "#FFC107", // Sarı
  "On the way": "#2196F3", // Mavi
  Delivered: "#4CAF50", // Yeşil
  Cancelled: "#F44336", // Kırmızı
};

// **Yanıp Sönme Animasyonu** (Bekleyen ve İptal edilen siparişler için)
const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
`;

const BlinkingCircle = styled(CircleIcon)(({ status }) => ({
  color: statusColors[status],
  fontSize: "1.3rem",
  animation: status === "Requested" || status === "Cancelled" ? `${blink} 1.32s infinite` : "none",
}));

export default function CustomerPool({ customers }) {
  return (
    <Card
      sx={{
        borderRadius: "14px",
        padding: "19px",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
        border: "1px solid #E0E0E0",
        height: "681px", // 📌 Sabit yükseklik ayarı
        width: "100%",
        maxWidth: "750px", // 📌 Optimum genişlik ayarı
        margin: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ flex: "0 1 auto", paddingBottom: "16px" }}>
        {/* **Başlık** */}
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            color: "#222",
            fontWeight: 700,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "8px",
          }}
        >
          Customer Pool
        </Typography>

        {/* **Statü Etiketleri** */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            padding: "1px",
            backgroundColor: "#F9F9F9",
            borderRadius: "10px",
            fontWeight: 600,
            marginBottom: "10px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          {Object.keys(statusColors).map((status) => (
            <Box key={status} display="flex" alignItems="center" gap={1}>
              <CircleIcon sx={{ color: statusColors[status], fontSize: "1.2rem" }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#444" }}>
                {status}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>

      {/* 📌 **Kaydırılabilir İçerik** */}
      <Box sx={{ flex: "1 1 auto", overflowY: "auto", padding: "0 10px", scrollbarWidth: "thin", scrollbarColor: "#999 #ddd" }}>
        <List sx={{ paddingRight: "5px" }}>
          {customers.map((customer, index) => (
            <ListItem key={index} divider sx={{ padding: "8px 0" }}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="start"
                justifyContent="space-between"
                width="100%"
                sx={{
                  padding: "4px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "10px",
                  borderLeft: `5px solid ${statusColors[customer.status]}`,
                  boxShadow: "0 1px 6px rgba(0, 0, 0, 0.06)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": { boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)" },
                }}
              >
                {/* **Başlık ve Statü** */}
                <Box display="flex" alignItems="center" width="100%" justifyContent="space-between">
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#222", fontSize: "1rem" }}>
                    {customer.name} <span style={{ fontWeight: "500", color: "#666" }}>(Brand: {customer.brand})</span>
                  </Typography>
                  <Chip
                    label={customer.status}
                    sx={{
                      backgroundColor: statusColors[customer.status],
                      color: "#fff",
                      fontWeight: 600,
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      padding: "4px 8px",
                    }}
                  />
                </Box>

                {/* **Müşteri Bilgileri** */}
                <Typography variant="body2" sx={{ color: "#555", lineHeight: "1.5", marginTop: "5px" }}>
                  <BlinkingCircle status={customer.status} /> <strong>📍 Location:</strong> {customer.address} <br />
                  <strong>📦 Demand:</strong> {customer.demand} kg <br />
                  <strong>🗓 Order Date:</strong> {customer.orderDate} <br />
                  <strong>⏳ Time Window:</strong> {customer.timeWindow}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </Card>
  );
}
