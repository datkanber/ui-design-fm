import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function FM_RouteDetailPanel({ selectedRoute, open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Başlık */}
      <DialogTitle>
        Route Details
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* İçerik */}
      <DialogContent dividers>
        {selectedRoute ? (
          <>
            {/* Planned Route Details */}
            <Typography variant="body1">
              <strong>Planned Distance:</strong> {selectedRoute.plannedDistance || "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>Planned Time:</strong> {selectedRoute.plannedTime || "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>Planned Vehicle:</strong> {selectedRoute.plannedVehicle || "N/A"}
            </Typography>

            {/* Actual Route Details */}
            <Typography variant="body1" style={{ marginTop: "16px" }}>
              <strong>Actual Distance:</strong> {selectedRoute.actualDistance || "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>Actual Time:</strong> {selectedRoute.actualTime || "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>Actual Vehicle:</strong> {selectedRoute.actualVehicle || "N/A"}
            </Typography>

            {/* Noktalar Listesi */}
            <Typography variant="h6" style={{ marginTop: "16px" }}>Point Details</Typography>
            {selectedRoute.points && selectedRoute.points.length > 0 ? (
              <List>
                {selectedRoute.points.map((point, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`${index + 1}. ${point}`} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No point details available.
              </Typography>
            )}
          </>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No route selected.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
