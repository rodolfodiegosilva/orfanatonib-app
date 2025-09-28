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
  Fab,
  Typography,
} from "@mui/material";
import { Add, Refresh, CleaningServices } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { ShelterFilters } from "../types";
import { selectIsAdmin } from "@/store/selectors/routeSelectors";

type Props = {
  filters: ShelterFilters;
  onChange: (updater: (prev: ShelterFilters) => ShelterFilters) => void;
  onCreateClick: () => void;
  onRefreshClick: () => void;
  isXs?: boolean;
};

export default function SheltersToolbar({
  filters,
  onChange,
  onCreateClick,
  onRefreshClick,
  isXs,
}: Props) {
  const isAdmin = useSelector(selectIsAdmin);

  const handleChange = <K extends keyof ShelterFilters>(
    key: K,
    value: ShelterFilters[K]
  ) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    onChange(() => ({
      shelterSearchString: "",
      userSearchString: "",
      addressSearchString: "",
    }));
  };

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        mb: 2,
        borderRadius: 3,
      }}
      elevation={3}
    >
      <Typography
        variant="subtitle1"
        fontWeight={700}
        sx={{ mb: 2, color: "text.primary" }}
      >
        Pesquisar
      </Typography>

      <Grid container spacing={{ xs: 1.5, md: 2 }} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Shelterinho"
            value={filters.shelterSearchString ?? ""}
            onChange={(e) => handleChange("shelterSearchString", e.target.value)}
            placeholder="Número, dia ou horário (ex.: 14:30)"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Professor/Coordenador"
            value={filters.userSearchString ?? ""}
            onChange={(e) => handleChange("userSearchString", e.target.value)}
            placeholder="Nome, e-mail ou telefone"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Endereço"
            value={filters.addressSearchString ?? ""}
            onChange={(e) => handleChange("addressSearchString", e.target.value)}
            placeholder="Rua, bairro ou cidade"
          />
        </Grid>

        <Grid item xs={12}>
          {isXs ? (
            <>
              <Box sx={{ height: 64 }} />
              <Box
                sx={{
                  position: "fixed",
                  bottom: 16,
                  right: 16,
                  zIndex: 9999,
                }}
              >
                <Stack spacing={1} alignItems="flex-end">
                  <Tooltip title="Limpar filtros">
                    <Fab
                      size="small"
                      color="secondary"
                      aria-label="Limpar filtros"
                      onClick={handleClear}
                      sx={{ boxShadow: 6 }}
                    >
                      <CleaningServices fontSize="small" />
                    </Fab>
                  </Tooltip>

                  <Tooltip title="Recarregar">
                    <Fab
                      size="small"
                      aria-label="Recarregar"
                      onClick={onRefreshClick}
                      sx={{ boxShadow: 6 }}
                    >
                      <Refresh fontSize="small" />
                    </Fab>
                  </Tooltip>

                  {isAdmin && (
                    <Tooltip title="Criar Shelterinho">
                      <Fab
                        color="primary"
                        aria-label="Criar Shelterinho"
                        onClick={onCreateClick}
                        sx={{ boxShadow: 6 }}
                      >
                        <Add />
                      </Fab>
                    </Tooltip>
                  )}
                </Stack>
              </Box>
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
                startIcon={<CleaningServices />}
                onClick={handleClear}
              >
                Limpar
              </Button>

              <Tooltip title="Recarregar">
                <IconButton onClick={onRefreshClick}>
                  <Refresh />
                </IconButton>
              </Tooltip>

              {isAdmin && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={onCreateClick}
                >
                  Criar
                </Button>
              )}
            </Stack>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
