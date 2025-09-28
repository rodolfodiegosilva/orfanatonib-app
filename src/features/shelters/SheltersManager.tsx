import React, { useCallback, useState } from "react";
import { Alert, Box, CircularProgress } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import SheltersToolbar from "./components/SheltersToolbar";
import SheltersTable from "./components/SheltersTable";
import ShelterViewDialog from "./components/ShelterViewDialog";
import ShelterFormDialog from "./components/ShelterFormDialog";
import { useShelterDetails, useShelterMutations, useShelters, useOptions } from "./hooks";
import {
  ShelterResponseDto,
  CreateShelterForm,
  EditShelterForm,
  Weekday,
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
    addressSearchString: "",
    userSearchString: "",
    shelterSearchString: "",
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

  const { leaders, teachers, reloadOptions } = useOptions();

  const {
    dialogLoading,
    dialogError,
    setDialogError,
    createShelter,
    updateShelter,
    deleteShelter,
  } = useShelterMutations(async (page, limit) => {
    await apiFetchShelters({ page, limit, filters, sort: sorting });
    await fetchPage();
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
  const openCreate = () =>
    setCreating({
      number: 0,
      weekday: "saturday" as Weekday,
      time: null,
      address: {
        street: "",
        district: "",
        city: "",
        state: "",
        postalCode: "",
      } as any,
      leaderProfileId: null,
      teacherProfileIds: [],
    });

  const submitCreate = async () => {
    if (!creating) return;

    const payload: CreateShelterForm = {
      ...creating,
      teacherProfileIds: sanitizeIds(creating.teacherProfileIds),
    };

    if (!payload.teacherProfileIds?.length) delete (payload as any).teacherProfileIds;

    if (
      payload.leaderProfileId === undefined ||
      payload.leaderProfileId === null
    ) {
      delete (payload as any).leaderProfileId;
    }

    if (payload.time === "") delete (payload as any).time;

    await createShelter(payload, pageIndex + 1, pageSize, filters, sorting);
    await reloadOptions();
    setCreating(null);
  };

  const [editing, setEditing] = useState<EditShelterForm | null>(null);

  const startEdit = (c: ShelterResponseDto) => {
    setEditing({
      id: c.id,
      number: c.number,
      weekday: c.weekday,
      time: c.time ?? null,
      address: c.address,
      leaderProfileId: c.leader?.id ?? null,
      teacherProfileIds: (c.teachers ?? []).map((t) => t.id),
    });
  };

  const submitEdit = async () => {
    if (!editing) return;

    const { id, ...rest } = editing;
    const teacherIds = sanitizeIds(rest.teacherProfileIds) ?? [];

    const payload: Omit<EditShelterForm, "id"> & { teacherProfileIds: string[] } = {
      ...rest,
      teacherProfileIds: teacherIds,
    };

    if ((payload as any).time === "") {
      (payload as any).time = null;
    }

    if (rest.leaderProfileId === undefined) {
      delete (payload as any).leaderProfileId;
    }

    await updateShelter(id, payload, pageIndex + 1, pageSize, filters, sorting);
    await reloadOptions();
    setEditing(null);
  };

  const [confirmDelete, setConfirmDelete] = useState<ShelterResponseDto | null>(null);
  const askDelete = (c: ShelterResponseDto) => setConfirmDelete(c);

  const submitDelete = async () => {
    if (!confirmDelete) return;
    await deleteShelter(confirmDelete.id, pageIndex + 1, pageSize, filters, sorting);
    await reloadOptions();
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
        onStartEdit={startEdit}
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
        title={confirmDelete ? `#${confirmDelete.number}` : ""}
        onClose={() => {
          setConfirmDelete(null);
          setDialogError("");
        }}
        onConfirm={submitDelete}
      />
    </Box>
  );
}
