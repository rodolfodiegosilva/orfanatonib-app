import React from "react";
import {
  Paper,
  Grid,
  TextField,
  Stack,
  Button,
  Tooltip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Fab,
} from "@mui/material";
import { Clear, Refresh } from "@mui/icons-material";
import type { LeaderFilters } from "../types";

type Props = {
  filters: LeaderFilters;
  onChange: (updater: (prev: LeaderFilters) => LeaderFilters) => void;
  onRefresh: () => void;
  isXs?: boolean;
};

export default function LeaderToolbar({
  filters,
  onChange,
  onRefresh,
  isXs,
}: Props) {
  const set = <K extends keyof LeaderFilters>(
    key: K,
    val: LeaderFilters[K]
  ) => onChange((prev) => ({ ...prev, [key]: val }));

  const clear = () =>
    onChange(() => ({
      leaderSearchString: "",
      shelterSearchString: "",
      hasShelter: undefined,
    }));

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
        {/* Busca por Líder */}
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Busca por Líder"
            value={filters.leaderSearchString ?? ""}
            onChange={(e) => set("leaderSearchString", e.target.value || undefined)}
            placeholder="Nome, email, telefone do líder"
            inputProps={{ "aria-label": "Campo de busca por líder" }}
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
            onChange={(e) => set("shelterSearchString", e.target.value || undefined)}
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
          <FormControl fullWidth size="small">
            <InputLabel id="has-shelter-label">Vínculo</InputLabel>
            <Select
              labelId="has-shelter-label"
              label="Vínculo"
              value={filters.hasShelter ?? "all"}
              onChange={(e) => {
                const value = e.target.value;
                let hasShelterValue: boolean | undefined;
                
                if (value === "all") {
                  hasShelterValue = undefined;
                } else if (value === "true") {
                  hasShelterValue = true;
                } else if (value === "false") {
                  hasShelterValue = false;
                }
                
                set("hasShelter", hasShelterValue);
              }}
              sx={{
                borderRadius: 2,
              }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="true">Com abrigo</MenuItem>
              <MenuItem value="false">Sem abrigo</MenuItem>
            </Select>
          </FormControl>
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
                onClick={clear}
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
                  onClick={onRefresh} 
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
              onClick={onRefresh}
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
              onClick={clear}
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
