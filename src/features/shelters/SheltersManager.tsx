import React, { useCallback, useState } from "react";
import { Alert, Box, CircularProgress, Container, Paper, Typography } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import SheltersToolbar from "./SheltersToolbar";
import SheltersTable from "./SheltersTable";
import ShelterViewDialog from "./ShelterViewDialog";
import ShelterFormDialog from "./ShelterFormDialog";
import { useShelterDetails, useShelterMutations, useShelters, useOptions } from "./hooks";
import {
  ShelterResponseDto,
  CreateShelterForm,
  EditShelterForm,
  ShelterFilters,
  ShelterSort,
} from "./types";
import { apiFetchShelters } from "./api";
import BackHeader from "@/components/common/header/BackHeader";
import DeleteConfirmDialog from "@/components/common/modal/DeleteConfirmDialog";
import { useSelector } from "react-redux";
import { selectIsAdmin } from "@/store/selectors/routeSelectors";

export default function SheltersManager() {
  const isAdmin = useSelector(selectIsAdmin);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const [filters, setFilters] = useState<ShelterFilters>({
    searchString: undefined,
    nameSearchString: undefined,
    leaderId: undefined,
  });

  const [pageSize, setPageSize] = useState<number>(12);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [sorting, setSorting] = useState<ShelterSort>({ id: "updatedAt", desc: true });

  const { rows, total, loading, error, setError, fetchPage } =
    useShelters(pageIndex, pageSize, sorting, filters);

  const doRefresh = useCallback(() => {
    fetchPage();
  }, [fetchPage]);

  const { viewing, setViewing, loading: viewingLoading, fetchShelter } = useShelterDetails();
  const handleOpenView = (shelter: ShelterResponseDto) => {
    setViewing(shelter);
    fetchShelter(shelter.id);
  };

  const { leaders, teachers, loading: optionsLoading, reloadOptions, loadRefs } = useOptions();

  const {
    dialogLoading,
    dialogError,
    setDialogError,
    createShelter,
    updateShelter,
    deleteShelter,
  } = useShelterMutations(async () => {
    // Recarregar dados após operações CRUD
    await fetchPage();
    await reloadOptions();
  });

  const sanitizeIds = (arr?: Array<string | null | undefined>) =>
    Array.from(
      new Set(
        (arr ?? []).filter(
          (v): v is string => typeof v === "string" && v.trim() !== ""
        )
      )
    );

  const [creating, setCreating] = useState<CreateShelterForm | null>(null);
  const openCreate = async () => {
    await loadRefs(); // Carrega opções apenas quando necessário
    setCreating({
      name: "",
      description: "",
      teamsQuantity: 1, // Campo obrigatório (número)
      address: {
        street: "",
        district: "",
        city: "",
        state: "",
        postalCode: "",
      } as any,
      mediaItem: undefined,
      file: undefined,
    });
  };

  const submitCreate = async () => {
    if (!creating) return;

    // Validação: teamsQuantity é obrigatório
    if (!creating.teamsQuantity || creating.teamsQuantity < 1) {
      setError("A quantidade de equipes é obrigatória e deve ser maior que 0");
      return;
    }

    const { file, ...rest } = creating as any;
    
    // Preparar payload limpo (removidos leaderProfileIds e teacherProfileIds - agora via Teams)
    const payload: any = {
      name: rest.name,
      description: rest.description,
      teamsQuantity: rest.teamsQuantity, // Campo obrigatório
      address: rest.address,
    };

    // Tratar mediaItem (3 cenários do guia)
    if (file) {
      // Cenário 1: Upload de arquivo (form-data)
      const formData = new FormData();
      
      // Seguindo formato do guia: shelterData como string JSON
      const shelterData = {
        name: payload.name,
        description: payload.description,
        teamsQuantity: payload.teamsQuantity, // Campo obrigatório
        address: payload.address,
        mediaItem: {
          title: rest.mediaItem?.title || "Foto do Abrigo",
          description: rest.mediaItem?.description || "Imagem do abrigo",
          uploadType: "UPLOAD",
        }
      };
      
      formData.append('shelterData', JSON.stringify(shelterData));
      formData.append('image', file); // Campo conforme documentação
      
      await createShelter(formData);
    } else if (rest.mediaItem?.url) {
      // Cenário 2: Link de URL (JSON)
      payload.mediaItem = {
        title: rest.mediaItem.title || "Foto do Abrigo",
        description: rest.mediaItem.description || "Imagem do abrigo",
        url: rest.mediaItem.url,
        uploadType: "link",
      };
      await createShelter(payload);
    } else {
      // Cenário 3: Sem imagem (JSON)
      await createShelter(payload);
    }

    setCreating(null);
  };

  const [editing, setEditing] = useState<EditShelterForm | null>(null);

  const startEdit = async (c: ShelterResponseDto) => {
    await loadRefs(); // Carrega opções apenas quando necessário
    setEditing({
      id: c.id,
      name: c.name,
      description: c.description || "",
      teamsQuantity: c.teamsQuantity || 1, // Campo obrigatório - usar valor atual ou padrão 1
      address: c.address,
      mediaItem: c.mediaItem ? {
        title: c.mediaItem.title,
        description: c.mediaItem.description,
        uploadType: c.mediaItem.uploadType,
        url: c.mediaItem.url,
        isLocalFile: c.mediaItem.isLocalFile,
      } : undefined,
      file: undefined,
    } as any);
  };

  const submitEdit = async () => {
    if (!editing) return;

    // Validação: teamsQuantity é obrigatório
    if (!editing.teamsQuantity || editing.teamsQuantity < 1) {
      setError("A quantidade de equipes é obrigatória e deve ser maior que 0");
      return;
    }

    const { id, file, ...rest } = editing as any;

    // ✅ Preparar payload limpo (removidos leaderProfileIds e teacherProfileIds - agora via Teams)
    const payload: any = {
      name: rest.name,
      description: rest.description,
      teamsQuantity: rest.teamsQuantity, // Campo obrigatório
      address: rest.address,
    };

    // ⚠️ IMPORTANTE: Só incluir mediaItem se realmente mudou
    if (file) {
      // Cenário 1: Upload de novo arquivo (form-data)
      const formData = new FormData();
      
      // Seguindo formato do guia: shelterData como string JSON
      const shelterData = {
        name: payload.name,
        description: payload.description,
        teamsQuantity: payload.teamsQuantity, // Campo obrigatório
        address: payload.address,
        mediaItem: {
          title: rest.mediaItem?.title || "Foto do Abrigo",
          description: rest.mediaItem?.description || "Imagem do abrigo",
          uploadType: "UPLOAD",
        }
      };
      
      formData.append('shelterData', JSON.stringify(shelterData));
      formData.append('image', file); // Campo conforme documentação
      
      await updateShelter(id, formData);
    } else if (rest.mediaItem && !rest.mediaItem.id) {
      // Cenário 2: Nova URL de link (sem ID = nova criação)
      payload.mediaItem = {
        title: rest.mediaItem.title || "Foto do Abrigo",
        description: rest.mediaItem.description || "Imagem do abrigo",
        url: rest.mediaItem.url,
        uploadType: "link",
      };
      await updateShelter(id, payload);
    } else {
      // Cenário 3: ✅ NÃO enviar mediaItem se não mudou
      // Backend detecta automaticamente e ignora
      await updateShelter(id, payload);
    }

    setEditing(null);
  };

  const [confirmDelete, setConfirmDelete] = useState<ShelterResponseDto | null>(null);
  const askDelete = (c: ShelterResponseDto) => setConfirmDelete(c);

  const submitDelete = async () => {
    if (!confirmDelete) return;
    await deleteShelter(confirmDelete.id);
    setConfirmDelete(null);
  };

  // Removido o useEffect duplicado - o useShelters já gerencia as requests automaticamente

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        pb: 4,
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BackHeader title="Gerenciar Abrigos" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <SheltersToolbar
            filters={filters}
            onChange={(updater) => {
              setFilters(updater);
              setPageIndex(0);
            }}
            onCreateClick={() => openCreate()}
            onRefreshClick={doRefresh}
            isXs={isXs}
          />
        </motion.div>

        {loading && !rows.length && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
            }}
          >
            <CircularProgress size={48} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Carregando abrigos...
            </Typography>
          </Box>
        )}

        {error && !loading && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 2 }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {!loading && !error && rows.length === 0 && (
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            <SearchIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum abrigo encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tente ajustar os filtros de busca ou criar um novo abrigo.
            </Typography>
          </Paper>
        )}

        {!loading && rows.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <SheltersTable
              isAdmin={isAdmin}
              rows={rows}
              total={total}
              pageIndex={pageIndex}
              pageSize={pageSize}
              setPageIndex={setPageIndex}
              setPageSize={setPageSize}
              sorting={sorting ? ([sorting] as any) : []}
              setSorting={(s) =>
                setSorting(Array.isArray(s) ? (s[0] ?? null) : (s as any))
              }
              onOpenView={handleOpenView}
              onStartEdit={(shelter) => startEdit(shelter)}
              onAskDelete={askDelete}
            />
          </motion.div>
        )}

      <ShelterViewDialog
        open={!!viewing}
        loading={viewingLoading}
        shelter={viewing}
        onClose={() => setViewing(null)}
      />

      <ShelterFormDialog
        mode="create"
        open={!!creating}
        value={creating}
        onChange={(v) => setCreating(v as CreateShelterForm)}
        onCancel={() => {
          setCreating(null);
          setDialogError("");
        }}
        onSubmit={submitCreate}
        error={dialogError}
        loading={dialogLoading}
        leaderOptions={leaders}
        teacherOptions={teachers}
      />

      <ShelterFormDialog
        mode="edit"
        open={!!editing}
        value={editing}
        onChange={(v) => setEditing(v as EditShelterForm)}
        onCancel={() => {
          setEditing(null);
          setDialogError("");
        }}
        onSubmit={submitEdit}
        error={dialogError}
        loading={dialogLoading}
        leaderOptions={leaders}
        teacherOptions={teachers}
      />

      <DeleteConfirmDialog
        open={!!confirmDelete}
        title={confirmDelete ? confirmDelete.name : ""}
        onClose={() => {
          setConfirmDelete(null);
          setDialogError("");
        }}
        onConfirm={submitDelete}
      />
      </Container>
    </Box>
  );
}
