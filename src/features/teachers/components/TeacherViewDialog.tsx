import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
  Typography,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { TeacherProfile } from "../types";
import { fmtDate } from "@/utils/dates";

type Props = {
  open: boolean;
  teacher: TeacherProfile | null;
  onClose: () => void;
};

export default function TeacherViewDialog({ open, teacher, onClose }: Props) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const shelterNumber =
    teacher?.shelter?.number != null ? `#${teacher.shelter.number}` : "—";
  const coordName =
    teacher?.shelter?.leader?.user?.name ||
    teacher?.shelter?.leader?.user?.email ||
    "—";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Detalhes do Professor</DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {!!teacher && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {teacher.user.name || teacher.user.email || "—"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {teacher.user.email || "—"}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Shelterinho:
                </Typography>
                {teacher.shelter?.number != null ? (
                  <Chip size="small" color="primary" label={shelterNumber} />
                ) : (
                  <Typography variant="body2">—</Typography>
                )}
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2">
                <strong>Coordenador:</strong> {coordName}
              </Typography>
            </Grid>

            {isMdUp && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Criado:</strong> {fmtDate(teacher.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Atualizado:</strong> {fmtDate(teacher.updatedAt)}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
