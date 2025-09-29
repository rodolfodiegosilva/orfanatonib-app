import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
  Chip,
  Box,
  Typography,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  IconButton,
  Link,
  useMediaQuery,
  useTheme,
  Avatar,
} from "@mui/material";
import {
  CalendarToday,
  NumbersOutlined,
  PersonOutline,
  SchoolOutlined,
  PlaceOutlined,
  Update as UpdateIcon,
  LocationCityOutlined,
  MapOutlined,
  LocalPostOfficeOutlined,
  ContentCopy,
  Phone as PhoneIcon,
  WhatsApp,
} from "@mui/icons-material";
import { ShelterResponseDto } from "./types";
import { fmtDate } from "@/utils/dates";
import { CopyButton, initials } from "@/utils/components";

type Props = {
  open: boolean;
  loading: boolean;
  shelter: ShelterResponseDto | null;
  onClose: () => void;
};


function LineCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          {icon}
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}


export default function ShelterViewDialog({ open, loading, shelter, onClose }: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  
  const address = shelter?.address;
  const teachers = shelter?.teachers ?? [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          width: isXs ? "98%" : "44rem",
          m: 0,
          borderRadius: { xs: 2, sm: 3 },
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 3 },
          pb: { xs: 1.25, sm: 1.5 },
          background:
            "linear-gradient(135deg, rgba(76,175,80,.08) 0%, rgba(2,136,209,.08) 100%)",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {!shelter ? (
          <Typography variant="h6">Detalhes do Abrigo</Typography>
        ) : (
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "success.main",
                  color: "success.contrastText",
                  fontWeight: 700,
                }}
                aria-label="avatar do shelterinho"
              >
                {initials(`Abrigo ${shelter.name}`)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  flexWrap="wrap"
                >
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    noWrap={!isXs}
                    title={`Abrigo ${shelter.name}`}
                  >
                    Abrigo {shelter.name}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Stack>
        )}
      </Box>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {loading && !shelter && (
          <Box textAlign="center" my={2}>
            <Skeleton height={28} width="60%" sx={{ mx: "auto", mb: 2 }} />
            <Skeleton height={20} />
            <Skeleton height={20} />
            <Skeleton height={120} sx={{ mt: 2 }} />
          </Box>
        )}

        {!shelter ? (
          <Typography variant="body1" color="text.secondary">
            Nenhum shelterinho selecionado.
          </Typography>
        ) : (
          <Stack spacing={2}>
            <Grid container spacing={1.25}>
              <Grid item xs={12} sm={6}>
                <LineCard icon={<NumbersOutlined fontSize="small" />} title="Nome">
                  <Typography variant="body1" fontWeight={600}>
                    {shelter.name}
                  </Typography>
                </LineCard>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LineCard icon={<UpdateIcon fontSize="small" />} title="Atualizado em">
                  <Typography variant="body1">
                    {fmtDate(shelter.updatedAt)}
                  </Typography>
                </LineCard>
              </Grid>
            </Grid>

            {/* Status */}
            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
                <Chip
                  size="small"
                  label={`Professores: ${teachers.length}`}
                  color={teachers.length > 0 ? "info" : "default"}
                  variant={teachers.length > 0 ? "filled" : "outlined"}
                />
                <Chip
                  size="small"
                  label={`Líder: ${shelter.leader ? "Vinculado" : "Não vinculado"}`}
                  color={shelter.leader ? "success" : "default"}
                  variant={shelter.leader ? "filled" : "outlined"}
                />
              </Stack>
            </Paper>

            {address && (
              <Grid container spacing={1.25}>
                <Grid item xs={12}>
                  <LineCard icon={<PlaceOutlined fontSize="small" />} title="Endereço">
                    <Stack spacing={0.5}>
                      <Typography variant="body1" fontWeight={600}>
                        {address.street}
                        {address.number && `, ${address.number}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {address.district} • {address.city} - {address.state}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        CEP: {address.postalCode}
                      </Typography>
                    </Stack>
                  </LineCard>
                </Grid>
              </Grid>
            )}

            <Grid container spacing={1.25}>
              <Grid item xs={12}>
                <LineCard icon={<PersonOutline fontSize="small" />} title="Líder">
                  {shelter.leader ? (
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="body1" fontWeight={600}>
                        {shelter.leader.user?.name || shelter.leader.user?.email || shelter.leader.id}
                      </Typography>
                      {shelter.leader.user?.phone && (
                        <>
                          <Link href={`tel:${shelter.leader.user.phone}`} underline="hover">
                            {shelter.leader.user.phone}
                          </Link>
                          <CopyButton value={shelter.leader.user.phone} title="Copiar telefone" />
                        </>
                      )}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Nenhum líder vinculado
                    </Typography>
                  )}
                </LineCard>
              </Grid>
            </Grid>

            <Grid container spacing={1.25}>
              <Grid item xs={12}>
                <LineCard icon={<SchoolOutlined fontSize="small" />} title="Professores">
                  {teachers.length > 0 ? (
                    <Stack spacing={1}>
                      {teachers.map((teacher) => (
                        <Box key={teacher.id}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography variant="body1" fontWeight={600}>
                              {teacher.user?.name || teacher.user?.email || teacher.id}
                            </Typography>
                            {teacher.user?.phone && (
                              <>
                                <Link href={`tel:${teacher.user.phone}`} underline="hover">
                                  {teacher.user.phone}
                                </Link>
                                <CopyButton value={teacher.user.phone} title="Copiar telefone" />
                              </>
                            )}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Nenhum professor vinculado
                    </Typography>
                  )}
                </LineCard>
              </Grid>
            </Grid>
          </Stack>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 1.5, sm: 2 },
          gap: 1,
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <Button fullWidth={isXs} onClick={onClose} variant="outlined">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
