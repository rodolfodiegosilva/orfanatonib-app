import * as React from "react";
import {
  Box, Alert, Grid, Paper, TextField, InputAdornment,
  Typography, CircularProgress, Button, Fab, IconButton, Tooltip,
  useMediaQuery, useTheme
} from "@mui/material";
import { Search, PersonAdd, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store/slices";

import { useShelteredBrowser } from "./hooks";
import ShelteredCard from "./components/ShelteredCard";
import { CreateShelteredForm, EditShelteredForm, ShelteredResponseDto } from "../sheltered/types";
import { useShelteredMutations } from "../sheltered/hooks";
import ShelteredFormDialog from "../sheltered/components/ShelteredFormDialog";
import { apiFetchSheltered } from "../sheltered/api";

export default function ShelteredBrowserPage() {
  const nav = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const shelter = useSelector((state: RootState) => (state.auth as any).user?.teacherProfile?.shelter);

  const {
    items,
    loading,
    error,
    setError,
    refetch,
  } = shelter ? useShelteredBrowser() : { items: [], loading: false, error: "", setError: () => { }, refetch: () => { } };

  const [query, setQuery] = React.useState("");
  const filteredItems = React.useMemo(() => {
    const s = query.trim().toLowerCase();
    if (!s) return items;
    return items.filter((c) => {
      const name = c.name?.toLowerCase() ?? "";
      const gname = c.guardianName?.toLowerCase() ?? "";
      const gphone = c.guardianPhone?.toLowerCase() ?? "";
      return name.includes(s) || gname.includes(s) || gphone.includes(s);
    });
  }, [items, query]);

  const [creating, setCreating] = React.useState<CreateShelteredForm | null>(null);
  const [editing, setEditing] = React.useState<EditShelteredForm | null>(null);

  const {
    dialogLoading,
    dialogError,
    setDialogError,
    createSheltered,
    updateSheltered,
  } = useShelteredMutations(async () => {
    await refetch();
  });

  const openCreate = () =>
    setCreating({
      name: "",
      gender: "M",
      guardianName: "",
      guardianPhone: "",
      birthDate: "",
      joinedAt: null,
      shelterId: null,
      address: { street: "", district: "", city: "", state: "", postalCode: "" } as any,
    });

  const submitCreate = async () => {
    if (!creating) return;
    const payload = { ...creating };
    if (!payload.joinedAt) payload.joinedAt = null;
    if (!payload.shelterId) payload.shelterId = null as any;

    try {
      await createSheltered(payload, 1, 12);
      setCreating(null);
      setDialogError("");
    } catch { }
  };

  const openEdit = async (shelteredId: string) => {
    try {
      const full: ShelteredResponseDto = await apiFetchSheltered(shelteredId);
      setEditing({
        id: full.id,
        name: full.name ?? "",
        gender: (full.gender as any) ?? "M",
        guardianName: full.guardianName ?? "",
        guardianPhone: full.guardianPhone ?? "",
        birthDate: full.birthDate ?? "",
        joinedAt: (full as any).joinedAt ?? null,
        shelterId: (full as any)?.shelter?.id ?? null,
        address: full.address
          ? {
            street: full.address.street ?? "",
            number: (full.address as any).number ?? "",
            district: full.address.district ?? "",
            city: full.address.city ?? "",
            state: full.address.state ?? "",
            postalCode: full.address.postalCode ?? "",
            complement: (full.address as any).complement ?? "",
          }
          : { street: "", number: "", district: "", city: "", state: "", postalCode: "", complement: "" } as any,
      });
      setDialogError("");
    } catch (e: any) {
      setDialogError(e?.response?.data?.message || e?.message || "Não foi possível abrir a criança para edição");
    }
  };

  const submitEdit = async () => {
    if (!editing) return;
    const { id, ...rest } = editing;
    try {
      await updateSheltered(id, rest, 1, 12);
      setEditing(null);
      setDialogError("");
    } catch { }
  };

  React.useEffect(() => {
    document.title = "Lançar Pagela • Selecionar Criança";
  }, []);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        pt: { xs: 2, md: 4 },
        pb: { xs: 2, md: 4 },
        minHeight: "100vh",
        bgcolor: "#f6f7f9"
      }}
    >
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          {isXs && (
            <Tooltip title="Voltar">
              <IconButton
                onClick={() => nav(-1)}
                aria-label="Voltar para a página anterior"
                sx={{
                  mr: 0.5,
                  bgcolor: "white",
                  boxShadow: 1,
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <ArrowBack />
              </IconButton>
            </Tooltip>
          )}

          <Typography
            component="h1"
            variant="h5"
            fontWeight={900}
            sx={{ color: "#143a2b", fontSize: { xs: "1.25rem", md: "1.75rem" } }}
          >
            Área das crianças
          </Typography>

          {shelter && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: { xs: "none", md: "block" } }}
            >
              Toque em uma criança para abrir suas pagelas
            </Typography>

          )}
        </Box>

        {shelter && (
          <Button
            onClick={openCreate}
            startIcon={<PersonAdd />}
            variant="contained"
            sx={{ display: { xs: "none", md: "inline-flex" } }}
          >
            Adicionar criança
          </Button>
        )}
      </Box>

      {shelter && (
        <Fab
          color="primary"
          aria-label="Adicionar criança"
          onClick={openCreate}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            display: { xs: "flex", md: "none" },
            zIndex: 1300,
          }}
        >
          <PersonAdd />
        </Fab>
      )}

      {!shelter ? (
        <Alert severity="warning" sx={{ mt: 4 }}>
          <Typography fontWeight="bold">
            Você não está vinculado a nenhum shelterinho.
          </Typography>
          <Typography>
            Entre em contato com <strong>seu Coordenador</strong> ou envie uma mensagem para  <strong>(92) 99127-4881</strong> ou <strong>(92) 98155-3139</strong>.
          </Typography>
        </Alert>
      ) : (
        <>
          <Paper
            elevation={0}
            sx={{ p: 2, mb: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}
          >
            <Typography variant="h6" fontWeight={900} sx={{ mb: 1, color: "#143a2b" }}>
              Selecionar Criança
            </Typography>
            <TextField
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              size="small"
              fullWidth
              placeholder="Buscar por nome ou telefone do responsável…"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {loading && !items.length ? (
            <Box textAlign="center" my={6}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
              {filteredItems.map((sheltered) => (
                <Grid key={sheltered.id} item xs={12} sm={6} md={4} lg={3} xl={2.4 as any}>
                  <ShelteredCard
                    sheltered={sheltered}
                    onClick={(c) => nav(`/area-das-criancas/${c.id}`, { state: { sheltered: c } })}
                    onEdit={(c) => openEdit(c.id)}
                    onRefresh={refetch}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <ShelteredFormDialog
        mode="create"
        open={!!creating}
        value={creating}
        onChange={(v) => setCreating(v as CreateShelteredForm)}
        onCancel={() => {
          setCreating(null);
          setDialogError("");
        }}
        onSubmit={submitCreate}
        error={dialogError}
        loading={dialogLoading}
      />

      <ShelteredFormDialog
        mode="edit"
        open={!!editing}
        value={editing}
        onChange={(v) => setEditing(v as EditShelteredForm)}
        onCancel={() => {
          setEditing(null);
          setDialogError("");
        }}
        onSubmit={submitEdit}
        error={dialogError}
        loading={dialogLoading}
      />
    </Box>
  );
}
