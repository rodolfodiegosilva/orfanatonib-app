import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Divider,
  Typography, Alert, TextField, FormControl, InputLabel, Select, MenuItem,
  useTheme, useMediaQuery
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import AddressFields from "./form/AddressFields";
import LeaderSelect from "./form/LeaderSelect";
import TeachersSelect from "./form/TeachersSelect";
import {
  LeaderOption, CreateShelterForm, EditShelterForm, TeacherOption
} from "./types";
import { useSelector } from "react-redux";
import { selectIsAdmin } from "@/store/selectors/routeSelectors";

type Props = {
  mode: "create" | "edit";
  open: boolean;
  value: CreateShelterForm | EditShelterForm | null;
  onChange: (val: CreateShelterForm | EditShelterForm) => void;
  onCancel: () => void;
  onSubmit: () => void;
  error: string;
  loading: boolean;
  leaderOptions: LeaderOption[];
  teacherOptions: TeacherOption[];
};

export default function ShelterFormDialog({
  mode, open, value, onChange, onCancel, onSubmit,
  error, loading, leaderOptions, teacherOptions,
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const teachersKey = React.useMemo(
    () => (teacherOptions ?? [])
      .map(t => `${t.teacherProfileId}:${t.vinculado ? 1 : 0}`)
      .join("|"),
    [teacherOptions]
  );
  const isAdmin = useSelector(selectIsAdmin);
  const isCreate = mode === "create";

  if (!value) return null;

  const teachers = (value as any).teacherProfileIds ?? [];
  const coord = (value as any).leaderProfileId ?? null;
  const name = (value as any).name ?? "";

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          width: isXs ? "98vw" : undefined,
          maxWidth: isXs ? "98vw" : undefined,
          m: isXs ? 0 : undefined,
        },
      }}
    >
      <DialogTitle>{isCreate ? "Criar Abrigo" : "Editar Abrigo"}</DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Nome do Abrigo"
              type="text"
              fullWidth
              value={name}
              onChange={(e) => onChange({ ...value, name: e.target.value } as any)}
              placeholder="Ex: Abrigo Central 1"
            />
          </Grid>

          {isAdmin && (
            <Grid item xs={12} md={12}>
              <LeaderSelect
                value={coord}
                options={leaderOptions}
                onChange={(val) =>
                  onChange({ ...value, leaderProfileId: val } as any)
                }
              />
            </Grid>
          )}

          <Grid item xs={12}><Divider /></Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={700}>Endereço</Typography>
          </Grid>
          <AddressFields
            value={(value as any).address ?? {}}
            onChange={(addr) => onChange({ ...value, address: addr } as any)}
          />

          <Grid item xs={12}><Divider /></Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={700}>Professores</Typography>
          </Grid>
          <Grid item xs={12}>
            <TeachersSelect
              key={teachersKey}
              value={teachers}
              options={teacherOptions}
              onChange={(ids) =>
                onChange({ ...value, teacherProfileIds: ids } as any)
              }
            />
          </Grid>
        </Grid>

        {loading && (
          <Typography align="center" sx={{ mt: 2 }}>
            <CircularProgress size={24} />
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} sx={{ color: "text.secondary" }}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {isCreate ? "Criar" : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
