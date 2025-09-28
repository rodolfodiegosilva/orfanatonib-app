import React, { useCallback, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ShelteredToolbar from "./components/ShelteredToolbar";
import ShelteredTable from "./components/ShelteredTable";
import ShelteredViewDialog from "./components/ShelteredViewDialog";
import ShelteredFormDialog from "./components/ShelteredFormDialog";
import DeleteConfirmDialog from "@/components/common/modal/DeleteConfirmDialog";
import { useShelteredDetails, useShelteredMutations, useSheltered } from "./hooks";
import {
  ShelteredFilters,
  ShelteredResponseDto,
  ShelteredSort,
  CreateShelteredForm,
  EditShelteredForm,
} from "./types";
import BackHeader from "@/components/common/header/BackHeader";

export default function ShelteredManager() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const [filters, setFilters] = useState<ShelteredFilters>({
    searchString: "",
    shelterNumber: undefined,
    birthDateFrom: "",
    birthDateTo: "",
    joinedFrom: "",
    joinedTo: "",
  });

  const [pageSize, setPageSize] = useState<number>(12);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [sorting, setSorting] = useState<ShelteredSort>({
    id: "updatedAt",
    desc: true,
  });

  const { rows, total, loading, error, setError, fetchPage } = useSheltered(
    pageIndex,
    pageSize,
    sorting,
    filters
  );
  const doRefresh = useCallback(() => {
    fetchPage();
  }, [fetchPage]);

  const {
    viewing,
    setViewing,
    loading: viewingLoading,
    fetchSheltered,
  } = useShelteredDetails();
  const handleOpenView = (row: ShelteredResponseDto) => {
    setViewing(row);
    fetchSheltered(row.id);
  };

  const {
    dialogLoading,
    dialogError,
    setDialogError,
    createSheltered,
    updateSheltered,
    deleteSheltered,
  } = useShelteredMutations(async () => {
    await fetchPage();
  });

  const [creating, setCreating] = useState<CreateShelteredForm | null>(null);
  const openCreate = () =>
    setCreating({
      name: "",
      gender: "M",
      guardianName: "",
      guardianPhone: "",
      birthDate: "",
      joinedAt: null,
      shelterId: null,
      address: {
        street: "",
        district: "",
        city: "",
        state: "",
        postalCode: "",
      } as any,
    });
  const submitCreate = async () => {
    if (!creating) return;
    const payload = { ...creating };
    if (!payload.joinedAt) payload.joinedAt = null;
    if (!payload.shelterId) payload.shelterId = null as any;
    await createSheltered(payload, pageIndex + 1, pageSize, filters, sorting);
    setCreating(null);
  };

  const [editing, setEditing] = useState<EditShelteredForm | null>(null);
  const startEdit = (c: ShelteredResponseDto) => {
    setEditing({
      id: c.id,
      name: c.name,
      gender: c.gender,
      guardianName: c.guardianName,
      guardianPhone: c.guardianPhone,
      birthDate: c.birthDate,
      joinedAt: c.joinedAt,
      shelterId: c.shelter?.id ?? null,
      address: c.address ? ({ ...c.address } as any) : undefined,
    });
  };
  const submitEdit = async () => {
    if (!editing) return;
    const { id, ...rest } = editing;
    await updateSheltered(id, rest, pageIndex + 1, pageSize, filters, sorting);
    setEditing(null);
  };

  const [confirmDelete, setConfirmDelete] = useState<ShelteredResponseDto | null>(
    null
  );
  const askDelete = (row: ShelteredResponseDto) => setConfirmDelete(row);
  const submitDelete = async () => {
    if (!confirmDelete) return;
    await deleteSheltered(
      confirmDelete.id,
      pageIndex + 1,
      pageSize,
      filters,
      sorting
    );
    setConfirmDelete(null);
  };

  React.useEffect(() => {
    doRefresh();
  }, [doRefresh]);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 0 },
        py: { xs: 0, md: 0 },
        minHeight: "100vh",
        bgcolor: "#f9fafb"
      }}
    >
      <BackHeader title="Gerenciar Crianças" />

      <ShelteredToolbar
        filters={filters}
        onChange={(updater) => {
          setFilters(updater);
          setPageIndex(0);
        }}
        onCreateClick={openCreate}
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

      <ShelteredTable
        rows={rows}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
        sorting={sorting ? ([sorting] as any) : []}
        setSorting={(s) => setSorting(Array.isArray(s) ? s[0] ?? null : (s as any))}
        onOpenView={handleOpenView}
        onStartEdit={startEdit}
        onAskDelete={askDelete}
      />

      <ShelteredViewDialog
        open={!!viewing}
        loading={viewingLoading}
        sheltered={viewing}
        onClose={() => setViewing(null)}
      />

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

      <DeleteConfirmDialog
        open={!!confirmDelete}
        title={confirmDelete?.name || ""}
        onClose={() => {
          setConfirmDelete(null);
          setDialogError("");
        }}
        onConfirm={submitDelete}
      />
    </Box>
  );
}
