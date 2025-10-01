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
    // Filtros principais
    shelterName: undefined,
    staffFilters: undefined,
    addressFilter: undefined,
    
    // Filtros legados para compatibilidade (mantidos temporariamente)
    addressSearchString: undefined,
    userSearchString: undefined,
    shelterSearchString: undefined,
    searchString: undefined,
    city: undefined,
    state: undefined,
    leaderId: undefined,
    teacherId: undefined,
    hasLeaders: undefined,
    hasTeachers: undefined,
    leaderIds: undefined,
    teacherIds: undefined,
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
      address: {
        street: "",
        district: "",
        city: "",
        state: "",
        postalCode: "",
      } as any,
      leaderProfileIds: [], // Mudou de leaderProfileId para leaderProfileIds[]
      teacherProfileIds: [],
    });
  };

  const submitCreate = async () => {
    if (!creating) return;

    const payload: CreateShelterForm = {
      ...creating,
      leaderProfileIds: sanitizeIds(creating.leaderProfileIds), // Mudou para leaderProfileIds
      teacherProfileIds: sanitizeIds(creating.teacherProfileIds),
    };

    if (!payload.teacherProfileIds?.length) delete (payload as any).teacherProfileIds;
    if (!payload.leaderProfileIds?.length) delete (payload as any).leaderProfileIds; // Mudou para leaderProfileIds

    await createShelter(payload);
    setCreating(null);
  };

  const [editing, setEditing] = useState<EditShelterForm | null>(null);

  const startEdit = async (c: ShelterResponseDto) => {
    await loadRefs(); // Carrega opções apenas quando necessário
    setEditing({
      id: c.id,
      name: c.name,
      address: c.address,
      leaderProfileIds: (c.leaders ?? []).map((l) => l.id), // Mudou de leader?.id para leaders.map
      teacherProfileIds: (c.teachers ?? []).map((t) => t.id),
    });
  };

  const submitEdit = async () => {
    if (!editing) return;

    const { id, ...rest } = editing;
    const leaderIds = sanitizeIds(rest.leaderProfileIds) ?? []; // Mudou para leaderProfileIds
    const teacherIds = sanitizeIds(rest.teacherProfileIds) ?? [];

    const payload: Omit<EditShelterForm, "id"> & { 
      leaderProfileIds: string[];
      teacherProfileIds: string[] 
    } = {
      ...rest,
      leaderProfileIds: leaderIds, // Mudou para leaderProfileIds
      teacherProfileIds: teacherIds,
    };

    await updateShelter(id, payload);
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
