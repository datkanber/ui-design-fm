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

export default function RouteDetailPanel({ selectedRoute, open, onClose }) {
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
            <Typography variant="body1">
              <strong>Planned Distance:</strong> {selectedRoute.distance || "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>Planned Time:</strong> {selectedRoute.time || "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>Vehicle:</strong> {selectedRoute.vehicle || "N/A"}
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
