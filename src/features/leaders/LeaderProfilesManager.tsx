import React from "react";
import {
  Box,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Snackbar,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import type { SortingState } from "@tanstack/react-table";
import LeaderToolbar from "./components/LeaderToolbar";
import LeaderTable from "./components/LeaderTable";
import LeaderCards from "./components/LeaderCards";
import LeaderViewDialog from "./components/LeaderViewDialog";
import LeaderLinkDialog from "./components/LeaderLinkDialog";
import {
  useLeaderMutations,
  useLeaderProfiles,
  useSheltersIndex,
} from "./hooks";
import type { LeaderFilters, LeaderProfile } from "./types";
import BackHeader from "@/components/common/header/BackHeader";

export default function LeaderProfilesManager() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [pageSize, setPageSize] = React.useState<number>(12);
  const [pageIndex, setPageIndex] = React.useState<number>(0);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);

  const [filters, setFilters] = React.useState<LeaderFilters>({});

  const { rows, total, loading, error, setError, fetchPage, refreshOne } =
    useLeaderProfiles(pageIndex, pageSize, sorting, filters);

  const doRefresh = React.useCallback(() => {
    fetchPage();
  }, [fetchPage]);

  const {
    byNumber,
    loading: sheltersLoading,
    error: sheltersError,
    refresh: refreshShelters,
  } = useSheltersIndex();

  const [snack, setSnack] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const showSnack = React.useCallback(
    (message: string, severity: typeof snack.severity = "success") => {
      setSnack({ open: true, message, severity });
    },
    []
  );

  const closeSnack = (_?: unknown, reason?: string) => {
    if (reason === "clickaway") return;
    setSnack((s) => ({ ...s, open: false }));
  };

  const [viewing, setViewing] = React.useState<LeaderProfile | null>(null);
  const [linking, setLinking] = React.useState<LeaderProfile | null>(null);
  const [linkNumber, setLinkNumber] = React.useState<string>("");
  const [unlinkNumber, setUnlinkNumber] = React.useState<string>("");

  const {
    dialogLoading,
    dialogError,
    setDialogError,
    assignShelter,
    unassignShelter,
  } = useLeaderMutations(fetchPage, refreshOne);

  const closeLinkDialog = React.useCallback(() => {
    setLinking(null);
    setDialogError("");
    setLinkNumber("");
    setUnlinkNumber("");
  }, [setDialogError]);

  const onLinkConfirm = async () => {
    if (!linking?.id || !linkNumber) return;
    const num = Number(linkNumber);
    const shelter = byNumber.get(num);
    if (!num || !shelter) {
      setDialogError("Abrigo não encontrado pelo número informado.");
      return;
    }
    try {
      const msg = await assignShelter(linking.id, shelter.id);
      showSnack(msg || "Shelter atribuído ao líder com sucesso", "success");
      closeLinkDialog();
    } catch {
      showSnack("Falha ao vincular shelterinho", "error");
    }
  };

  const onUnlinkConfirm = async () => {
    if (!linking?.id || !unlinkNumber) return;
    const num = Number(unlinkNumber);
    const shelter = byNumber.get(num);
    if (!num || !shelter) {
      setDialogError("Abrigo não encontrado pelo número informado.");
      return;
    }
    try {
      const msg = await unassignShelter(linking.id, shelter.id);
      showSnack(msg || "Shelter removido do líder com sucesso", "success");
      closeLinkDialog();
    } catch {
      showSnack("Falha ao desvincular shelterinho", "error");
    }
  };

  React.useEffect(() => {
    doRefresh();
  }, [doRefresh]);
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
      <BackHeader title="Gerenciar Líderes" />
      <LeaderToolbar
        filters={filters}
        onChange={(updater) => {
          setFilters(updater);
          setPageIndex(0);
        }}
        onRefresh={doRefresh}
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
        <LeaderCards
          rows={rows}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
          sorting={sorting}
          setSorting={setSorting}
          onView={(c) => setViewing(c)}
          onLink={(c) => setLinking(c)}
        />
      ) : (
        <LeaderTable
          rows={rows}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
          sorting={sorting}
          setSorting={setSorting}
          onView={(c) => setViewing(c)}
          onLink={(c) => setLinking(c)}
        />
      )}

      <LeaderViewDialog
        open={!!viewing}
        leader={viewing}
        onClose={() => setViewing(null)}
      />

      <LeaderLinkDialog
        open={!!linking}
        leader={linking}
        linkNumber={linkNumber}
        unlinkNumber={unlinkNumber}
        onChangeLink={setLinkNumber}
        onChangeUnlink={setUnlinkNumber}
        onLink={onLinkConfirm}
        onUnlink={onUnlinkConfirm}
        loading={dialogLoading}
        error={dialogError}
        onClose={closeLinkDialog}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={snack.severity}
          onClose={closeSnack}
        >
          {snack.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
