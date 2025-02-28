import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function VehicleEditDialog({ open, onClose, vehicle, onSave }) {
  const [updatedVehicle, setUpdatedVehicle] = useState(vehicle || {});

  useEffect(() => {
    setUpdatedVehicle(vehicle || {}); // vehicle null ise boş nesne ata
  }, [vehicle]);

  const handleChange = (event) => {
    setUpdatedVehicle({
      ...updatedVehicle,
      [event.target.name]: event.target.value,
    });
  };

  const handleSave = () => {
    onSave(updatedVehicle);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Araç Bilgilerini Düzenle
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label="Araç Adı"
          name="name"
          value={updatedVehicle.name || ""}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label="SOC (%)"
          name="soc"
          type="number"
          value={updatedVehicle.soc || ""}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Hız (m/s)"
          name="velocity"
          type="number"
          value={updatedVehicle.velocity || ""}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Yük Kapasitesi"
          name="payload"
          type="number"
          value={updatedVehicle.payload || ""}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          İptal
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
}
