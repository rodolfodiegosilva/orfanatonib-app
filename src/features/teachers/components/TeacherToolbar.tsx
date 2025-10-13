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
  teacherSearchString?: string;
  shelterSearchString?: string;
  hasShelter?: boolean;
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

  const handleClear = () => {
    onChange(() => ({
      teacherSearchString: "",
      shelterSearchString: "",
      hasShelter: undefined,
    }));
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 2, md: 3 }, 
        mb: 2, 
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper"
      }}
    >
      <Grid container spacing={{ xs: 2, md: 2.5 }} alignItems="flex-end">
        {/* Busca por Professor */}
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Busca por Professor"
            value={filters.teacherSearchString ?? ""}
            onChange={(e) => handleChange("teacherSearchString", e.target.value || undefined)}
            placeholder="Nome, email, telefone do professor"
            inputProps={{ "aria-label": "Campo de busca por professor" }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              }
            }}
          />
        </Grid>

        {/* Busca por Abrigo */}
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Busca por Abrigo"
            value={filters.shelterSearchString ?? ""}
            onChange={(e) => handleChange("shelterSearchString", e.target.value || undefined)}
            placeholder="Todos os campos do abrigo"
            inputProps={{ "aria-label": "Campo de busca por abrigo" }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              }
            }}
          />
        </Grid>

        {/* Filtro de Vínculo */}
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            select
            fullWidth
            size="small"
            label="Vínculo"
            value={
              filters.hasShelter === undefined ? "" : filters.hasShelter ? "true" : "false"
            }
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                handleChange("hasShelter", undefined);
              } else {
                handleChange("hasShelter", value === "true");
              }
            }}
            sx={{
              borderRadius: 2,
            }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="true">Com abrigo</MenuItem>
            <MenuItem value="false">Sem abrigo</MenuItem>
          </TextField>
        </Grid>

        {/* Botões de Ação */}
        <Grid item xs={12} sm={6} md={2}>
          {isXs ? (
            <Box sx={{ height: 40 }} />
          ) : (
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<Clear />}
                onClick={handleClear}
                size="small"
                sx={{ 
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2
                }}
              >
                Limpar
              </Button>
              <Tooltip title="Recarregar dados">
                <IconButton 
                  onClick={onRefreshClick} 
                  aria-label="Recarregar"
                  sx={{
                    borderRadius: 2,
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { 
                      bgcolor: "primary.dark",
                      transform: "scale(1.05)"
                    },
                    transition: "all 0.2s ease-in-out"
                  }}
                >
                  <Refresh fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Grid>
      </Grid>

      {/* FABs para Mobile */}
      {isXs && (
        <Box
          sx={{
            position: "fixed",
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
            right: "calc(env(safe-area-inset-right, 0px) + 16px)",
            zIndex: 1300,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Tooltip title="Recarregar dados" placement="left">
            <Fab
              size="medium"
              aria-label="Recarregar"
              onClick={onRefreshClick}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                boxShadow: 4,
                "&:hover": { 
                  bgcolor: "primary.dark",
                  transform: "scale(1.05)"
                },
                transition: "all 0.2s ease-in-out"
              }}
            >
              <Refresh />
            </Fab>
          </Tooltip>
          
          <Tooltip title="Limpar filtros" placement="left">
            <Fab
              size="medium"
              color="secondary"
              aria-label="Limpar filtros"
              onClick={handleClear}
              sx={{
                boxShadow: 4,
                "&:hover": { 
                  transform: "scale(1.05)"
                },
                transition: "all 0.2s ease-in-out"
              }}
            >
              <Clear />
            </Fab>
          </Tooltip>
        </Box>
      )}
    </Paper>
  );
}
