import React from "react";
import { Box, Alert, CircularProgress } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";

import TeacherToolbar from "./components/TeacherToolbar";
import TeacherTable from "./components/TeacherTable";
import TeacherCards from "./components/TeacherCards";
import TeacherViewDialog from "./components/TeacherViewDialog";
import TeacherEditDialog from "./components/TeacherEditDialog";

import { useSheltersIndex, useTeacherMutations, useTeacherProfiles } from "./hooks";
import { TeacherProfile } from "./types";
import BackHeader from "@/components/common/header/BackHeader";

export type TeacherFilters = {
  q?: string;
  active?: boolean;
  hasShelter?: boolean;
  shelterName?: string;
};

export default function TeacherProfilesManager() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const [pageSize, setPageSize] = React.useState<number>(12);
  const [pageIndex, setPageIndex] = React.useState<number>(0);
  const [sorting, setSorting] = React.useState([{ id: "updatedAt", desc: true }]);

  const [filters, setFilters] = React.useState<TeacherFilters>({
    q: "",
    active: undefined,
    hasShelter: undefined,
    shelterId: undefined,
  });

  const { rows, total, loading, error, setError, fetchPage, refreshOne } =
    useTeacherProfiles(pageIndex, pageSize, sorting as any, {
      q: filters.q || undefined,
      searchString: undefined,
      active: filters.active,
      hasShelter: filters.hasShelter,
      shelterName: filters.shelterName,
    });

  const doRefresh = React.useCallback(() => {
    fetchPage();
  }, [fetchPage]);

  const {
    shelters,
    byId,
    loading: sheltersLoading,
    error: sheltersError,
    refresh: refreshShelters,
  } = useSheltersIndex();

  const { dialogLoading, dialogError, setDialogError, setShelter, clearShelter } =
    useTeacherMutations(fetchPage, refreshOne);

  const [viewing, setViewing] = React.useState<TeacherProfile | null>(null);
  const [editing, setEditing] = React.useState<TeacherProfile | null>(null);

  const onSetShelter = React.useCallback(
    async (teacher: TeacherProfile | null, shelterId: string) => {
      if (!teacher || !shelterId) return;
      try {
        await setShelter(teacher.id, shelterId);
        setEditing(null);
        setDialogError("");
        await Promise.all([fetchPage(), refreshShelters()]);
      } catch {
      }
    },
    [setShelter, fetchPage, refreshShelters, setDialogError]
  );

  const onClearShelter = React.useCallback(
    async (teacherId: string) => {
      try {
        await clearShelter(teacherId);
        setEditing((e) => (e?.id === teacherId ? null : e));
        setDialogError("");
        await Promise.all([fetchPage(), refreshShelters()]);
      } catch {
      }
    },
    [clearShelter, fetchPage, refreshShelters, setDialogError]
  );

  const handleFiltersChange = React.useCallback(
    (updater: (prev: TeacherFilters) => TeacherFilters) => {
      setFilters((prev) => updater(prev));
      setPageIndex(0);
    },
    []
  );

  React.useEffect(() => {
    const lastPage = Math.max(0, Math.ceil(total / pageSize) - 1);
    if (pageIndex > lastPage) setPageIndex(lastPage);
  }, [total, pageSize, pageIndex]);

  React.useEffect(() => {
    refreshShelters();
  }, [refreshShelters]);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 0 },
        py: { xs: 0, md: 0 },
        minHeight: "100vh",
        bgcolor: "#f9fafb"
      }}
    >
      <BackHeader title="Gerenciador de Professores" />

      <TeacherToolbar
        filters={filters}
        onChange={handleFiltersChange}
        onRefreshClick={doRefresh}
        isXs={isXs}
      />

      {(loading && !rows.length) || sheltersLoading ? (
        <Box textAlign="center" my={6}>
          <CircularProgress />
        </Box>
      ) : null}

      {(error || sheltersError) && !(loading || sheltersLoading) && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => {
            setError("");
            setDialogError("");
          }}
        >
          {error || sheltersError}
        </Alert>
      )}

      {isXs ? (
        <TeacherCards
          rows={rows}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
          sorting={sorting as any}
          setSorting={setSorting as any}
          onView={(t) => setViewing(t)}
          onEditLinks={(t) => setEditing(t)}
          onClearShelter={(teacherId) => onClearShelter(teacherId)}
        />
      ) : (
        <TeacherTable
          rows={rows}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
          sorting={sorting as any}
          setSorting={setSorting as any}
          onView={(t) => setViewing(t)}
          onEditLinks={(t) => setEditing(t)}
          onClearShelter={(teacherId) => onClearShelter(teacherId)}
        />
      )}

      <TeacherViewDialog
        open={!!viewing}
        teacher={viewing}
        onClose={() => setViewing(null)}
      />

      <TeacherEditDialog
        open={!!editing}
        teacher={editing}
        loading={dialogLoading}
        error={dialogError}
        shelters={shelters}
        onSetShelter={(shelterId) => onSetShelter(editing, shelterId)}
        onClearShelter={() => editing && onClearShelter(editing.id)}
        onClose={() => {
          setEditing(null);
          setDialogError("");
        }}
      />
    </Box>
  );
}
