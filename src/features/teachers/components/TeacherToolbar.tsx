import React from "react";
import {
  Button,
  IconButton,
  Tooltip,
  Grid,
  TextField,
  Paper,
  Stack,
  Box,
  MenuItem,
  Fab,
} from "@mui/material";
import { Refresh, Clear } from "@mui/icons-material";

export type TeacherFilters = {
  q?: string;
  active?: boolean;
  hasShelter?: boolean;
  shelterNumber?: number;
};

type Props = {
  filters: TeacherFilters;
  onChange: (updater: (prev: TeacherFilters) => TeacherFilters) => void;
  onRefreshClick: () => void;
  isXs?: boolean;
};

export default function TeacherToolbar({
  filters,
  onChange,
  onRefreshClick,
  isXs,
}: Props) {
  const handleChange = <K extends keyof TeacherFilters>(
    key: K,
    value: TeacherFilters[K]
  ) => onChange((prev) => ({ ...prev, [key]: value }));

  const handleHasShelterChange = (v: string) =>
    handleChange("hasShelter", v === "" ? undefined : (v === "true") as any);

  const handleShelterNumberChange = (v: string) =>
    handleChange("shelterNumber", v === "" ? undefined : Number(v));

  const handleClear = () => {
    onChange(() => ({
      q: "",
      active: undefined,
      hasShelter: undefined,
      shelterNumber: undefined,
    }));
  };

  return (
    <Paper sx={{ p: { xs: 1.5, md: 2 }, mb: 2 }}>
      <Grid container spacing={{ xs: 1.5, md: 2 }} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Buscar (nome, e-mail ou telefone)"
            value={filters.q ?? ""}
            onChange={(e) => handleChange("q", e.target.value)}
            placeholder="Ex.: Maria, maria@ex.com, (92) 9...."
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Com Shelterinho?"
            value={
              filters.hasShelter === undefined ? "" : filters.hasShelter ? "true" : "false"
            }
            onChange={(e) => handleHasShelterChange(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="true">Somente com Shelterinho</MenuItem>
            <MenuItem value="false">Somente sem Shelterinho</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Nº do Shelterinho"
            type="number"
            value={filters.shelterNumber ?? ""}
            onChange={(e) => handleShelterNumberChange(e.target.value)}
            inputProps={{ min: 1 }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          {isXs ? (
            <>
              <Fab
                color="secondary"
                aria-label="Limpar filtros"
                onClick={handleClear}
                sx={{
                  position: "fixed",
                  bottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)",
                  right: "calc(env(safe-area-inset-right, 0px) + 16px)",
                  zIndex: 9999,
                  boxShadow: 6,
                }}
              >
                <Clear />
              </Fab>

              <Fab
                aria-label="Recarregar"
                onClick={onRefreshClick}
                sx={{
                  position: "fixed",
                  bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
                  right: "calc(env(safe-area-inset-right, 0px) + 16px)",
                  zIndex: 9999,
                  bgcolor: "white",
                  boxShadow: 6,
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <Refresh />
              </Fab>
            </>
          ) : (
            <Stack
              direction="row"
              spacing={1.5}
              justifyContent="flex-end"
              alignItems="center"
            >
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Clear />}
                onClick={handleClear}
              >
                Limpar
              </Button>
              <Tooltip title="Recarregar">
                <IconButton onClick={onRefreshClick}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
