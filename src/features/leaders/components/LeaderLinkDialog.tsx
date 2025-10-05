import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Alert, Box, Typography, Stack,
  FormControl, InputLabel, Select, MenuItem, Chip, useMediaQuery, useTheme
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { LeaderProfile, ShelterSimple } from "../types";

type Props = {
  open: boolean;
  leader: LeaderProfile | null;
  shelters: ShelterSimple[];
  onSetShelter: (shelterId: string) => void;
  onClearShelter: () => void;
  loading: boolean;
  error: string;
  onClose: () => void;
};

export default function LeaderLinkDialog({
  open, leader, shelters, onSetShelter, onClearShelter, loading, error, onClose,
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const [selectedShelterId, setSelectedShelterId] = React.useState<string>("");
  const [localErr, setLocalErr] = React.useState<string>("");

  React.useEffect(() => {
    setSelectedShelterId("");
    setLocalErr("");
  }, [leader]);

  const hasShelter = !!leader?.shelter;
  const currentShelterName = leader?.shelter?.name ?? "—";

  const handleVincular = React.useCallback(() => {
    setLocalErr("");
    if (!selectedShelterId) {
      setLocalErr("Selecione um abrigo para vincular.");
      return;
    }
    onSetShelter(selectedShelterId);
  }, [selectedShelterId, onSetShelter]);

  const handleDesvincular = React.useCallback(() => {
    setLocalErr("");
    onClearShelter();
  }, [onClearShelter]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          width: { xs: "98%", sm: "auto" },
          maxWidth: { xs: "98%", sm: "600px" },
          margin: { xs: "8px", sm: "32px" },
        }
      }}
    >
      <DialogTitle>
        {hasShelter ? "Desvincular Abrigo" : "Vincular Abrigo"}
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, md: 3 }, position: "relative" }}>
        {(error || localErr) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || localErr}
          </Alert>
        )}

        {!!leader && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography
                component="div"
                sx={{ fontWeight: 700, lineHeight: 1.3 }}
              >
                {leader.user?.name || leader.user?.email || "—"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Abrigo atual: <strong>{currentShelterName}</strong>
              </Typography>
            </Grid>

            {hasShelter ? (
              // Já tem abrigo - só desvincular
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "grey.300",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Este líder já está vinculado ao abrigo <strong>{currentShelterName}</strong>.
                    Clique em "Desvincular" para remover o vínculo.
                  </Typography>
                </Box>
              </Grid>
            ) : (
              // Não tem abrigo - selecionar para vincular
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Selecionar Abrigo</InputLabel>
                  <Select
                    value={selectedShelterId}
                    onChange={(e) => setSelectedShelterId(e.target.value)}
                    label="Selecionar Abrigo"
                    disabled={loading}
                  >
                    {shelters.map((shelter) => (
                      <MenuItem key={shelter.id} value={shelter.id}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip 
                            size="small" 
                            label={shelter.name} 
                            color="primary" 
                            variant="outlined"
                          />
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        )}

        {loading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(255,255,255,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <CircularProgress size={28} />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ color: "text.secondary" }}>
          Fechar
        </Button>
        {hasShelter ? (
          <Button
            color="warning"
            variant="contained"
            onClick={handleDesvincular}
            disabled={loading}
          >
            Desvincular
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleVincular}
            disabled={loading || !selectedShelterId}
          >
            Vincular
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
