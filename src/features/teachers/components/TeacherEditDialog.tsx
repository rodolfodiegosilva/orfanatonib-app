import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Alert,
  Box,
  Typography,
  Stack,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { TeacherProfile } from "../types";

type Props = {
  open: boolean;
  teacher: TeacherProfile | null;
  loading: boolean;
  error: string;
  onSetShelter: (shelterNumber: number) => void;
  onClearShelter: () => void;
  onClose: () => void;
};

export default function TeacherEditDialog({
  open,
  teacher,
  loading,
  error,
  onSetShelter,
  onClearShelter,
  onClose,
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const [shelterInput, setShelterInput] = React.useState<string>("");
  const [localErr, setLocalErr] = React.useState<string>("");

  React.useEffect(() => {
    setShelterInput(teacher?.shelter?.number ? String(teacher.shelter.number) : "");
    setLocalErr("");
  }, [teacher]);

  const submit = React.useCallback(() => {
    setLocalErr("");
    const v = Number(shelterInput);
    if (!shelterInput || Number.isNaN(v) || v <= 0) {
      setLocalErr("Informe um número de Shelterinho válido (maior que zero).");
      return;
    }
    onSetShelter(v);
  }, [shelterInput, onSetShelter]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      submit();
    }
  };

  const currentShelterLabel =
    teacher?.shelter?.number != null ? `#${teacher.shelter.number}` : "—";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Vincular / Desvincular Shelterinho</DialogTitle>

      <DialogContent
        dividers
        sx={{ p: { xs: 2, md: 3 }, position: "relative" }}
      >
        {(error || localErr) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || localErr}
          </Alert>
        )}

        {!!teacher && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography
                component="div"
                sx={{ fontWeight: 700, lineHeight: 1.3 }}
              >
                {teacher.user?.name || teacher.user?.email || "—"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Shelterinho atual: <strong>{currentShelterLabel}</strong>
              </Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                label="Número do Shelterinho"
                type="number"
                size="small"
                fullWidth
                value={shelterInput}
                onChange={(e) => setShelterInput(e.target.value)}
                onKeyDown={handleKeyDown}
                inputProps={{ min: 1 }}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">#</InputAdornment>
                  ),
                }}
                helperText={
                  teacher?.shelter?.number
                    ? `Digite um novo número para alterar o vínculo`
                    : `Digite o número do Shelterinho para vincular`
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack
                direction={isXs ? "row" : "column"}
                spacing={1}
                sx={{ height: "100%", alignItems: "stretch", justifyContent: "center" }}
              >
                <Button
                  variant="contained"
                  onClick={submit}
                  disabled={loading || !shelterInput}
                >
                  Vincular
                </Button>
                <Button
                  color="warning"
                  variant="outlined"
                  onClick={onClearShelter}
                  disabled={loading}
                >
                  Desvincular
                </Button>
              </Stack>
            </Grid>
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
      </DialogActions>
    </Dialog>
  );
}
