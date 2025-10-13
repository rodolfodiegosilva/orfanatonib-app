import React, { useCallback, useState } from "react";
import { Alert, Box, CircularProgress } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
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
      address: {
        street: "",
        district: "",
        city: "",
        state: "",
        postalCode: "",
      } as any,
      leaderProfileIds: [], // Mudou de leaderProfileId para leaderProfileIds[]
      teacherProfileIds: [],
      mediaItem: undefined,
      file: undefined,
    });
  };

  const submitCreate = async () => {
    if (!creating) return;

    const { file, ...rest } = creating as any;
    
    // Preparar payload limpo (seguindo guia do backend)
    const payload: any = {
      name: rest.name,
      description: rest.description,
      address: rest.address,
      leaderProfileIds: sanitizeIds(rest.leaderProfileIds),
      teacherProfileIds: sanitizeIds(rest.teacherProfileIds),
    };

    // Remover arrays vazios (backend não precisa deles)
    if (!payload.teacherProfileIds?.length) delete payload.teacherProfileIds;
    if (!payload.leaderProfileIds?.length) delete payload.leaderProfileIds;

    // Tratar mediaItem (3 cenários do guia)
    if (file) {
      // Cenário 1: Upload de arquivo (form-data)
      const formData = new FormData();
      
      // Seguindo formato do guia: shelterData como string JSON
      const shelterData = {
        name: payload.name,
        description: payload.description,
        address: payload.address,
        leaderProfileIds: payload.leaderProfileIds,
        teacherProfileIds: payload.teacherProfileIds,
        mediaItem: {
          title: rest.mediaItem?.title || "Foto do Abrigo",
          description: rest.mediaItem?.description || "Imagem do abrigo",
          uploadType: "upload",
          isLocalFile: true,
          fieldKey: "shelterImage"
        }
      };
      
      formData.append('shelterData', JSON.stringify(shelterData));
      formData.append('shelterImage', file);
      
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
      address: c.address,
      leaderProfileIds: (c.leaders ?? []).map((l) => l.id), // Mudou de leader?.id para leaders.map
      teacherProfileIds: (c.teachers ?? []).map((t) => t.id),
      mediaItem: c.mediaItem ? {
        title: c.mediaItem.title,
        description: c.mediaItem.description,
        uploadType: c.mediaItem.uploadType,
        url: c.mediaItem.url,
        isLocalFile: c.mediaItem.isLocalFile,
      } : undefined,
      file: undefined,
      _originalLeaders: c.leaders ?? [], // Guardar líderes originais
      _originalTeachers: c.teachers ?? [], // Guardar professores originais
    } as any);
  };

  const submitEdit = async () => {
    if (!editing) return;

    const { id, file, _originalLeaders, _originalTeachers, ...rest } = editing as any;
    const leaderIds = sanitizeIds(rest.leaderProfileIds) ?? [];
    const teacherIds = sanitizeIds(rest.teacherProfileIds) ?? [];

    // ✅ Preparar payload limpo (seguindo guia: apenas campos que mudaram)
    const payload: any = {
      name: rest.name,
      description: rest.description,
      address: rest.address,
      leaderProfileIds: leaderIds,
      teacherProfileIds: teacherIds,
    };

    // Remover arrays vazios
    if (!payload.teacherProfileIds?.length) delete payload.teacherProfileIds;
    if (!payload.leaderProfileIds?.length) delete payload.leaderProfileIds;

    // ⚠️ IMPORTANTE: Só incluir mediaItem se realmente mudou
    if (file) {
      // Cenário 1: Upload de novo arquivo (form-data)
      const formData = new FormData();
      
      // Seguindo formato do guia: shelterData como string JSON
      const shelterData = {
        name: payload.name,
        description: payload.description,
        address: payload.address,
        leaderProfileIds: payload.leaderProfileIds,
        teacherProfileIds: payload.teacherProfileIds,
        mediaItem: {
          title: rest.mediaItem?.title || "Foto do Abrigo",
          description: rest.mediaItem?.description || "Imagem do abrigo",
          uploadType: "upload",
          isLocalFile: true,
          fieldKey: "shelterImage"
        }
      };
      
      formData.append('shelterData', JSON.stringify(shelterData));
      formData.append('shelterImage', file);
      
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
        px: { xs: 2, md: 0 },
        py: { xs: 0, md: 0 },
        minHeight: "100vh",
        bgcolor: "#f9fafb",
      }}
    >
      <BackHeader title="Gerenciar Abrigos" />

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

      {loading && !rows.length && (
        <Box textAlign="center" my={6}>
          <CircularProgress />
        </Box>
      )}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

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
    </Box>
  );
}
