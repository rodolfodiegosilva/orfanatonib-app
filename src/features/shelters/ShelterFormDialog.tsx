import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Divider,
  Typography, Alert, TextField, FormControl, InputLabel, Select, MenuItem,
  useTheme, useMediaQuery, Box
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import AddressFields from "./form/AddressFields";
import LeaderSelect from "./form/LeaderSelect";
import TeachersSelect from "./form/TeachersSelect";
import ShelterMediaForm from "./form/ShelterMediaForm";
import {
  LeaderOption, CreateShelterForm, EditShelterForm, TeacherOption
} from "./types";
import { useSelector } from "react-redux";
import { selectIsAdmin } from "@/store/selectors/routeSelectors";

type Props = {
  mode: "create" | "edit";
  open: boolean;
  value: CreateShelterForm | EditShelterForm | null;
  onChange: (val: CreateShelterForm | EditShelterForm) => void;
  onCancel: () => void;
  onSubmit: () => void;
  error: string;
  loading: boolean;
  leaderOptions: LeaderOption[];
  teacherOptions: TeacherOption[];
};

export default function ShelterFormDialog({
  mode, open, value, onChange, onCancel, onSubmit,
  error, loading, leaderOptions, teacherOptions,
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const teachersKey = React.useMemo(
    () => (teacherOptions ?? [])
      .map(t => `${t.teacherProfileId}:${t.vinculado ? 1 : 0}`)
      .join("|"),
    [teacherOptions]
  );
  const isAdmin = useSelector(selectIsAdmin);
  const isCreate = mode === "create";

  // Adicionar líderes já vinculados ao shelter atual às opções
  const enrichedLeaderOptions = React.useMemo(() => {
    if (!value || mode === "create") return leaderOptions;
    
    const currentLeaderIds = (value as any).leaderProfileIds ?? [];
    const currentLeaders = (value as any)._originalLeaders ?? [];
    
    // Criar uma lista completa de opções
    const allOptions = [...leaderOptions];
    const existingIds = new Set(leaderOptions.map(l => l.leaderProfileId));
    
    // Adicionar líderes que já estão selecionados mas não estão nas opções
    currentLeaders.forEach((leader: any) => {
      if (!existingIds.has(leader.id)) {
        allOptions.push({
          leaderProfileId: leader.id,
          name: leader.user?.name || leader.user?.email || leader.id,
        });
      }
    });
    
    return allOptions;
  }, [leaderOptions, value, mode]);

  // Adicionar professores já vinculados ao shelter atual às opções
  const enrichedTeacherOptions = React.useMemo(() => {
    if (!value || mode === "create") return teacherOptions;
    
    const currentTeacherIds = (value as any).teacherProfileIds ?? [];
    const currentTeachers = (value as any)._originalTeachers ?? [];
    
    // Criar uma lista completa de opções
    const allOptions = [...teacherOptions];
    const existingIds = new Set(teacherOptions.map(t => t.teacherProfileId));
    
    // Adicionar professores que já estão selecionados mas não estão nas opções
    currentTeachers.forEach((teacher: any) => {
      if (!existingIds.has(teacher.id)) {
        allOptions.push({
          teacherProfileId: teacher.id,
          name: teacher.user?.name || teacher.user?.email || teacher.id,
          vinculado: true, // Marcar como vinculado
        });
      }
    });
    
    return allOptions;
  }, [teacherOptions, value, mode]);

  // Estados locais para mídia (sem título e descrição)
  const [uploadType, setUploadType] = useState<"upload" | "link">("upload"); // Padrão: upload
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Carregar dados de mídia existentes ao editar
  useEffect(() => {
    if (value?.mediaItem) {
      setUploadType(value.mediaItem.uploadType || "upload");
      setUrl(value.mediaItem.url || "");
    } else {
      setUploadType("upload"); // Padrão: upload
      setUrl("");
      setFile(null);
    }
  }, [value?.mediaItem]);

  // Atualizar mídia apenas quando houver mudança nos campos
  const updateMediaItem = (newUrl?: string, newFile?: File | null) => {
    if (!value) return;

    const mediaItem = (newUrl || newFile) ? {
      title: "Foto do Abrigo", // Valor padrão
      description: "Imagem do abrigo", // Valor padrão
      uploadType,
      url: uploadType === "link" ? (newUrl || url) : "",
      isLocalFile: uploadType === "upload",
      fieldKey: "shelterImage",
    } : undefined;

    onChange({
      ...value,
      mediaItem,
      file: uploadType === "upload" ? (newFile !== undefined ? newFile || undefined : file || undefined) : undefined,
    } as any);
  };

  // Função para remover imagem existente
  const handleRemoveExistingImage = () => {
    setUrl("");
    setFile(null);
    onChange({
      ...value,
      mediaItem: undefined,
      file: undefined,
    } as any);
  };

  if (!value) return null;

  const teachers = (value as any).teacherProfileIds ?? [];
  const leaders = (value as any).leaderProfileIds ?? [];
  const name = (value as any).name ?? "";
  const description = (value as any).description ?? "";

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          width: isXs ? "98vw" : undefined,
          maxWidth: isXs ? "98vw" : undefined,
          m: isXs ? 0 : undefined,
        },
      }}
    >
      <DialogTitle>{isCreate ? "Criar Abrigo" : "Editar Abrigo"}</DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Nome do Abrigo"
              type="text"
              fullWidth
              value={name}
              onChange={(e) => onChange({ ...value, name: e.target.value } as any)}
              placeholder="Ex: Abrigo Central 1"
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Descrição"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => onChange({ ...value, description: e.target.value } as any)}
              placeholder="Descrição do abrigo, missão, objetivos..."
            />
          </Grid>

          {isAdmin && (
            <Grid item xs={12} md={12}>
              <LeaderSelect
                value={leaders}
                options={enrichedLeaderOptions}
                onChange={(val) =>
                  onChange({ ...value, leaderProfileIds: val } as any)
                }
                multiple={true} // Adicionado para suportar múltiplos líderes
              />
            </Grid>
          )}

          <Grid item xs={12}><Divider /></Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={700}>Endereço</Typography>
          </Grid>
          <AddressFields
            value={(value as any).address ?? {}}
            onChange={(addr) => onChange({ ...value, address: addr } as any)}
          />

          <Grid item xs={12}><Divider /></Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={700}>Professores</Typography>
          </Grid>
          <Grid item xs={12}>
            <TeachersSelect
              key={teachersKey}
              value={teachers}
              options={enrichedTeacherOptions}
              onChange={(ids) =>
                onChange({ ...value, teacherProfileIds: ids } as any)
              }
            />
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          {/* Seção de Mídia */}
          <ShelterMediaForm
            uploadType={uploadType}
            setUploadType={setUploadType}
            url={url}
            setUrl={setUrl}
            file={file}
            setFile={setFile}
            existingImageUrl={value.mediaItem?.url}
            onRemoveExistingImage={handleRemoveExistingImage}
            onUrlChange={(newUrl) => updateMediaItem(newUrl, undefined)}
            onFileChange={(newFile) => updateMediaItem(undefined, newFile)}
          />
        </Grid>

        {loading && (
          <Typography align="center" sx={{ mt: 2 }}>
            <CircularProgress size={24} />
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} sx={{ color: "text.secondary" }}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {isCreate ? "Criar" : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
