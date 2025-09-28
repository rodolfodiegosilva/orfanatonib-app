import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Divider, Chip, Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { LeaderProfile } from "../types";
import CircularProgress from "@mui/material/CircularProgress";
import { fmtDate } from "@/utils/dates";

type Props = {
  open: boolean;
  loading?: boolean;
  leader: LeaderProfile | null;
  onClose: () => void;
};

export default function LeaderViewDialog({ open, loading, leader, onClose }: Props) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const teachers = React.useMemo(() => {
    if (!leader?.shelters) return [];
    return leader.shelters.flatMap(c => c.teachers ?? []);
  }, [leader]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Detalhes do Coordenador</DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {loading && <Box textAlign="center" my={2}><CircularProgress size={24} /></Box>}
        {!!leader && (
          <Grid container spacing={2}>
            <Grid item xs={12}><strong>Nome:</strong> {leader.user.name ?? "—"}</Grid>
            <Grid item xs={12}><strong>Email:</strong> {leader.user.email ?? "—"}</Grid>

            <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

            <Grid item xs={12}><strong>Shelterinhos</strong></Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {(leader.shelters ?? []).map((c) => <Chip key={c.id} label={`#${c.number ?? "?"}`} />)}
              </Box>
            </Grid>

            <Grid item xs={12}><strong>Professores</strong></Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {teachers.length === 0 ? <Chip label="—" /> : teachers.map((t) => (
                  <Chip key={t.id} label={t.user?.name || t.user?.email || t.id} />
                ))}
              </Box>
            </Grid>

            {isMdUp && (
              <>
                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                <Grid item xs={12} md={6}><strong>Criado:</strong> {fmtDate(leader.createdAt)}</Grid>
                <Grid item xs={12} md={6}><strong>Atualizado:</strong> {fmtDate(leader.updatedAt)}</Grid>
              </>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Fechar</Button></DialogActions>
    </Dialog>
  );
}
